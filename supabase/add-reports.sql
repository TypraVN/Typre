-- ============================================================================
-- Bảng nhận báo lỗi / góp ý từ người dùng.
-- Chạy trong Supabase → SQL Editor. An toàn để chạy lại.
--
-- Vì sao cần: người dùng chỉ nói được "chỗ này lỗi". Không có thông tin kỹ thuật
-- kèm theo thì mỗi lần như vậy là một vòng đoán mò — đã mất nguyên một buổi cho
-- đúng một dòng lỗi mà lẽ ra người dùng gửi kèm được ngay từ đầu.
-- ============================================================================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),

  -- Người dùng tự viết. Giới hạn độ dài ngay ở database: giới hạn phía giao diện
  -- chặn được người dùng thật, không chặn được ai gọi thẳng API.
  message text not null check (char_length(message) between 3 and 2000),

  -- Thông tin kỹ thuật app tự thu thập (trình duyệt, cỡ màn, phiên bản build,
  -- lỗi console gần nhất). Dạng jsonb để sau này thêm trường mà không phải migrate.
  context jsonb not null default '{}'::jsonb,

  -- Ai gửi, nếu có đăng nhập. Khách gửi thì để null — không bắt đăng nhập mới được
  -- báo lỗi, vì phần lớn lỗi xảy ra đúng lúc người ta chưa kịp đăng nhập.
  user_id uuid references auth.users (id) on delete set null,

  created_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);

alter table public.reports enable row level security;

-- CHỈ cho GHI, không cho đọc.
--
-- Không có policy select nào, kể cả cho người đã đăng nhập: báo lỗi có thể chứa
-- thông tin riêng, và không ai cần đọc báo lỗi của người khác. Chủ dự án đọc qua
-- Supabase Dashboard (bỏ qua RLS).
drop policy if exists "reports_insert_any" on public.reports;
create policy "reports_insert_any"
  on public.reports for insert
  to anon, authenticated
  with check (
    -- Khách thì user_id phải là null; người đã đăng nhập chỉ được gửi dưới tên
    -- chính mình. Chặn việc gán báo lỗi cho tài khoản người khác.
    user_id is null or auth.uid() = user_id
  );

-- ============================================================================
-- HẠN CHẾ ĐÃ BIẾT: chưa có giới hạn tần suất phía server.
--
-- Giao diện có khoảng chờ giữa hai lần gửi, nhưng ai gọi thẳng API vẫn spam được.
-- Với quy mô hiện tại thì chấp nhận được. Khi nào bị spam thật, cách nhanh nhất là
-- tắt policy trên:
--
--   drop policy "reports_insert_any" on public.reports;
--
-- Cách bền hơn là chuyển việc ghi vào một Edge Function có kiểm tần suất theo IP.
-- ============================================================================

-- Đọc báo lỗi mới nhất:
--   select created_at, message, context from public.reports order by created_at desc limit 20;
