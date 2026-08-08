import { useEffect, useState } from 'react'
import { getCurrentSession, onAuthChange, toAppUser, type AppUser } from '../lib/auth'
import { isLeaderboardEnabled } from '../lib/supabase'
import { syncProfile } from '../lib/profiles'

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null)
  // `loading` để UI không nháy nút "Đăng nhập" trong lúc còn đang đọc session cũ.
  const [loading, setLoading] = useState(isLeaderboardEnabled)
  // Vào app từ link đặt lại mật khẩu: đã có session nhưng phải đặt mật khẩu mới trước.
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!isLeaderboardEnabled) return

    let cancelled = false

    /**
     * Hiện tên từ OAuth trước cho nhanh, rồi thay bằng hồ sơ trong database khi đọc
     * xong — nếu chờ hồ sơ mới hiện gì thì header trống một nhịp mỗi lần tải trang.
     */
    const apply = (nextUser: AppUser | null) => {
      setUser(nextUser)
      setLoading(false)
      if (!nextUser) return

      syncProfile(nextUser).then((profile) => {
        if (cancelled || !profile) return
        setUser((current) =>
          current && current.id === nextUser.id
            ? {
                ...current,
                displayName: profile.display_name,
                avatarUrl: profile.avatar_url ?? current.avatarUrl,
              }
            : current,
        )
      })
    }

    getCurrentSession().then((session) => {
      if (cancelled) return
      apply(session?.user ? toAppUser(session.user) : null)
    })

    const unsubscribe = onAuthChange((session, event) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      apply(session?.user ? toAppUser(session.user) : null)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return { user, loading, recovery, clearRecovery: () => setRecovery(false) }
}
