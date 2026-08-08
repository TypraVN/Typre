import { getSupabase } from './supabase'
import type { AppUser } from './auth'

export interface Profile {
  id: string
  display_name: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/
export const DISPLAY_NAME_MAX = 32

/** Mã lỗi Postgres cho vi phạm ràng buộc duy nhất (username đã có người dùng). */
const UNIQUE_VIOLATION = '23505'

/**
 * Tạo hồ sơ lúc đăng nhập nếu chưa có. **Cố ý không ghi đè** hồ sơ đã tồn tại:
 * người dùng đổi tên trong Account settings rồi thì lần đăng nhập sau không được
 * bị OAuth ghi tên cũ trở lại.
 */
export async function ensureProfile(user: AppUser): Promise<void> {
  const supabase = await getSupabase()
  if (!supabase) return

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      display_name: user.displayName.slice(0, DISPLAY_NAME_MAX),
      avatar_url: user.avatarUrl,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  )
}

/**
 * Gọi lúc đăng nhập: tạo hồ sơ nếu chưa có rồi trả về hồ sơ THẬT trong database.
 * Nhờ vậy tên đã đổi trong Account settings vẫn đúng ở mọi nơi sau khi tải lại trang,
 * chứ không bị tên từ OAuth lấn lại.
 */
export async function syncProfile(user: AppUser): Promise<Profile | null> {
  await ensureProfile(user)
  return getMyProfile(user.id)
}

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const supabase = await getSupabase()
  if (!supabase) return null

  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return (data as Profile) ?? null
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await getSupabase()
  if (!supabase) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  return (data as Profile) ?? null
}

/**
 * Đổi tên hiển thị. Phải cập nhật CẢ các dòng điểm đã gửi — `scores.display_name`
 * là bản chụp lúc gửi, không sửa thì bảng xếp hạng còn hiện tên cũ mãi.
 */
export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<{ error: string | null }> {
  const name = displayName.trim()
  if (!name || name.length > DISPLAY_NAME_MAX) return { error: 'invalid-name' }

  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.from('profiles').update({ display_name: name, updated_at: new Date().toISOString() }).eq('id', userId)
  if (error) return { error: error.message }

  const { error: scoresError } = await supabase
    .from('scores')
    .update({ display_name: name })
    .eq('user_id', userId)

  return { error: scoresError ? scoresError.message : null }
}

export async function updateUsername(
  userId: string,
  username: string,
): Promise<{ error: 'taken' | 'invalid' | string | null }> {
  const value = username.trim().toLowerCase()
  if (!USERNAME_RE.test(value)) return { error: 'invalid' }

  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase
    .from('profiles')
    .update({ username: value, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.code === UNIQUE_VIOLATION ? 'taken' : error.message }
  return { error: null }
}

/** Tìm người để kết bạn — khớp cả username lẫn tên hiển thị. */
export async function searchProfiles(query: string, excludeId: string): Promise<Profile[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const supabase = await getSupabase()
  if (!supabase) return []

  // `%` trong chuỗi người dùng nhập sẽ thành ký tự đại diện — bỏ đi để ô tìm kiếm
  // không biến thành "liệt kê toàn bộ".
  const safe = q.replace(/[%,]/g, '')

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${safe}%,display_name.ilike.%${safe}%`)
    .neq('id', excludeId)
    .limit(10)

  return (data as Profile[]) ?? []
}

/** Xoá toàn bộ điểm của mình khỏi bảng xếp hạng ("reset personal bests"). */
export async function deleteMyScores(userId: string): Promise<{ error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.from('scores').delete().eq('user_id', userId)
  return { error: error ? error.message : null }
}
