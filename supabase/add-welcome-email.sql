-- ----------------------------------------------------------------------------
-- Mốc đã gửi thư chào — cho Edge Function `welcome-email`.
--
-- Vì sao cần: Database Webhook của Supabase GỬI LẠI khi lần gọi trước lỗi mạng hay
-- hết giờ, kể cả khi thư thật ra đã đi. Không có mốc này thì người vừa đăng ký nhận
-- hai, ba lá thư chào giống hệt nhau.
--
-- Chạy lại được nhiều lần (add column if not exists).
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists welcome_sent_at timestamptz;

comment on column public.profiles.welcome_sent_at is
  'Lúc đã gửi thư chào. Null = chưa gửi. Chỉ Edge Function welcome-email ghi cột này bằng service role.';

-- ----------------------------------------------------------------------------
-- KHÔNG thêm policy nào cho cột này.
--
-- Edge Function ghi bằng service role, vốn đi vòng qua RLS. Policy "update own profile"
-- sẵn có cho phép người dùng tự sửa hồ sơ của mình, nghĩa là về lý thuyết họ xoá được
-- mốc này và tự gửi cho mình thêm một lá thư nữa. Chấp nhận được: hại tối đa là một
-- email thừa gửi cho CHÍNH họ, không đụng được tới ai khác.
-- ----------------------------------------------------------------------------
