-- Thêm 2 chỉ số raw_wpm + consistency vào bảng xếp hạng (như cột raw/consistency
-- của Monkeytype). Chạy trong SQL Editor SAU khi đã có schema.sql.
--
-- An toàn với dữ liệu cũ: cột thêm dạng nullable, các điểm đã gửi trước đây sẽ
-- là NULL và UI hiện dấu "—" thay vì số.

alter table public.scores
  add column if not exists raw_wpm int check (raw_wpm >= 0 and raw_wpm <= 500),
  add column if not exists consistency int check (consistency >= 0 and consistency <= 100);

-- View phải tạo lại để có 2 cột mới (create or replace view không thêm được cột
-- vào giữa, nên drop rồi tạo lại).
drop view if exists public.leaderboard;

create view public.leaderboard
with (security_invoker = on) as
select distinct on (language, time_limit, user_id)
  id,
  user_id,
  display_name,
  avatar_url,
  language,
  time_limit,
  wpm,
  cpm,
  raw_wpm,
  consistency,
  accuracy,
  created_at
from public.scores
order by language, time_limit, user_id, wpm desc, created_at asc;

grant select on public.leaderboard to anon, authenticated;
