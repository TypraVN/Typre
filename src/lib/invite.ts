const KEY = 'codetyping-pending-invite'

// Để lâu quá thì lời mời đó chẳng còn liên quan gì tới việc vừa làm — coi như không có.
const MAX_AGE_MS = 30 * 60 * 1000

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Link mời bạn: mở app rồi tự gửi lời kết bạn tới đúng user này ngay sau khi đăng nhập. */
export function buildInviteUrl(userId: string): string {
  return `${window.location.origin}/?invite=${userId}`
}

/**
 * Đọc `?invite=<id người mời>` lúc trang vừa tải, LƯU VÀO localStorage rồi xoá khỏi URL
 * ngay lập tức — không đợi đăng nhập xong mới đọc.
 *
 * Lý do phải lưu sớm: đăng nhập bằng OAuth/magic link luôn làm trình duyệt rời khỏi
 * trang rồi quay lại bằng một URL khác, nên `?invite=` sẽ mất trước khi kịp dùng — cùng
 * lý do `pendingScore.ts` tồn tại. Dùng localStorage (không phải sessionStorage) vì magic
 * link trong email mở ở TAB MỚI, không có sessionStorage của tab cũ.
 */
export function capturePendingInviteFromUrl(): void {
  try {
    const url = new URL(window.location.href)
    const raw = url.searchParams.get('invite')
    if (!raw || !UUID_RE.test(raw)) return

    localStorage.setItem(KEY, JSON.stringify({ inviterId: raw, savedAt: Date.now() }))
    url.searchParams.delete('invite')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  } catch {
    // Không đọc/sửa được URL hay storage thì bỏ qua — mất mỗi tiện lợi tự kết bạn.
  }
}

/**
 * Đọc VÀ xoá luôn trong một lần gọi — nếu chỉ đọc thì hai lần auth event liên tiếp sẽ
 * gửi trùng lời mời kết bạn.
 */
export function takePendingInvite(): string | null {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return null
  }
  if (!raw) return null

  try {
    localStorage.removeItem(KEY)
  } catch {
    // Xoá không được thì thôi, không đáng để chặn luồng vì việc dọn dẹp.
  }

  try {
    const parsed = JSON.parse(raw) as { inviterId: string; savedAt: number }
    if (typeof parsed?.inviterId !== 'string' || typeof parsed?.savedAt !== 'number') return null
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null
    return parsed.inviterId
  } catch {
    return null
  }
}
