-- ============================================================================
-- Bảng xếp hạng theo TUẦN và theo NGÀY.
-- Chạy trong Supabase → SQL Editor, sau add-raw-consistency.sql.
--
-- Vì sao cần: view `leaderboard` chỉ có bảng toàn thời gian, nên người mới vào
-- không bao giờ chen được vào top 10 — chẳng có lý do gì để đua. Có bảng tuần thì
-- mỗi tuần lại là một sân mới.
--
-- Vì sao là VIEW riêng chứ không thêm điều kiện thời gian vào truy vấn view cũ:
-- view cũ đã gộp còn 1 dòng/người là điểm cao nhất TRỌN ĐỜI. Lọc thời gian lên đó
-- chỉ ra "những ai có kỷ lục trọn đời rơi vào tuần này", KHÁC với "điểm tốt nhất
-- trong tuần này". Muốn đúng thì phải gộp BÊN TRONG khoảng thời gian.
--
-- Dùng view (không tham số) thay vì function có tham số để client giữ nguyên được
-- đường code hiện tại: đổi tên bảng nguồn là xong, `count: 'exact'` và phân trang
-- vẫn chạy y như cũ.
--
-- An toàn để chạy lại.
-- ============================================================================

drop view if exists public.leaderboard_week;

create view public.leaderboard_week
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
where created_at > now() - interval '7 days'
order by language, time_limit, user_id, wpm desc, created_at asc;


drop view if exists public.leaderboard_today;

create view public.leaderboard_today
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
where created_at > now() - interval '24 hours'
order by language, time_limit, user_id, wpm desc, created_at asc;


-- `security_invoker = on` (Postgres 15+) BẮT BUỘC: không có nó thì view chạy bằng
-- quyền owner và bỏ qua RLS của bảng `scores`.
grant select on public.leaderboard_week to anon, authenticated;
grant select on public.leaderboard_today to anon, authenticated;

-- Bảng tuần/ngày luôn quét theo thời gian trước rồi mới gộp, nên cần index dẫn đầu
-- bằng created_at.
create index if not exists scores_created_at_idx
  on public.scores (created_at desc);
