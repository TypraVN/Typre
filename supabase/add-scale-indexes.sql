-- ============================================================================
-- Index cho lúc có người dùng thật.
-- Chạy trong Supabase → SQL Editor. An toàn để chạy lại.
--
-- Hai chỗ hiện tại KHÔNG có index phù hợp. Với vài chục dòng thì không ai thấy,
-- nhưng cả hai đều là quét toàn bảng — chi phí tăng tuyến tính theo số người dùng,
-- và sẽ lộ ra đúng lúc đông người nhất.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Bảng xếp hạng
-- ----------------------------------------------------------------------------
-- Cả ba view (leaderboard, _week, _today) đều là:
--
--   select distinct on (language, time_limit, user_id) ...
--   order by language, time_limit, user_id, wpm desc, created_at asc
--
-- `distinct on` CHỈ dùng được index nào khớp ĐÚNG thứ tự cột của `order by`.
-- Index cũ `scores_leaderboard_idx (language, time_limit, wpm desc)` thiếu
-- `user_id` ở giữa nên không khớp — Postgres phải sắp xếp lại toàn bộ bảng
-- `scores` mỗi lần ai đó mở bảng xếp hạng.
create index if not exists scores_dedup_idx
  on public.scores (language, time_limit, user_id, wpm desc, created_at asc);

-- Bảng tuần/ngày lọc `created_at > now() - interval ...` TRƯỚC rồi mới gộp, nên cần
-- một index dẫn đầu bằng thời gian rồi tới đúng thứ tự gộp. Không có nó thì hai bảng
-- đó vẫn phải sắp xếp lại phần dữ liệu trong khoảng thời gian.
create index if not exists scores_recent_dedup_idx
  on public.scores (created_at desc, language, time_limit, user_id, wpm desc);

-- `scores_leaderboard_idx` cũ giờ thừa: mọi truy vấn qua view đều đi theo thứ tự gộp
-- ở trên, không có truy vấn nào sắp theo wpm mà KHÔNG gộp theo user_id.
--
-- Xoá chứ không để lại: mỗi index thừa là thêm một lần ghi cho MỖI lượt gõ được gửi
-- lên, mà `scores` là bảng ghi nhiều nhất trong database này.
drop index if exists public.scores_leaderboard_idx;


-- ----------------------------------------------------------------------------
-- 2. Tìm người chơi
-- ----------------------------------------------------------------------------
-- Ô "find a player" chạy:
--
--   username ilike '%chuỗi%' or display_name ilike '%chuỗi%'
--
-- Dấu `%` ở ĐẦU làm index btree vô dụng — btree chỉ tra được theo tiền tố. Index
-- `profiles_display_name_idx on (lower(display_name))` hiện có không giúp gì cho
-- truy vấn này, nên mỗi lần gõ là một lần quét toàn bảng `profiles`.
--
-- pg_trgm cắt chuỗi thành từng cụm 3 ký tự và đánh index chúng, nên tra được cả khi
-- chuỗi tìm nằm ở GIỮA. Đây là cách duy nhất để `ilike '%...%'` dùng được index.
create extension if not exists pg_trgm;

create index if not exists profiles_display_name_trgm_idx
  on public.profiles using gin (display_name gin_trgm_ops);

create index if not exists profiles_username_trgm_idx
  on public.profiles using gin (username gin_trgm_ops);


-- ----------------------------------------------------------------------------
-- Kiểm lại
-- ----------------------------------------------------------------------------
-- Chạy hai câu này sau khi migration xong. Cả hai phải hiện "Index Scan" hoặc
-- "Bitmap Index Scan", KHÔNG được là "Seq Scan":
--
--   explain analyze
--   select * from public.leaderboard
--   where language = 'javascript' and time_limit = 30
--   order by wpm desc limit 10;
--
--   explain analyze
--   select id, display_name, username from public.profiles
--   where username ilike '%an%' or display_name ilike '%an%'
--   limit 8;
--
-- LƯU Ý: với bảng còn ít dòng, Postgres CỐ Ý chọn Seq Scan vì nó nhanh hơn thật.
-- Điều đó bình thường — index chỉ được dùng khi bảng đủ lớn để nó có lợi.
