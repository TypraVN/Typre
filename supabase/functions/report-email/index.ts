/**
 * Gửi email mỗi khi có báo lỗi mới.
 *
 * Vì sao cần: báo lỗi nằm im trong bảng `reports` thì không ai biết. Không có thông báo,
 * một lỗi gửi lúc 2 giờ sáng có thể nằm đó hai tuần — mà báo lỗi cũ thì gần như vô dụng,
 * người dùng đã bỏ đi từ lâu.
 *
 * Được gọi bởi Database Webhook của Supabase, cấu hình trong dashboard (không phải code).
 *
 * Biến môi trường cần đặt (Dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY   khoá API của Resend
 *   REPORT_EMAIL_TO  địa chỉ nhận
 *   REPORT_EMAIL_FROM (tuỳ chọn) mặc định dùng onboarding@resend.dev của Resend
 *
 * CỐ Ý không viết cứng địa chỉ email vào file: repo này công khai, và một địa chỉ nằm
 * trong mã nguồn công khai là một địa chỉ sẽ bị spam.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

/** Cắt bớt cho email dễ đọc; muốn xem đủ thì mở database. */
const MAX_FIELD = 400

interface ReportRow {
  id: string
  message: string
  created_at: string
  user_id: string | null
  context: {
    build?: string
    url?: string
    viewport?: string
    userAgent?: string
    recentErrors?: Array<{ at: string; message: string }>
  } | null
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function trim(text: unknown): string {
  return String(text ?? '—').slice(0, MAX_FIELD)
}

function buildHtml(row: ReportRow): string {
  const ctx = row.context ?? {}
  const errors = ctx.recentErrors ?? []

  /*
    Lỗi console đặt LÊN ĐẦU, trên cả lời người dùng viết: người dùng mô tả được triệu
    chứng, còn dòng lỗi mới là thứ sửa được. Đọc email trên điện thoại thì cái quan trọng
    nhất phải nằm ở màn hình đầu tiên.
  */
  const errorBlock = errors.length
    ? `<pre style="margin:0;padding:12px;background:#18181b;color:#f87171;border-radius:8px;font-size:12px;white-space:pre-wrap;word-break:break-word">${errors
        .map((e) => escapeHtml(trim(e.message)))
        .join('\n')}</pre>`
    : `<p style="margin:0;color:#71717a;font-size:13px">Không bắt được lỗi console nào.</p>`

  return `<div style="font-family:ui-monospace,monospace;max-width:600px">
  <h2 style="margin:0 0 4px;font-size:16px">Báo lỗi mới trên Typre</h2>
  <p style="margin:0 0 16px;color:#71717a;font-size:12px">${escapeHtml(row.created_at)}</p>

  <h3 style="margin:0 0 6px;font-size:13px">Lỗi</h3>
  ${errorBlock}

  <h3 style="margin:16px 0 6px;font-size:13px">Người dùng viết</h3>
  <p style="margin:0;padding:12px;background:#f4f4f5;border-radius:8px;font-size:14px;white-space:pre-wrap">${escapeHtml(
    trim(row.message),
  )}</p>

  <h3 style="margin:16px 0 6px;font-size:13px">Bối cảnh</h3>
  <table style="font-size:12px;color:#52525b;border-collapse:collapse">
    <tr><td style="padding:2px 12px 2px 0">build</td><td>${escapeHtml(trim(ctx.build))}</td></tr>
    <tr><td style="padding:2px 12px 2px 0">trang</td><td>${escapeHtml(trim(ctx.url))}</td></tr>
    <tr><td style="padding:2px 12px 2px 0">màn hình</td><td>${escapeHtml(trim(ctx.viewport))}</td></tr>
    <tr><td style="padding:2px 12px 2px 0">trình duyệt</td><td>${escapeHtml(trim(ctx.userAgent))}</td></tr>
    <tr><td style="padding:2px 12px 2px 0">tài khoản</td><td>${escapeHtml(trim(row.user_id))}</td></tr>
  </table>
</div>`
}

Deno.serve(async (req) => {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const to = Deno.env.get('REPORT_EMAIL_TO')
  const from = Deno.env.get('REPORT_EMAIL_FROM') ?? 'Typre <onboarding@resend.dev>'

  // Thiếu cấu hình thì nói rõ thiếu cái gì. Trả về 500 chung chung là lát nữa ngồi đoán.
  if (!apiKey || !to) {
    return new Response(
      JSON.stringify({ error: 'thiếu RESEND_API_KEY hoặc REPORT_EMAIL_TO trong Secrets' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let row: ReportRow
  try {
    const payload = await req.json()
    // Database Webhook gửi dạng { type, table, record, old_record }
    row = payload.record as ReportRow
    if (!row?.message) throw new Error('payload không có record.message')
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      // Trích lời người dùng vào tiêu đề: nhìn hộp thư là đoán được mức độ, không phải
      // mở từng cái.
      subject: `[Typre] ${trim(row.message).slice(0, 60)}`,
      html: buildHtml(row),
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    return new Response(JSON.stringify({ error: 'Resend từ chối', detail }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
