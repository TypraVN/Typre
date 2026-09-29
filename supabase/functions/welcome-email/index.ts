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
 *   WELCOME_EMAIL_FROM        (tuỳ chọn) mặc định onboarding@resend.dev của Resend
 *   WELCOME_EMAIL_REPLY_TO    (tuỳ chọn) địa chỉ nhận thư trả lời
 *
 * SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY do Supabase tự đặt sẵn, không phải khai báo.
 *
 * CỐ Ý không viết cứng địa chỉ email vào file: repo này công khai, và một địa chỉ nằm
 * trong mã nguồn công khai là một địa chỉ sẽ bị spam. Cùng lý do với `report-email`.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

const SITE = 'https://typre.dev'

interface ProfileRow {
  id: string
  display_name: string | null
  welcome_sent_at: string | null
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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
  return `<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#18181b;max-width:560px">
  <p style="margin:0 0 16px">Hi ${escapeHtml(name)},</p>

  <p style="margin:0 0 16px">Thank you so much for signing up for <strong>Typre</strong>!</p>

  <p style="margin:0 0 16px">
    Being one of the very first users means a lot. Typre is still being built, and early
    people like you are what keep it moving forward.
  </p>

  <p style="margin:0 0 16px">Two things worth trying first:</p>

  <ul style="margin:0 0 16px;padding-left:20px">
    <li style="margin-bottom:6px">
      A <a href="${SITE}/" style="color:#f97316">30-second run</a> in the language you write most —
      real code, brackets and operators included.
    </li>
    <li>
      <a href="${SITE}/practice/chess/" style="color:#f97316">Chess</a>, where you move a piece by
      typing a valid command in that same language.
    </li>
  </ul>

  <p style="margin:0 0 16px">
    If you have any feedback, ideas for features, or run into a problem, just reply to this
    email. It comes straight to me and I read every one.
  </p>

  <p style="margin:0 0 4px">Thanks again for joining early,</p>
  <p style="margin:0 0 16px"><strong>Nhat — Typre</strong></p>

  <p style="margin:0;font-size:13px;color:#71717a">
    <a href="${SITE}" style="color:#71717a">typre.dev</a>
  </p>
</div>`
}

/** Bản chữ thuần, gửi kèm bản HTML. Thiếu nó là điểm trừ với bộ lọc spam. */
function buildText(name: string): string {
  return `Hi ${name},

Thank you so much for signing up for Typre!

Being one of the very first users means a lot. Typre is still being built, and early
people like you are what keep it moving forward.

Two things worth trying first:

- A 30-second run in the language you write most: ${SITE}/
- Chess, where you move a piece by typing a valid command in that same language:
  ${SITE}/practice/chess/

If you have any feedback, ideas for features, or run into a problem, just reply to this
email. It comes straight to me and I read every one.

Thanks again for joining early,
Nhat - Typre
${SITE}
`
}

Deno.serve(async (req) => {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('WELCOME_EMAIL_FROM') ?? 'Typre <onboarding@resend.dev>'
  const replyTo = Deno.env.get('WELCOME_EMAIL_REPLY_TO')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  // Thiếu cấu hình thì nói rõ thiếu cái gì. Trả về 500 chung chung là lát nữa ngồi đoán.
  if (!apiKey || !supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: 'thiếu RESEND_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let row: ProfileRow
  try {
    const payload = await req.json()
    // Database Webhook gửi dạng { type, table, record, old_record }
    row = payload.record as ProfileRow
    if (!row?.id) throw new Error('payload không có record.id')
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  /*
    Đã gửi rồi thì thôi.

    Webhook của Supabase GỬI LẠI khi lần gọi trước lỗi mạng hay hết giờ — kể cả khi thư
    thật ra đã đi rồi. Không chặn ở đây thì người mới đăng ký nhận hai, ba lá thư chào
    giống hệt nhau, đúng ấn tượng đầu tiên tệ nhất có thể tạo ra.
  */
  if (row.welcome_sent_at) {
    return new Response(JSON.stringify({ ok: true, skipped: 'đã gửi trước đó' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const adminHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  }

  // Email nằm ở `auth.users`, không có trong `profiles`.
  const userRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${row.id}`, {
    headers: adminHeaders,
  })

  if (!userRes.ok) {
    const detail = await userRes.text()
    return new Response(JSON.stringify({ error: 'không đọc được auth.users', detail }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const user = (await userRes.json()) as { email?: string }
  const to = user.email

  /*
    Không có email thì KHÔNG phải lỗi: đăng nhập bằng OAuth có thể không trả email nếu
    người dùng từ chối chia sẻ. Trả 200 để webhook đừng gọi lại mãi một dòng không bao
    giờ gửi được.
  */
  if (!to) {
    return new Response(JSON.stringify({ ok: true, skipped: 'tài khoản không có email' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const name = firstName(row.display_name)

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
      subject: 'Thank you for being one of the first on Typre',
      html: buildHtml(name),
      text: buildText(name),
    }),
  })

  if (!sendRes.ok) {
    const detail = await sendRes.text()
    return new Response(JSON.stringify({ error: 'Resend từ chối', detail }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  /*
    Ghi mốc SAU KHI gửi thành công, và lỗi ở bước này KHÔNG làm hỏng cả lượt gọi: thư đã
    đi rồi, báo lỗi về cho webhook chỉ khiến nó gọi lại và gửi thêm lá nữa.
  */
  const markRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${row.id}`, {
    method: 'PATCH',
    headers: { ...adminHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ welcome_sent_at: new Date().toISOString() }),
  })

  return new Response(
    JSON.stringify({ ok: true, marked: markRes.ok }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
