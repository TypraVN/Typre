/**
 * Gửi thư chào mỗi khi có người đăng ký mới.
 *
 * Được gọi bởi Database Webhook trên `public.profiles` (INSERT), cấu hình trong
 * dashboard — không phải code. Dùng `profiles` chứ KHÔNG phải `auth.users` vì Database
 * Webhook chỉ gắn được vào schema `public`; app tự tạo dòng `profiles` ngay lần đăng nhập
 * đầu tiên (xem `migration-account-features.sql`), nên đó là mốc "người mới" đáng tin.
 *
 * `profiles` không chứa email — phải hỏi lại `auth.users` qua Admin API bằng service role.
 *
 * Biến môi trường cần đặt (Dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY            khoá API của Resend
 *   WELCOME_WEBHOOK_SECRET    chuỗi bí mật; webhook gửi kèm trong header `x-webhook-secret`
 *   WELCOME_EMAIL_FROM        (tuỳ chọn) mặc định onboarding@resend.dev của Resend
 *   WELCOME_EMAIL_REPLY_TO    (tuỳ chọn) địa chỉ nhận thư trả lời
 *
 * SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY do Supabase tự đặt sẵn, không phải khai báo.
 *
 * CỐ Ý không viết cứng địa chỉ email vào file: repo này công khai, và một địa chỉ nằm
 * trong mã nguồn công khai là một địa chỉ sẽ bị spam. Cùng lý do với `report-email`.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

const SITE = 'https://www.typre.dev'

const SUBJECT = 'Thank you for being one of the first members on Typre!'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface ClaimedProfile {
  id: string
  display_name: string | null
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** So sánh chuỗi bí mật không lộ độ dài khớp qua thời gian chạy. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/**
 * Tên để xưng hô. Rỗng thì dùng "there" — "Hi ," trông như thư hỏng.
 *
 * Cắt ở khoảng trắng đầu: người đăng nhập Google mang cả họ tên đầy đủ, mà thư chào gọi
 * đúng tên gọi thì tự nhiên hơn gọi cả họ.
 */
function firstName(displayName: string | null): string {
  const name = (displayName ?? '').trim().split(/\s+/)[0]
  return name.length > 0 && name.length <= 24 ? name : 'there'
}

function buildHtml(name: string): string {
  const p = 'margin:0 0 16px'
  return `<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#18181b;max-width:560px">
  <p style="${p}">Hi ${escapeHtml(name)},</p>

  <p style="${p}">Thank you so much for signing up for <strong>Typre</strong>!</p>

  <p style="${p}">
    Being one of the very first early users means a lot to us. As we are constantly
    improving the platform to deliver the best typing and learning experience, your early
    presence and support are what keep us moving forward.
  </p>

  <p style="${p}">
    If you have any feedback, ideas for new features, or run into any issues while using
    Typre, please feel free to reply directly to this email. We'd love to hear your thoughts!
  </p>

  <p style="${p}">Thanks again for joining us early on this journey.</p>

  <p style="margin:0 0 4px">Best regards,</p>
  <p style="margin:0 0 4px"><strong>Typre Team</strong></p>
  <p style="margin:0"><em><a href="${SITE}/" style="color:#f97316">Typre Website</a></em></p>
</div>`
}

/** Bản chữ thuần, gửi kèm bản HTML. Thiếu nó là điểm trừ với bộ lọc spam. */
function buildText(name: string): string {
  return `Hi ${name},

Thank you so much for signing up for Typre!

Being one of the very first early users means a lot to us. As we are constantly improving
the platform to deliver the best typing and learning experience, your early presence and
support are what keep us moving forward.

If you have any feedback, ideas for new features, or run into any issues while using
Typre, please feel free to reply directly to this email. We'd love to hear your thoughts!

Thanks again for joining us early on this journey.

Best regards,
Typre Team
${SITE}/
`
}

