import { getSupabase } from './supabase'
import type { Profile } from './profiles'

export type FriendshipStatus = 'pending' | 'accepted'

interface FriendshipRow {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
}

/** Cùng một dòng friendship trông khác nhau tuỳ mình là ai trong đó. */
export type FriendKind = 'friend' | 'incoming' | 'outgoing'

export interface FriendEntry {
  friendshipId: string
  kind: FriendKind
  profile: Profile
}

export interface FriendLists {
  friends: FriendEntry[]
  incoming: FriendEntry[]
  outgoing: FriendEntry[]
  error: string | null
}

const EMPTY: FriendLists = { friends: [], incoming: [], outgoing: [], error: null }

/**
 * Đọc quan hệ rồi lấy hồ sơ của "người kia" trong một lần query thứ hai.
 * Không dùng join lồng của PostgREST vì `friendships` có HAI khoá ngoại cùng trỏ
 * về user — join kiểu đó phải chỉ rõ tên constraint và rất dễ vỡ khi đổi schema.
 */
export async function listFriends(userId: string): Promise<FriendLists> {
  const supabase = await getSupabase()
  if (!supabase) return { ...EMPTY, error: 'not-configured' }

  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) return { ...EMPTY, error: error.message }

  const rows = (data as FriendshipRow[]) ?? []
  if (rows.length === 0) return EMPTY

  const otherIds = rows.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id))

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', otherIds)

  if (profileError) return { ...EMPTY, error: profileError.message }

  const byId = new Map((profileData as Profile[]).map((p) => [p.id, p]))
  const lists: FriendLists = { friends: [], incoming: [], outgoing: [], error: null }

  for (const row of rows) {
    const otherId = row.requester_id === userId ? row.addressee_id : row.requester_id
    const profile = byId.get(otherId)
    // Hồ sơ có thể thiếu nếu tài khoản kia vừa bị xoá — bỏ qua thay vì hiện dòng rỗng.
    if (!profile) continue

    const kind: FriendKind =
      row.status === 'accepted' ? 'friend' : row.requester_id === userId ? 'outgoing' : 'incoming'

    lists[kind === 'friend' ? 'friends' : kind].push({
      friendshipId: row.id,
      kind,
      profile,
    })
  }

  return lists
}

/**
 * Gửi lời mời. Kiểm tra trước theo CẢ HAI chiều: ràng buộc unique của database chỉ
 * chặn trùng cùng chiều, nên nếu người kia đã mời mình trước thì insert vẫn lọt và
 * tạo ra hai dòng cho cùng một quan hệ.
 */
export async function sendFriendRequest(
  userId: string,
  targetId: string,
): Promise<{ error: 'self' | 'exists' | string | null }> {
  if (userId === targetId) return { error: 'self' }

  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { data: existing } = await supabase
    .from('friendships')
    .select('id')
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${userId})`,
    )
    .limit(1)

  if (existing && existing.length > 0) return { error: 'exists' }

  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: userId, addressee_id: targetId, status: 'pending' })

  return { error: error ? error.message : null }
}

export async function acceptFriendRequest(friendshipId: string): Promise<{ error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)

  return { error: error ? error.message : null }
}

/** Dùng chung cho: từ chối lời mời, huỷ lời mời đã gửi, và bỏ bạn. */
export async function removeFriendship(friendshipId: string): Promise<{ error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
  return { error: error ? error.message : null }
}
