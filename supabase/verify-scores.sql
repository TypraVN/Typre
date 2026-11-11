-- Bảng xếp hạng XÁC MINH: chỉ server (Edge Function `submit-score`) được ghi điểm.
--
-- Chạy trong SQL Editor SAU KHI đã deploy function `submit-score` (xem functions/README.md).
-- Chạy trước thì trong lúc chờ deploy, không ai gửi được điểm.
--
-- Trước đây trình duyệt tự ghi điểm vào `scores`, nên ai đăng nhập cũng gửi thẳng được một
-- con số bất kỳ qua API. Giờ function chạy lại bản ghi phím, tự tính điểm, rồi ghi bằng
-- service role — service role bỏ qua RLS nên không cần policy INSERT nào cho nó.
--
-- Chạy lại nhiều lần không sao: mọi lệnh đều `if not exists` / `if exists`.

alter table public.scores
  -- Điểm do server chấm lại từ bản ghi phím. Điểm cũ (513 dòng trước khi có function)
  -- giữ nguyên với `false` = "chưa xác minh".
  add column if not exists verified boolean not null default false,
  -- Bài đã gõ — để biết điểm đó đạt trên bài nào, và kiểm lại được về sau.
  add column if not exists snippet_id text,
  -- Gõ ở Strict mode (sai phải sửa ngay mới đi tiếp).
  add column if not exists strict boolean not null default false,
  -- Mã riêng của lượt gõ: cùng một lượt gửi hai lần (mạng chập chờn, bấm lại) chỉ ghi một.
  add column if not exists run_id uuid;

create unique index if not exists scores_run_id_key
  on public.scores (run_id)
  where run_id is not null;

-- Thu hồi quyền ghi trực tiếp của người dùng. Không còn policy INSERT nào cho
-- `authenticated` = trình duyệt không ghi được vào `scores` nữa, chỉ function ghi được.
drop policy if exists "scores_insert_own" on public.scores;
drop policy if exists "scores_public_insert" on public.scores;
