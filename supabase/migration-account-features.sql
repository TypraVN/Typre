-- ============================================================================
-- Typre — migration cho Account settings / Friends / Public profile
-- Chạy TOÀN BỘ file này một lần trong Supabase → SQL Editor.
-- An toàn để chạy lại (dùng if not exists / drop policy if exists).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. profiles — thông tin công khai của mỗi người
--
-- Vì sao cần bảng này: `auth.users` KHÔNG cho client đọc, nên trước đây tên +
-- avatar chỉ tồn tại dưới dạng bản chụp trong từng dòng `scores`. Không có bảng
-- này thì không thể tìm người để kết bạn, cũng không có gì để mở trang profile
-- của người chưa từng gửi điểm.
--
-- `username` tách riêng khỏi `display_name`:
--   - display_name: tên hiện ra, đổi thoải mái, KHÔNG cần duy nhất (2 người
--     đăng nhập Google cùng tên "Nhat Tran" vẫn phải tạo tài khoản được).
--   - username: duy nhất, chỉ chữ/số/gạch dưới, dùng làm link công khai
--     (#/u/<username>). Để null nếu người dùng chưa đặt.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  username text unique check (username ~ '^[a-z0-9_]{3,20}$'),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Ai cũng đọc được: cần cho bảng xếp hạng, tìm bạn, và trang profile công khai.
drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- Chỉ tự tạo/tự sửa hồ sơ của chính mình. Đây là chốt chặn mạo danh.
drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Tìm theo tên không phân biệt hoa/thường.
create index if not exists profiles_display_name_idx on public.profiles (lower(display_name));


-- ----------------------------------------------------------------------------
-- 2. Quyền của chủ sở hữu trên `scores`
--
-- Cần cho 2 việc trong Account settings:
--   - đổi tên hiển thị → cập nhật các dòng điểm đã gửi, không thì bảng xếp hạng
--     còn hiện tên cũ mãi.
--   - "reset personal bests" → tự xoá điểm của mình.
--
-- RLS không giới hạn được theo CỘT, nên chặn cột bằng `grant update (...)`:
-- người dùng chỉ đổi được tên/avatar, KHÔNG sửa được wpm của chính mình.
-- ----------------------------------------------------------------------------
drop policy if exists "update own scores" on public.scores;
create policy "update own scores"
  on public.scores for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke update on public.scores from authenticated;
grant update (display_name, avatar_url) on public.scores to authenticated;

drop policy if exists "delete own scores" on public.scores;
create policy "delete own scores"
  on public.scores for delete
  to authenticated
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 3. friendships — lời mời + danh sách bạn
--
-- Một dòng cho một quan hệ. `status`:
--   pending  = requester đã gửi, addressee chưa trả lời
--   accepted = đã là bạn
-- Từ chối/huỷ/bỏ bạn đều là DELETE dòng đó (không giữ trạng thái 'declined' để
-- người bị từ chối không đọc được là mình bị từ chối).
-- ----------------------------------------------------------------------------
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  -- Không tự kết bạn với chính mình, và không gửi trùng cùng một chiều.
  constraint friendships_no_self check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

alter table public.friendships enable row level security;

-- Chỉ hai người trong quan hệ đó đọc được. Người ngoài không thấy ai kết bạn với ai.
drop policy if exists "read own friendships" on public.friendships;
create policy "read own friendships"
  on public.friendships for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Gửi lời mời: chỉ tự đứng tên mình làm người gửi, và luôn ở trạng thái pending
-- (không thể tự tạo sẵn một quan hệ 'accepted' mà người kia chưa đồng ý).
drop policy if exists "send own friend request" on public.friendships;
create policy "send own friend request"
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = requester_id and status = 'pending');

-- Chấp nhận: CHỈ người được mời được đổi trạng thái.
drop policy if exists "addressee accepts request" on public.friendships;
create policy "addressee accepts request"
  on public.friendships for update
  to authenticated
  using (auth.uid() = addressee_id)
  with check (auth.uid() = addressee_id and status = 'accepted');

-- Huỷ lời mời / từ chối / bỏ bạn: bên nào cũng làm được.
drop policy if exists "either side removes friendship" on public.friendships;
create policy "either side removes friendship"
  on public.friendships for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create index if not exists friendships_addressee_idx on public.friendships (addressee_id, status);
create index if not exists friendships_requester_idx on public.friendships (requester_id, status);


-- ----------------------------------------------------------------------------
-- 4. Backfill hồ sơ cho người đã từng gửi điểm trước khi có bảng profiles.
--    Chạy một lần; những người mới sẽ được app tự tạo hồ sơ lúc đăng nhập.
-- ----------------------------------------------------------------------------
insert into public.profiles (id, display_name, avatar_url)
select distinct on (user_id) user_id, display_name, avatar_url
from public.scores
order by user_id, created_at desc
on conflict (id) do nothing;
