# Edge Functions

## `report-email` — gửi email khi có báo lỗi mới

Báo lỗi từ nút 🐞 trong app đi vào bảng `reports`. Không có thông báo thì chúng nằm im ở
đó — mà một báo lỗi đọc được sau hai tuần thì gần như vô dụng, người dùng đã bỏ đi rồi.

### 1. Lấy khoá Resend

1. Đăng ký ở https://resend.com (miễn phí 3.000 email/tháng, không cần thẻ)
2. **API Keys** → **Create API Key** → copy khoá (dạng `re_...`)

> Khoá chỉ hiện MỘT LẦN. Copy ngay, mất thì tạo cái khác.

Ở mức miễn phí chưa xác minh tên miền, Resend chỉ cho gửi **từ**
`onboarding@resend.dev` và **tới đúng email đã đăng ký tài khoản Resend**. Đủ dùng —
đây là email gửi cho chính mình.

Muốn gửi từ `bot@typre.dev` thì vào **Domains** → thêm `typre.dev` → khai mấy bản ghi
DNS bên Vercel. Làm sau cũng được.

### 2. Đặt Secrets

Supabase Dashboard → **Edge Functions** → **Secrets** → thêm:

| Tên | Giá trị |
|---|---|
| `RESEND_API_KEY` | khoá `re_...` vừa copy |
| `REPORT_EMAIL_TO` | email nhận thông báo |
| `REPORT_EMAIL_FROM` | *(tuỳ chọn)* mặc định `Typre <onboarding@resend.dev>` |

Email KHÔNG viết cứng trong mã nguồn: repo này công khai, và một địa chỉ nằm trong mã
nguồn công khai là một địa chỉ sẽ bị spam.

### 3. Deploy function

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase functions deploy report-email --no-verify-jwt
```

`<project-ref>` là đoạn trong URL dashboard: `https://supabase.com/dashboard/project/<project-ref>`

`--no-verify-jwt` là BẮT BUỘC: Database Webhook gọi tới bằng service key theo cách riêng,
bật xác thực JWT mặc định thì mọi lượt gọi đều bị chặn và không có email nào được gửi.

### 4. Nối Database Webhook

Dashboard → **Database** → **Webhooks** → **Create a new hook**:

| Trường | Giá trị |
|---|---|
| Name | `report_email` |
| Table | `public.reports` |
| Events | chỉ **Insert** |
| Type | **Supabase Edge Functions** |
| Edge Function | `report-email` |
| Method | `POST` |

### 5. Thử

Vào https://www.typre.dev → nút 🐞 → gõ gì đó → **Send**. Email phải tới trong vài giây.

Không thấy email thì xem log: Dashboard → **Edge Functions** → `report-email` → **Logs**.
Lỗi hay gặp:

| Log báo | Nguyên nhân |
|---|---|
| `thiếu RESEND_API_KEY hoặc REPORT_EMAIL_TO` | chưa đặt Secrets, hoặc đặt xong chưa deploy lại |
| `Resend từ chối` + `You can only send testing emails to...` | địa chỉ nhận khác email đăng ký Resend, mà tên miền chưa xác minh |
| không có log nào | webhook chưa nối, hoặc deploy thiếu `--no-verify-jwt` |
