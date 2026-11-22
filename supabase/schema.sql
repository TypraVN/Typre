-- Typre leaderboard schema (bản có đăng nhập)
-- Chạy file này trong Supabase Dashboard > SQL Editor > New query > Run
--
-- LƯU Ý: nếu bạn đã chạy bản schema CŨ (bảng scores dùng nickname tự nhập, chưa có
-- user_id) thì phải xoá bảng cũ trước, vì cấu trúc đã đổi:
--   drop table if exists public.scores;

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),

  -- Gắn điểm với tài khoản thật. `on delete cascade`: xoá tài khoản thì điểm cũng xoá.
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Lấy từ GitHub/Google lúc đăng nhập, lưu lại để hiển thị bảng xếp hạng
  -- mà không phải join sang bảng auth.
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_url text,

  -- Thêm ngôn ngữ bên app thì PHẢI thêm vào đây (và chạy `migration-add-languages.sql`
  -- nếu database đang chạy), không thì DB từ chối điểm của ngôn ngữ mới trong khi
  -- giao diện vẫn gõ bình thường — hỏng âm thầm.
  language text not null check (language in (
    'javascript','typescript','csharp','python','java','go','sql','bash',
    'cpp','rust','html','css','json','text'
  )),
  -- Đổi mốc thời gian bên app thì PHẢI sửa cả dòng này, không thì DB từ chối
  -- điểm ở mốc mới trong khi giao diện vẫn chạy bình thường.
  time_limit int not null check (time_limit in (15, 30, 60)),
  wpm int not null check (wpm >= 0 and wpm <= 400),
  cpm int not null check (cpm >= 0 and cpm <= 2000),
  accuracy int not null check (accuracy >= 0 and accuracy <= 100),
  created_at timestamptz not null default now()
);

-- Index cho truy vấn bảng xếp hạng (lọc theo ngôn ngữ + mốc thời gian, sắp theo wpm)
create index if not exists scores_leaderboard_idx
  on public.scores (language, time_limit, wpm desc);

create index if not exists scores_user_idx on public.scores (user_id);

-- Bật Row Level Security: mặc định chặn hết, chỉ mở đúng những gì cần
alter table public.scores enable row level security;

-- Ai cũng xem được bảng xếp hạng (kể cả chưa đăng nhập)
drop policy if exists "scores_public_read" on public.scores;
create policy "scores_public_read"
  on public.scores for select
  to anon, authenticated
  using (true);

-- KHÔNG có policy INSERT nào cho trình duyệt: chỉ Edge Function `submit-score` ghi được
-- điểm (chấm lại từ bản ghi phím, ghi bằng service role — bỏ qua RLS). Xem
-- `verify-scores.sql`.
--
-- Trước đây file này tạo policy `scores_insert_own` cho người dùng tự ghi. Chạy lại bản
-- cũ đó là mở lại đường gửi thẳng một con số bất kỳ lên bảng — đã xảy ra thật: 13 điểm
-- chưa xác minh lọt vào ngày 15/11/2026. Nên ở đây chỉ còn lệnh XOÁ, chạy lại an toàn.
drop policy if exists "scores_public_insert" on public.scores;
drop policy if exists "scores_insert_own" on public.scores;

-- UPDATE (chỉ tên/avatar) và DELETE điểm của chính mình: xem `migration-account-features.sql`.
