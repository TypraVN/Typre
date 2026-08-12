import { getSupabase } from './supabase'

/**
 * Đẩy XP vừa kiếm được lên tài khoản.
 *
 * Cố ý gửi PHẦN TĂNG THÊM chứ không gửi tổng: gửi tổng thì client là nguồn sự thật và
 * ai cũng đặt được tổng = 999999. Gửi phần tăng thì server cộng dồn và tự chặn trần
 * (xem `supabase/add-xp-sync.sql`).
 *
 * Cũng nhờ vậy mà chơi trên hai máy vẫn cộng đúng: mỗi máy gửi phần của mình.
 */
export async function pushXp(amount: number): Promise<number | null> {
  if (!Number.isFinite(amount) || amount <= 0) return null

  const supabase = await getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('add_xp', { amount: Math.round(amount) })

  // Chưa chạy SQL thì function không tồn tại. Im lặng bỏ qua: XP ở máy vẫn chạy bình
  // thường, chỉ là chưa đồng bộ — không đáng để chặn luồng gõ hay hiện lỗi đỏ.
  if (error) return null

  return typeof data === 'number' ? data : null
}

/** XP của một loạt người, để bảng xếp hạng hiện cấp cạnh tên. */
export async function fetchXpFor(userIds: string[]): Promise<Record<string, number>> {
  if (userIds.length === 0) return {}

  const supabase = await getSupabase()
  if (!supabase) return {}

  const { data, error } = await supabase
    .from('profiles')
    .select('id, xp')
    .in('id', userIds)

  if (error || !data) return {}

  const out: Record<string, number> = {}
  for (const row of data as Array<{ id: string; xp: number | null }>) {
    out[row.id] = row.xp ?? 0
  }

  return out
}
