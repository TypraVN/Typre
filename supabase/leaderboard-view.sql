-- Bảng xếp hạng: MỖI NGƯỜI CHỈ 1 DÒNG với điểm cao nhất của họ.
-- Chạy sau schema.sql, trong SQL Editor.
--
-- Vì sao cần view: bảng `scores` lưu MỌI lần gõ. Nếu xếp hạng trực tiếp từ đó thì
-- một người gõ 10 lần sẽ chiếm hết top 10 — không so được với người khác.

create or replace view public.leaderboard
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
  accuracy,
  created_at
from public.scores
-- `distinct on` giữ dòng ĐẦU TIÊN của mỗi nhóm, nên phải order sao cho dòng đầu
-- chính là điểm cao nhất. Cùng wpm thì ai đạt trước xếp trên.
order by language, time_limit, user_id, wpm desc, created_at asc;

-- `security_invoker = on` (Postgres 15+): view chạy với quyền của người GỌI,
-- nên RLS của bảng scores vẫn được áp dụng. Không có nó thì view chạy bằng quyền
-- owner và bỏ qua RLS — một lỗ bảo mật hay bị bỏ sót.

grant select on public.leaderboard to anon, authenticated;
