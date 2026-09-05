-- ============================================================================
-- Bảng xếp hạng cờ vua: điểm ELO tính từ ván đấu ONLINE giữa hai người đã đăng nhập.
-- Chạy trong Supabase → SQL Editor, sau schema.sql + migration-account-features.sql.
--
-- VÌ SAO CHỈ TÍNH VÁN ONLINE (không tính đấu bot / hai người chung máy):
-- đấu bot có thể chọn độ khó, dễ farm thắng liên tục để leo hạng; hai người chung máy
-- không xác thực được ai là ai. Chỉ ván online (qua phòng Realtime) mới có đúng HAI TÀI
-- KHOẢN THẬT đối đầu — đủ để tính điểm công bằng.
--
-- VÌ SAO CLIENT KHÔNG TỰ GHI ĐIỂM: y hệt lý do ở add-xp-sync.sql — client tính ra ai
-- thắng thì cũng tự khai được ai thắng. Toàn bộ việc GHI (cả bảng `chess_games` lẫn cột
-- `rating`) đi qua MỘT function `record_chess_result` (security definer) — client chỉ có
-- quyền SELECT, không có insert/update trực tiếp trên hai bảng dưới.
--
-- An toàn để chạy lại.
-- ============================================================================

create table if not exists public.chess_ratings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_url text,
  rating int not null default 1200 check (rating between 100 and 3000),
  games int not null default 0 check (games >= 0),
  wins int not null default 0 check (wins >= 0),
  losses int not null default 0 check (losses >= 0),
  draws int not null default 0 check (draws >= 0),
  updated_at timestamptz not null default now()
);

alter table public.chess_ratings enable row level security;

drop policy if exists chess_ratings_select_all on public.chess_ratings;
create policy chess_ratings_select_all
  on public.chess_ratings for select
  to anon, authenticated
  using (true);

-- Không có policy insert/update nào cho client — chỉ `record_chess_result` (chạy với
-- quyền riêng, bỏ qua RLS) mới ghi được.

create index if not exists chess_ratings_rank_idx on public.chess_ratings (rating desc);


-- Nhật ký từng ván đã tính điểm — chủ yếu để chặn CỘNG ĐIỂM HAI LẦN (cả hai người chơi
-- đều gọi `record_chess_result` cho cùng một ván khi ván kết thúc), khoá bằng `game_id`.
create table if not exists public.chess_games (
  game_id text primary key,
  white_id uuid not null references auth.users(id) on delete cascade,
  black_id uuid not null references auth.users(id) on delete cascade,
  winner text not null check (winner in ('w', 'b', 'draw')),
  reason text not null check (char_length(reason) between 1 and 40),
  white_rating_after int not null,
  black_rating_after int not null,
  created_at timestamptz not null default now()
);

alter table public.chess_games enable row level security;

drop policy if exists chess_games_select_all on public.chess_games;
create policy chess_games_select_all
  on public.chess_games for select
  to anon, authenticated
  using (true);

create index if not exists chess_games_created_idx on public.chess_games (created_at desc);


/**
 * Ghi nhận kết quả MỘT ván đấu online và cập nhật ELO cả hai bên trong MỘT giao dịch.
 *
 * Gọi từ CẢ HAI người chơi ngay khi ván kết thúc — client nào gọi trước cũng được, client
 * gọi sau bị chặn bởi khoá `game_id` DUY NHẤT (kiểm tồn tại rồi mới ghi, trong cùng một
 * function nên không có khe hở giữa lúc kiểm và lúc ghi).
 *
 * `security definer`: chạy với quyền của function (không phải quyền người gọi) — bắt
 * buộc, vì người gọi cần sửa được điểm của ĐỐI THỦ chứ không chỉ điểm của mình, mà RLS
 * thường không cho phép việc đó. Bù lại, function tự kiểm `auth.uid()` phải là MỘT trong
 * hai người chơi của chính ván đó — không ai gọi hộ/khai khống ván của người khác được.
 */
create or replace function public.record_chess_result(
  p_game_id text,
  p_white_id uuid,
  p_black_id uuid,
  p_white_name text,
  p_black_name text,
  p_white_avatar text,
  p_black_avatar text,
  p_winner text,
  p_reason text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  white_rating int;
  black_rating int;
  expected_white numeric;
  score_white numeric;
  new_white_rating int;
  new_black_rating int;
  k constant int := 32;
begin
  if caller is null or (caller <> p_white_id and caller <> p_black_id) then
    raise exception 'not a participant of this game';
  end if;
  if p_white_id = p_black_id then
    raise exception 'invalid players';
  end if;
  if p_winner not in ('w', 'b', 'draw') then
    raise exception 'invalid winner';
  end if;

  -- Ván này đã được người chơi kia ghi trước rồi — thôi, không cộng điểm lần hai.
  if exists (select 1 from public.chess_games where game_id = p_game_id) then
    return;
  end if;

  insert into public.chess_ratings (user_id, display_name, avatar_url)
    values (p_white_id, p_white_name, p_white_avatar)
    on conflict (user_id) do update
      set display_name = excluded.display_name, avatar_url = excluded.avatar_url
    returning rating into white_rating;

  insert into public.chess_ratings (user_id, display_name, avatar_url)
    values (p_black_id, p_black_name, p_black_avatar)
    on conflict (user_id) do update
      set display_name = excluded.display_name, avatar_url = excluded.avatar_url
    returning rating into black_rating;

  -- Công thức ELO chuẩn: kỳ vọng thắng của Trắng theo hiệu điểm hai bên, K=32 (biên độ
  -- vừa phải — không nhảy điểm quá mạnh sau một ván, cũng không ì ạch quá chậm).
  expected_white := 1.0 / (1.0 + power(10, (black_rating - white_rating) / 400.0));
  score_white := case p_winner when 'w' then 1 when 'b' then 0 else 0.5 end;

  new_white_rating := round(white_rating + k * (score_white - expected_white));
  new_black_rating := round(black_rating + k * ((1 - score_white) - (1 - expected_white)));

  update public.chess_ratings set
    rating = new_white_rating,
    games = games + 1,
    wins = wins + (case when p_winner = 'w' then 1 else 0 end),
    losses = losses + (case when p_winner = 'b' then 1 else 0 end),
    draws = draws + (case when p_winner = 'draw' then 1 else 0 end),
    updated_at = now()
  where user_id = p_white_id;

  update public.chess_ratings set
    rating = new_black_rating,
    games = games + 1,
    wins = wins + (case when p_winner = 'b' then 1 else 0 end),
    losses = losses + (case when p_winner = 'w' then 1 else 0 end),
    draws = draws + (case when p_winner = 'draw' then 1 else 0 end),
    updated_at = now()
  where user_id = p_black_id;

  insert into public.chess_games (
    game_id, white_id, black_id, winner, reason, white_rating_after, black_rating_after
  ) values (
    p_game_id, p_white_id, p_black_id, p_winner, p_reason, new_white_rating, new_black_rating
  );
end;
$$;

revoke all on function public.record_chess_result(
  text, uuid, uuid, text, text, text, text, text, text
) from public;
grant execute on function public.record_chess_result(
  text, uuid, uuid, text, text, text, text, text, text
) to authenticated;
