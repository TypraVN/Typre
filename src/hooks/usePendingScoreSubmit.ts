import { useEffect, useState } from 'react'
import { submitScore } from '../lib/leaderboard'
import { takePendingScore } from '../lib/pendingScore'
import type { AppUser } from '../lib/auth'

export type PendingSubmitStatus = 'sending' | 'done' | 'failed'

export interface PendingSubmitNotice {
  status: PendingSubmitStatus
  wpm: number
}

// Thông báo thành công tự tắt; thất bại thì để người dùng tự đóng (còn đọc được lý do).
const AUTO_DISMISS_MS = 6000

/**
 * Vừa đăng nhập xong mà có điểm đang chờ (lưu trước lúc redirect) thì gửi luôn, không
 * bắt người dùng gõ lại. `takePendingScore` xoá ngay khi đọc nên dù effect chạy lại
 * (mỗi auth event tạo object user mới) cũng chỉ gửi đúng một lần.
 */
export function usePendingScoreSubmit(user: AppUser | null) {
  const [notice, setNotice] = useState<PendingSubmitNotice | null>(null)

  useEffect(() => {
    if (!user) return

    const pending = takePendingScore()
    if (!pending) return

    let cancelled = false
    setNotice({ status: 'sending', wpm: pending.wpm })

    submitScore({
      user,
      language: pending.language,
      timeLimit: pending.timeLimit,
      wpm: pending.wpm,
      cpm: pending.cpm,
      rawWpm: pending.rawWpm,
      consistency: pending.consistency,
      accuracy: pending.accuracy,
    }).then(({ error }) => {
      if (cancelled) return
      setNotice({ status: error ? 'failed' : 'done', wpm: pending.wpm })
    })

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (notice?.status !== 'done') return
    const timer = setTimeout(() => setNotice(null), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [notice])

  return { notice, dismissNotice: () => setNotice(null) }
}