Deno.serve(async (req) => {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const secret = Deno.env.get('WELCOME_WEBHOOK_SECRET')
  const from = Deno.env.get('WELCOME_EMAIL_FROM') ?? 'Typre <onboarding@resend.dev>'
  const replyTo = Deno.env.get('WELCOME_EMAIL_REPLY_TO')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  // Thiếu cấu hình thì nói rõ thiếu cái gì. Trả về 500 chung chung là lát nữa ngồi đoán.
  if (!apiKey || !secret || !supabaseUrl || !serviceKey) {
    console.error('thiếu cấu hình')
    return json(
      { error: 'thiếu RESEND_API_KEY / WELCOME_WEBHOOK_SECRET / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' },
      500,
    )
  }

  /*
    Chỉ webhook của mình mới được gọi. Function deploy với `--no-verify-jwt` nên địa chỉ
    này ai cũng gọi được — không chặn thì người ngoài biết `id` của ai là bắt Typre gửi
    thư tới hộp thư người đó, từ chính tên miền typre.dev.
  */
  if (!safeEqual(req.headers.get('x-webhook-secret') ?? '', secret)) {
    console.warn('sai x-webhook-secret')
    return json({ error: 'unauthorized' }, 401)
  }

  let userId: string
  try {
    const payload = await req.json()
    // Database Webhook gửi dạng { type, table, record, old_record }. Chỉ lấy `id`: mọi
    // thứ khác đọc lại từ database, không tin nội dung request.
    userId = String(payload?.record?.id ?? '')
    if (!UUID_RE.test(userId)) throw new Error('payload không có record.id hợp lệ')
  } catch (error) {
    return json({ error: String(error) }, 400)
  }

  const adminHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  }
  const profileUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`

  /*
    GIÀNH lượt gửi trong database trước khi gửi: chỉ đặt `welcome_sent_at` khi nó còn
    trống. Hai lần gọi cùng lúc (webhook gọi lại vì hết giờ) thì chỉ một lần đặt được —
    lần kia nhận về 0 dòng và dừng. Không ai được gửi thư hai lần cho cùng một người.
  */
  const claimRes = await fetch(`${profileUrl}&welcome_sent_at=is.null&select=id,display_name`, {
    method: 'PATCH',
    headers: { ...adminHeaders, Prefer: 'return=representation' },
    body: JSON.stringify({ welcome_sent_at: new Date().toISOString() }),
  })

  if (!claimRes.ok) {
    const detail = await claimRes.text()
    // 42703 = chưa chạy `add-welcome-email.sql` (thiếu cột `welcome_sent_at`).
    console.error('không giành được lượt gửi', detail)
    return json({ error: 'không ghi được welcome_sent_at', detail }, 500)
  }

  const claimed = (await claimRes.json()) as ClaimedProfile[]
  if (claimed.length === 0) {
    console.log(`bỏ qua ${userId}: đã gửi trước đó`)
    return json({ ok: true, skipped: 'đã gửi trước đó' })
  }

  /** Gửi hỏng thì trả lại lượt, để lần gọi sau còn gửi được. */
  const release = () =>
    fetch(profileUrl, {
      method: 'PATCH',
      headers: { ...adminHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({ welcome_sent_at: null }),
    })

  // Email nằm ở `auth.users`, không có trong `profiles`.
  const userRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    headers: adminHeaders,
  })

  if (!userRes.ok) {
    const detail = await userRes.text()
    await release()
    console.error('không đọc được auth.users', detail)
    return json({ error: 'không đọc được auth.users', detail }, 502)
  }

  const to = ((await userRes.json()) as { email?: string }).email

  /*
    Không có email thì KHÔNG phải lỗi: đăng nhập bằng OAuth có thể không trả email nếu
    người dùng từ chối chia sẻ. Giữ nguyên mốc đã giành — gọi lại cũng không gửi được.
  */
  if (!to) {
    console.log(`bỏ qua ${userId}: tài khoản không có email`)
    return json({ ok: true, skipped: 'tài khoản không có email' })
  }

  const name = firstName(claimed[0].display_name)

  const sendRes = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: SUBJECT,
      html: buildHtml(name),
      text: buildText(name),
    }),
  })

  if (!sendRes.ok) {
    const detail = await sendRes.text()
    await release()
    console.error('Resend từ chối', detail)
    return json({ error: 'Resend từ chối', detail }, 502)
  }

  console.log(`đã gửi thư chào cho ${userId}`)
  return json({ ok: true })
})
