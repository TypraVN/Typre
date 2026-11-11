/**
 * Kiểm và chấm lại một lượt gõ gửi lên. Thuần — không đụng mạng hay Deno — để test được
 * bằng Node (`scripts/submit-score.test.mts`); phần gọi mạng nằm ở `index.ts`.
 */
import { MAX_WPM, MIN_ACCURACY, judgeTiming, scoreRun, type RunAction } from '../_shared/typingCore.ts'

/** `/snippet-index.json` do lần build site sinh ra — xem `scripts/generate-seo-pages.mjs`. */
export interface SnippetIndex {
  version: number
  snippets: Record<string, [language: string, code: string]>
  pools: Record<string, string[]>
}

export interface Submission {
  snippetId: string
  language: string
  timeLimit: number
  strict: boolean
  runId: string
  actions: RunAction[]
}

export interface VerifiedScore {
  snippetId: string
  language: string
  timeLimit: number
  strict: boolean
  runId: string
  wpm: number
  cpm: number
  rawWpm: number
  accuracy: number
  consistency: number
}

export type VerifyError = 'bad-request' | 'unknown-snippet' | 'wrong-pool' | 'not-eligible' | 'robotic' | 'bursts'

const TIME_LIMITS = [15, 30, 60]
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Lượt 60s ở 300 wpm là ~1.500 phím; gấp vài lần cho thừa chỗ backspace. */
const MAX_ACTIONS = 6000

/**
 * Đọc thân request. Sai bất cứ chỗ nào là bỏ cả — server không đoán ý, không sửa giùm.
 * Thời điểm phải không giảm: bản ghi thật luôn đi theo thời gian.
 */
export function parseSubmission(body: unknown): Submission | null {
  if (typeof body !== 'object' || body === null) return null
  const b = body as Record<string, unknown>

  if (typeof b.snippetId !== 'string' || b.snippetId.length === 0 || b.snippetId.length > 100) return null
  if (typeof b.language !== 'string' || b.language.length > 20) return null
  if (typeof b.timeLimit !== 'number' || !TIME_LIMITS.includes(b.timeLimit)) return null
  if (typeof b.strict !== 'boolean') return null
  if (typeof b.runId !== 'string' || !UUID.test(b.runId)) return null
  if (!Array.isArray(b.actions) || b.actions.length === 0 || b.actions.length > MAX_ACTIONS) return null

  const actions: RunAction[] = []
  let last = 0
  for (const item of b.actions) {
    if (!Array.isArray(item) || item.length !== 2) return null
    const [t, key] = item
    if (typeof t !== 'number' || !Number.isFinite(t) || t < last || t > 3_600_000) return null
    if (typeof key !== 'string' || key.length !== 1) return null
    actions.push([t, key])
    last = t
  }

  return {
    snippetId: b.snippetId,
    language: b.language,
    timeLimit: b.timeLimit,
    strict: b.strict,
    runId: b.runId,
    actions,
  }
}

export function verifyRun(
  sub: Submission,
  index: SnippetIndex,
): { ok: true; score: VerifiedScore } | { ok: false; error: VerifyError } {
  const entry = index.snippets[sub.snippetId]
  if (!entry || entry[0] !== sub.language) return { ok: false, error: 'unknown-snippet' }

  // Bài phải thuộc đúng rổ của mốc đó: app không bao giờ cho gõ bài 1 dòng ở mốc 60s.
  const pool = index.pools[`${sub.language}|${sub.timeLimit}`] ?? []
  if (!pool.includes(sub.snippetId)) return { ok: false, error: 'wrong-pool' }

  const { stats } = scoreRun(entry[1], sub.actions, sub.strict, sub.timeLimit * 1000)
  if (stats.accuracy < MIN_ACCURACY || stats.wpm <= 0 || stats.wpm > MAX_WPM) {
    return { ok: false, error: 'not-eligible' }
  }

  const verdict = judgeTiming(sub.actions, stats.elapsedMs)
  if (verdict) return { ok: false, error: verdict }

  return {
    ok: true,
    score: {
      snippetId: sub.snippetId,
      language: sub.language,
      timeLimit: sub.timeLimit,
      strict: sub.strict,
      runId: sub.runId,
      wpm: stats.wpm,
      cpm: stats.cpm,
      rawWpm: stats.rawWpm,
      accuracy: stats.accuracy,
      consistency: stats.consistency,
    },
  }
}
