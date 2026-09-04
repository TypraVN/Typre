import { useEffect, useState } from 'react'
import { sendFriendRequest } from '../lib/friends'
import { takePendingInvite } from '../lib/invite'
import type { AppUser } from '../lib/auth'

export type PendingInviteStatus = 'sending' | 'done' | 'exists' | 'self' | 'failed'

// Thành công/đã sẵn bạn thì tự tắt; thất bại thì để người dùng tự đóng (còn đọc lý do).
const AUTO_DISMISS_MS = 6000

/**
 * Vừa đăng nhập xong mà có lời mời kết bạn đang chờ (mở link `/?invite=<id>` trước lúc
 * đăng nhập) thì gửi lời kết bạn luôn, không bắt người dùng tự tìm lại người đã mời.
 * `takePendingInvite` xoá ngay khi đọc nên dù effect chạy lại (mỗi auth event tạo object
 * user mới) cũng chỉ gửi đúng một lần.
 */
export function usePendingInvite(user: AppUser | null) {
  const [notice, setNotice] = useState<PendingInviteStatus | null>(null)

  useEffect(() => {
    if (!user) return

    const inviterId = takePendingInvite()
    if (!inviterId) return

    // Tự mở link mời của chính mình (test, hoặc share nhầm) — không có gì để gửi.
    if (inviterId === user.id) {
      setNotice('self')
      return
    }

    let cancelled = false
    setNotice('sending')

    sendFriendRequest(user.id, inviterId).then(({ error }) => {
      if (cancelled) return
      setNotice(error === 'exists' ? 'exists' : error ? 'failed' : 'done')
    })

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (notice === null || notice === 'failed') return
    const timer = setTimeout(() => setNotice(null), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [notice])

  return { inviteNotice: notice, dismissInviteNotice: () => setNotice(null) }
}
