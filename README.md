# Typre

Web luyện gõ code cho developer — lấy cảm hứng từ Monkeytype nhưng tối ưu cho cú pháp lập trình: dấu ngoặc, ký tự đặc biệt, và phím tắt IDE.

## Chạy ở máy

```bash
npm install
npm run dev
```

Mở http://localhost:5180

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Dev server (KHÔNG kiểm tra TypeScript) |
| `npm run build` | Kiểm tra type + build production |
| `npm run preview` | Xem thử bản build |

> **Chạy `npm run build` định kỳ.** Dev server dùng esbuild nên chỉ xoá kiểu chứ không kiểm tra — code sai type vẫn chạy ở dev nhưng làm hỏng deploy.

## Tính năng

- **Gõ code**: 14 bộ bài (JS, TS, C#, Python, Java, Go, Rust, C++, SQL, Bash, HTML, CSS, JSON, ký tự đặc biệt)
- **Phím tắt**: luyện tổ hợp VS Code và chuỗi phím Vim
- **Chỉ số**: WPM, CPM, raw WPM, accuracy, consistency
- **Bảng xếp hạng online**: mỗi người 1 dòng với điểm cao nhất, lọc theo ngôn ngữ × mốc thời gian
- **Tài khoản**: đăng nhập Google / Facebook / GitHub / magic link email, hồ sơ công khai, kết bạn
- Sáng/tối, 4 theme màu code, âm thanh gõ, cảnh báo Caps Lock

Phím tắt trong app: `Esc` gõ lại · sau khi xong thì `Tab` gõ lại, `Enter` bài mới.

## Backend (không bắt buộc)

App **chạy bình thường mà không cần backend** — chỉ mất bảng xếp hạng và tài khoản (tự ẩn, không lỗi).

Muốn bật: xem [supabase/README.md](supabase/README.md).

Các file SQL trong `supabase/`, chạy theo thứ tự nếu làm mới từ đầu:

1. `schema.sql` — bảng `scores` + RLS
2. `leaderboard-view.sql` — view mỗi người 1 dòng
3. `add-raw-consistency.sql` — 2 cột raw/consistency
4. `migration-add-languages.sql` — cho phép các ngôn ngữ mới
5. `migration-account-features.sql` — `profiles` + `friendships`

## Deploy lên Vercel (miễn phí)

**1. Đưa code lên GitHub**

```bash
git init
git add .
git commit -m "Typre"
git branch -M main
git remote add origin https://github.com/<ten-ban>/typre.git
git push -u origin main
```

**2. Import vào Vercel**

Vào https://vercel.com → **Add New** → **Project** → chọn repo. Vercel tự nhận Vite, không cần đổi gì.

File `vercel.json` có sẵn chỉ làm 1 việc: cache asset vĩnh viễn (tên file có hash nên nội dung không đổi mà không đổi tên), còn `index.html` thì không cache — nếu cache file này người dùng sẽ mắc ở bản cũ sau mỗi lần deploy.

**3. Khai báo biến môi trường**

Trong **Project Settings → Environment Variables**, thêm 2 biến (lấy từ Supabase → Project Settings → API Keys):

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

**4. Cập nhật URL sau khi có domain thật**

Đây là bước hay bị quên, thiếu là **đăng nhập hỏng trên production**:

- **Supabase → Authentication → URL Configuration**: thêm domain Vercel vào *Site URL* và *Redirect URLs*
- **GitHub OAuth App**: sửa *Homepage URL* thành domain thật
- **Google Cloud Console**: giữ nguyên *Authorized redirect URI* (nó trỏ tới Supabase, không phải app)

## Lưu ý bảo mật

- `VITE_SUPABASE_ANON_KEY` (Publishable key) **là công khai theo thiết kế** — nó nằm trong file JS ai cũng đọc được. An toàn nhờ Row Level Security ở database, không nhờ giấu key.
- **Secret key** của Supabase và **Client Secret** của Google/Facebook/GitHub thì **không bao giờ** đưa vào `.env` hay code frontend — chỉ dán vào Supabase Dashboard.
- File `.env` đã được `.gitignore` chặn.
- Hạn chế đã biết: WPM tính ở phía client, nên người dùng DevTools vẫn có thể gửi điểm giả **cho tài khoản của chính họ**. Database đã chặn giá trị phi lý (`wpm > 300`, `accuracy < 50%`) và RLS chặn mạo danh người khác.

## Tech stack

React 19 + TypeScript + Vite · Tailwind CSS v4 · Zustand · Shiki (syntax highlighting) · Supabase (auth + database)
