# Bật đăng nhập + bảng xếp hạng online

Cần một backend. Dùng Supabase free tier (miễn phí, đủ cho side-project).

Có 3 phần: **(A) Database** → **(B) Đăng nhập GitHub/Google** → **(C) Nối vào app**.

---

## A. Database

**A1. Tạo project Supabase**

- Vào https://supabase.com, đăng ký / đăng nhập
- **New project** → đặt tên (vd `typre`) → chọn region gần VN nhất (Singapore) → tạo
- Chờ ~2 phút cho project khởi tạo xong

**A2. Tạo bảng dữ liệu**

- Trong Dashboard: **SQL Editor** → **New query**
- Copy toàn bộ nội dung file `schema.sql` (cùng thư mục này) dán vào → bấm **Run**
- Thấy "Success. No rows returned" là xong

> Nếu bạn đã từng chạy bản schema cũ (chưa có đăng nhập), chạy `drop table if exists public.scores;` trước rồi mới chạy lại `schema.sql`.

**A3. Các file SQL phải chạy thêm (theo thứ tự)**

| file | dùng cho | chạy lại được? |
|---|---|---|
| `schema.sql` | bảng `scores` + RLS | không (tạo bảng) |
| `leaderboard-view.sql` | view dedupe — mỗi người 1 dòng điểm cao nhất | có |
| `add-raw-consistency.sql` | thêm 2 cột `raw_wpm` + `consistency` | không (đã chạy 2026-08-08) |
| `migration-account-features.sql` | **Account settings / Friends / Public profile** | có |

Chưa chạy `migration-account-features.sql` thì app vẫn gõ + xếp hạng bình thường, nhưng
menu tài khoản sẽ hiện cảnh báo: Friends báo thiếu bảng `friendships`, Account settings
khoá ô nhập, trang profile công khai hiện "profile not found".

---

## B. Đăng nhập

### B1. GitHub

1. Vào https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**
2. Điền:
   - **Application name**: `Typre`
   - **Homepage URL**: `http://localhost:5180` (sau khi deploy thì đổi thành domain thật)
   - **Authorization callback URL**: lấy từ Supabase — vào **Authentication → Sign In / Providers → GitHub**, copy dòng `Callback URL (for OAuth)`. Dạng: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Bấm **Register application** → **Generate a new client secret**
4. Quay lại Supabase **Authentication → Sign In / Providers → GitHub**: bật **Enable**, dán **Client ID** và **Client Secret** → **Save**

### B2. Google

1. Vào https://console.cloud.google.com → tạo project mới (hoặc chọn project có sẵn)
2. **APIs & Services → OAuth consent screen**: chọn **External**, điền tên app + email, lưu
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - **Application type**: Web application
   - **Authorized redirect URIs**: dán cùng `Callback URL` của Supabase như bước GitHub
4. Copy **Client ID** + **Client Secret**
5. Trong Supabase **Authentication → Sign In / Providers → Google**: bật **Enable**, dán 2 giá trị → **Save**

### B3. Khai báo URL được phép quay về

Trong Supabase: **Authentication → URL Configuration**

- **Site URL**: `http://localhost:5180`
- **Redirect URLs**: thêm `http://localhost:5180` (và domain thật sau khi deploy)

Thiếu bước này thì đăng nhập xong sẽ không quay về được app.

---

## C. Nối vào app

**C1. Lấy 2 thông số kết nối**

- `Project URL` (trang chủ project, hoặc **Project Settings → General**) → `VITE_SUPABASE_URL`
- **Project Settings → API Keys** → copy **Publishable key** (dạng `sb_publishable_...`) → `VITE_SUPABASE_ANON_KEY`

> Dashboard mới gọi là **Publishable key**; tên cũ là *anon public key* — cùng một thứ.
>
> ⚠️ **Không lấy "Secret key"** (`sb_secret_...`). Key đó bỏ qua mọi RLS, đưa vào frontend là ai cũng đọc/xoá sạch được database. Nó chỉ dùng ở server.

**C2. Tạo file `.env`**

Ở thư mục gốc project (`CodeTyping/`), copy `.env.example` thành `.env` rồi điền:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**C3. Chạy lại dev server**

Vite chỉ đọc `.env` lúc khởi động, nên phải tắt và chạy lại (Ctrl+C rồi `npm run dev`).

---

## Khi deploy lên Vercel

1. **Project Settings → Environment Variables**: thêm đúng 2 biến trên
2. Cập nhật lại **Homepage URL** ở GitHub OAuth App, **Authorized redirect URIs** ở Google, và **Site URL / Redirect URLs** ở Supabase thành domain thật
3. Không commit file `.env` lên git (đã có trong `.gitignore`)

---

## Về bảo mật

- **`anon key` là public** — nó nằm trong bundle JS mà ai cũng xem được. Đây là thiết kế bình thường của Supabase, không phải lỗ hổng: quyền truy cập kiểm soát bằng Row Level Security (RLS) ở database, không bằng việc giấu key.
- **`Client Secret` của GitHub/Google thì KHÔNG public** — chỉ dán vào Supabase Dashboard, đừng bao giờ đưa vào code hay `.env` của frontend.
- RLS trong `schema.sql`:
  - Ai cũng **đọc** được bảng xếp hạng (kể cả chưa đăng nhập)
  - Chỉ người **đã đăng nhập** gửi được điểm, và policy `auth.uid() = user_id` đảm bảo **chỉ gửi được cho chính mình** → không mạo danh được người khác
  - Không có policy UPDATE/DELETE → **không ai sửa/xoá được điểm**, kể cả điểm của chính mình
- **Hạn chế còn lại:** WPM vẫn tính ở phía client, nên người biết dùng DevTools vẫn có thể gửi điểm giả **cho tài khoản của chính họ**. Schema đã chặn giá trị phi lý (`wpm > 300`, `accuracy < 50%`). Muốn chống tuyệt đối thì phải tính WPM ở server dựa trên chuỗi keystroke — phức tạp hơn nhiều, chưa làm.
