-- ============================================================================
-- Thêm 4 ngôn ngữ mới vào ràng buộc của bảng `scores`: cpp, rust, css, json.
-- Chạy file này trong Supabase → SQL Editor sau khi cập nhật app.
--
-- KHÔNG chạy thì hỏng âm thầm: người dùng gõ C++/Rust/CSS/JSON bình thường, thấy
-- kết quả bình thường, nhưng bấm "submit to leaderboard" là Supabase từ chối vì
-- check constraint cũ không có tên ngôn ngữ đó.
--
-- An toàn để chạy lại (drop rồi add lại đúng constraint đó).
-- ============================================================================

alter table public.scores drop constraint if exists scores_language_check;

alter table public.scores add constraint scores_language_check check (
  language in (
    'javascript','typescript','csharp','python','java','go','sql','bash',
    'cpp','rust','html','css','json','text'
  )
);
