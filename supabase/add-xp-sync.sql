-- ============================================================================
-- XP đồng bộ lên tài khoản, để hiện cấp cạnh tên trên bảng xếp hạng.
-- Chạy trong Supabase → SQL Editor, sau migration-account-features.sql.
--
-- VÌ SAO KHÔNG cho client tự ghi `profiles.xp`:
-- wpm tính ở client nên XP vốn đã gian lận được. XP chỉ nằm ở máy thì không sao —
-- tự lừa mình. Nhưng khi cấp hiện trên bảng xếp hạng thì nó thành thứ đáng gian lận.
-- Cho client UPDATE thẳng cột xp là đưa luôn quyền đặt xp = 999999.
--
-- Cách chặn: chỉ cho gọi function `add_xp(amount)`, function CỘNG THÊM và tự chặn trần
-- theo mỗi lần gọi và theo ngày. Kẻ gian vẫn tăng được nhưng phải mất thời gian thật,
-- còn người chơi bình thường không bao giờ chạm trần.
--
-- An toàn để chạy lại.
-- ============================================================================

alter table public.profiles
  add column if not exists xp int not null default 0 check (xp >= 0),
  -- Hai cột dưới chỉ để chặn trần theo ngày, không dùng để hiển thị.
  add column if not exists xp_day date,
  add column if not exists xp_today int not null default 0;

comment on column public.profiles.xp is
  'XP tích luỹ. Chỉ ghi được qua add_xp(); client KHÔNG có quyền update cột này.';


create or replace function public.add_xp(amount int)
returns int
language plpgsql
security definer
-- `set search_path` là bắt buộc với security definer: không có nó, người gọi có thể
-- đổi search_path để trỏ `profiles` sang bảng của họ và function chạy trên bảng đó.
set search_path = public
as $$
declare
  -- Một lượt 60s hoàn hảo được ~205 XP, nên 400 là rất thoáng cho người chơi thật.
  per_call constant int := 400;
  -- ~25 lượt hoàn hảo/ngày. Người chơi bình thường không tới, kẻ cày thì bị chặn.
  per_day constant int := 5000;
  today date := current_date;
  grant_amount int;
  result int;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- Gọi với 0/null = chỉ đọc, dùng khi client muốn lấy tổng hiện tại.
  if amount is null or amount <= 0 then
    select xp into result from public.profiles where id = auth.uid();
    return coalesce(result, 0);
  end if;

  -- Sang ngày mới thì bộ đếm ngày về 0. Làm trong cùng một câu update để không có
  -- khoảng trống giữa lúc đọc và lúc ghi.
  update public.profiles
  set xp_today = case when xp_day = today then xp_today else 0 end,
      xp_day = today
  where id = auth.uid();

  select least(least(amount, per_call), greatest(per_day - xp_today, 0))
  into grant_amount
  from public.profiles
  where id = auth.uid();

  if grant_amount is null then
    -- Chưa có hồ sơ (đăng nhập xong app mới tạo) thì bỏ qua, lần sau cộng.
    return 0;
  end if;

  update public.profiles
  set xp = xp + grant_amount,
      xp_today = xp_today + grant_amount
  where id = auth.uid()
  returning xp into result;

  return result;
end;
$$;

-- Chỉ người đã đăng nhập gọi được, và KHÔNG cấp quyền update cột xp cho ai —
-- đường duy nhất để xp tăng là qua function này.
revoke all on function public.add_xp(int) from public;
grant execute on function public.add_xp(int) to authenticated;
