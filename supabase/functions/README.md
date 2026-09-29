# Edge Functions

## `welcome-email` — gửi thư chào người đăng ký mới

Gửi một lá thư chào khi có người đăng ký. Trước đây gửi tay; function này làm đúng việc
đó, tự động, và không bao giờ quên.

### 0. BẮT BUỘC trước tiên: xác minh tên miền ở Resend

Khác `report-email` (gửi cho chính mình), thư này gửi cho **người lạ**. Ở mức miễn phí
chưa xác minh tên miền, Resend **chỉ cho gửi tới đúng email đã đăng ký tài khoản
Resend** — nghĩa là mọi thư chào sẽ bị từ chối, người dùng không nhận được gì.

Resend → **Domains** → **Add Domain** → `typre.dev` → thêm các bản ghi DNS nó đưa vào
DNS của tên miền (Vercel → Domains → `typre.dev` → DNS Records) → chờ **Verified**.

Các bản ghi đó gồm SPF và DKIM: thiếu chúng thì thư có gửi đi cũng rơi vào spam.

### 1. Chạy SQL

SQL Editor → chạy `../add-welcome-email.sql` (thêm cột `welcome_sent_at` vào `profiles`).

Bỏ qua bước này thì mỗi lần webhook gọi lại vì lỗi mạng là người mới nhận thêm một lá
thư giống hệt.

### 2. Đặt Secrets

Dashboard → **Edge Functions** → **Secrets**:

| Tên | Giá trị |
|---|---|
| `RESEND_API_KEY` | dùng lại khoá `re_...` của `report-email` |
| `WELCOME_EMAIL_FROM` | `Typre <hello@typre.dev>` — phải thuộc tên miền đã xác minh ở bước 0 |
| `WELCOME_EMAIL_REPLY_TO` | *(tuỳ chọn)* email thật của anh, để người ta bấm Reply là thư về thẳng hộp thư |

`SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` **không phải khai** — Supabase tự đặt sẵn
cho mọi Edge Function.

### 3. Deploy function

```bash
npx supabase functions deploy welcome-email --no-verify-jwt
```

`--no-verify-jwt` bắt buộc, cùng lý do với `report-email`.

### 4. Nối Database Webhook

Dashboard → **Database** → **Webhooks** → **Create a new hook**:

| Trường | Giá trị |
|---|---|
| Name | `welcome_email` |
| Table | `public.profiles` |
| Events | chỉ **Insert** |
| Type | **Supabase Edge Functions** |
| Edge Function | `welcome-email` |
| Method | `POST` |

Gắn vào `profiles` chứ không phải `auth.users`: Database Webhook chỉ chạy được trên
schema `public`. App tự tạo dòng `profiles` ngay lần đăng nhập đầu tiên, nên đó là mốc
"người mới" đáng tin.

### 5. Thử

Đăng ký một tài khoản mới bằng email khác (hoặc `ten+test@gmail.com` — Gmail coi đó là
cùng hộp thư). Thư phải tới trong vài giây.

Thử lại lần nữa với **cùng** tài khoản đó thì KHÔNG được có thư thứ hai — đó là lúc cột
`welcome_sent_at` làm việc.

Không thấy thư thì xem **Edge Functions** → `welcome-email` → **Logs**:

| Log báo | Nguyên nhân |
|---|---|
| `Resend từ chối` + `You can only send testing emails to...` | chưa xong bước 0 |
| `không đọc được auth.users` | thiếu quyền service role — deploy lại function |
| `skipped: đã gửi trước đó` | đúng như thiết kế, tài khoản này đã nhận thư rồi |
| `skipped: tài khoản không có email` | đăng nhập OAuth nhưng không chia sẻ email |
| không có log nào | webhook chưa nối, hoặc deploy thiếu `--no-verify-jwt` |

---

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
