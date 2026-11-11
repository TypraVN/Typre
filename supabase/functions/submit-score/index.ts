/**
 * Nhận một lượt gõ, CHẤM LẠI từ bản ghi phím, rồi mới ghi vào bảng xếp hạng.
 *
 * Trước đây trình duyệt tự ghi điểm vào bảng `scores`: ai đăng nhập cũng gửi thẳng được
 * "250 wpm" qua API mà không gõ chữ nào. Giờ trình duyệt chỉ gửi bản ghi phím; function
 * này chạy lại bản ghi bằng đúng bộ luật gõ của app (`_shared/typingCore.ts`), loại lượt
 * có nhịp gõ không giống người, và ghi bằng service role. Quyền ghi trực tiếp của người
 * dùng bị thu hồi trong `verify-scores.sql`.
 *
 * Biến môi trường (Supabase tự đặt sẵn, không phải khai): SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY. Tuỳ chọn: SNIPPET_INDEX_URL (mặc định kho trên typre.dev).
 *
 * Mọi câu trả lời nghiệp vụ đều là 200 + `{ ok, error }`: trình duyệt cần đọc được LÝ DO
 * (vd nhịp gõ như bot) để nói với người chơi, mà mã lỗi HTTP thì supabase-js nuốt mất thân.
 */
import { parseSubmission, verifyRun, type SnippetIndex } from './verify.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const DEFAULT_INDEX_URL = 'https://www.typre.dev/snippet-index.json'

/** Kho bài đọc lại sau ngần này — site deploy bài mới thì function tự thấy. */
const INDEX_TTL_MS = 10 * 60 * 1000

/** Hai lần gửi của cùng một người phải cách nhau tối thiểu ngần này. */
const MIN_GAP_MS = 3000

let cachedIndex: { data: SnippetIndex; at: number } | null = null

function reply(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

async function loadIndex(force: boolean): Promise<SnippetIndex | null> {
  const fresh = cachedIndex && Date.now() - cachedIndex.at < INDEX_TTL_MS
  if (cachedIndex && fresh && !force) return cachedIndex.data

  const url = Deno.env.get('SNIPPET_INDEX_URL') ?? DEFAULT_INDEX_URL
  try {
    const res = await fetch(url)
    if (!res.ok) return cachedIndex?.data ?? null
    const data = (await res.json()) as SnippetIndex
    cachedIndex = { data, at: Date.now() }
    return data
  } catch {
    return cachedIndex?.data ?? null
  }
}

interface AuthUser {
  id: string
  email?: string
  user_metadata?: { full_name?: string; name?: string; avatar_url?: string; picture?: string }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return reply({ ok: false, error: 'bad-request' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    console.error('thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
    return reply({ ok: false, error: 'server-not-ready' })
  }

  // ── Ai đang gửi: hỏi Supabase Auth bằng chính token của người dùng ──────────
  const auth = req.headers.get('Authorization') ?? ''
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: auth, apikey: serviceKey },
  })
  if (!userRes.ok) return reply({ ok: false, error: 'not-signed-in' })
  const user = (await userRes.json()) as AuthUser

  // ── Đọc và chấm lại lượt gõ ────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return reply({ ok: false, error: 'bad-request' })
  }
  const sub = parseSubmission(body)
  if (!sub) return reply({ ok: false, error: 'bad-request' })

  let index = await loadIndex(false)
  if (!index) return reply({ ok: false, error: 'server-not-ready' })
  // Bài vừa thêm mà kho trong bộ nhớ còn cũ: đọc lại một lần trước khi kết luận "bài lạ".
  if (!index.snippets[sub.snippetId] && cachedIndex && Date.now() - cachedIndex.at > 60_000) {
    index = (await loadIndex(true)) ?? index
  }

  const verdict = verifyRun(sub, index)
  if (!verdict.ok) {
    console.log(`từ chối ${user.id}: ${verdict.error} (${sub.language} ${sub.timeLimit}s ${sub.snippetId})`)
    return reply({ ok: false, error: verdict.error })
  }
  const score = verdict.score

  const rest = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }

  // ── Chặn gửi dồn dập ───────────────────────────────────────────────────────
  const lastRes = await fetch(
    `${supabaseUrl}/rest/v1/scores?user_id=eq.${user.id}&select=created_at&order=created_at.desc&limit=1`,
    { headers: rest },
  )
  if (lastRes.ok) {
    const [last] = (await lastRes.json()) as Array<{ created_at: string }>
    if (last && Date.now() - new Date(last.created_at).getTime() < MIN_GAP_MS) {
      return reply({ ok: false, error: 'too-soon' })
    }
  }

  // ── Tên và ảnh lấy từ hồ sơ trên server, không lấy từ trình duyệt ───────────
  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=display_name,avatar_url`,
    { headers: rest },
  )
  const [profile] = profileRes.ok
    ? ((await profileRes.json()) as Array<{ display_name: string | null; avatar_url: string | null }>)
    : []
  const meta = user.user_metadata ?? {}
  const displayName = (
    profile?.display_name ||
    meta.full_name ||
    meta.name ||
    user.email?.split('@')[0] ||
    'player'
  ).slice(0, 60)
  const avatarUrl = profile?.avatar_url ?? meta.avatar_url ?? meta.picture ?? null

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/scores`, {
    method: 'POST',
    headers: { ...rest, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({
      user_id: user.id,
      display_name: displayName,
      avatar_url: avatarUrl,
      language: score.language,
      time_limit: score.timeLimit,
      wpm: score.wpm,
      cpm: score.cpm,
      raw_wpm: score.rawWpm,
      consistency: score.consistency,
      accuracy: score.accuracy,
      snippet_id: score.snippetId,
      strict: score.strict,
      run_id: score.runId,
      verified: true,
    }),
  })

  if (!insertRes.ok) {
    const text = await insertRes.text()
    // Trùng `run_id`: lượt này đã được ghi ở lần gửi trước (mạng chập chờn, bấm lại).
    if (insertRes.status === 409 || text.includes('23505')) return reply({ ok: false, error: 'duplicate' })
    // Chưa chạy `verify-scores.sql` nên chưa có các cột mới.
    if (text.includes('PGRST204') || text.includes('42703')) return reply({ ok: false, error: 'server-not-ready' })
    console.error(`ghi điểm lỗi ${insertRes.status}: ${text}`)
    return reply({ ok: false, error: 'insert-failed' })
  }

  return reply({ ok: true, wpm: score.wpm, accuracy: score.accuracy })
})
