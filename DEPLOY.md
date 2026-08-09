# Deploy Typre lên Vercel

Repo: <https://github.com/TypraVN/Typre> — push lên `main` là Vercel tự build lại.

---

## 1. Tạo project trên Vercel

1. Vào <https://vercel.com> → **Continue with GitHub** (dùng luôn tài khoản GitHub, không cần tạo mật khẩu mới).
2. **Add New…** → **Project** → tìm repo `Typre` → **Import**.
3. Vercel tự nhận Vite. Không cần sửa Build Command hay Output Directory
   (`vercel.json` trong repo đã chốt sẵn cache cho `/assets`).

## 2. Điền biến môi trường — **làm TRƯỚC khi bấm Deploy**

Ở màn Import, mở **Environment Variables** và thêm 2 biến, lấy giá trị từ file `.env`
dưới máy:

| Name | Lấy ở đâu |
|---|---|
| `VITE_SUPABASE_URL` | dòng `VITE_SUPABASE_URL=` trong `.env` |
| `VITE_SUPABASE_ANON_KEY` | dòng `VITE_SUPABASE_ANON_KEY=` trong `.env` (dạng `sb_publishable_...`) |

Thiếu 2 biến này thì web vẫn **chạy bình thường** — chỉ mất nút đăng nhập và tab Xếp hạng
(app tự ẩn kèm thông báo chưa cấu hình), nên nếu deploy xong thấy mất 2 phần đó thì đây là
lý do đầu tiên cần kiểm.

> ⚠️ Chỉ dùng **Publishable key**. Tuyệt đối không đưa **Secret key** (`sb_secret_...`) vào
> đây — nó bỏ qua toàn bộ Row Level Security, mà biến `VITE_*` thì nằm thẳng trong file JS
> tải về máy người dùng.

Bấm **Deploy**, chờ ~1 phút. Sẽ có domain dạng `https://typre.vercel.app`.

## 3. Khai báo domain mới với Supabase — **bước hay quên nhất**

Không làm bước này thì **đăng nhập sẽ hỏng trên bản deploy** (bấm GitHub/Google xong bị đá
về localhost hoặc báo `requested path is invalid`), trong khi ở máy vẫn chạy ngon.

Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: `https://typre.vercel.app`
- **Redirect URLs**: thêm `https://typre.vercel.app/**`
  — **giữ lại** `http://localhost:5180/**` để vẫn dev được ở máy.

Không cần đụng gì tới GitHub OAuth App: callback của nó trỏ về
`https://<project>.supabase.co/auth/v1/callback`, không đổi theo domain của web.

## 4. Hai file SQL còn chưa chạy

Chạy trong Supabase → SQL Editor, không thì hỏng âm thầm:

| File | Không chạy thì sao |
|---|---|
| `supabase/migration-add-languages.sql` | Gõ C++/Rust/CSS/JSON bình thường nhưng gửi điểm lên bảng xếp hạng bị DB từ chối |
| `supabase/migration-account-features.sql` | Friends báo thiếu bảng, Account settings khoá ô nhập, trang profile công khai luôn "profile not found" |

---

## Sau này

- Push lên `main` → Vercel tự deploy lại. Nhánh khác → Vercel tạo bản preview riêng.
- Đổi sang domain riêng (vd `typre.app`) thì phải **làm lại bước 3** với domain mới.
- Xem lỗi build: Vercel → project → **Deployments** → bấm vào lần deploy đỏ → tab **Building**.
