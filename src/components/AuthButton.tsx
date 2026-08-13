import { Suspense, useState } from 'react'
import { lazyChunk } from '../lib/lazyChunk'
import { LogIn } from 'lucide-react'
import type { AppUser } from '../lib/auth'
import { AccountMenu, type AccountMenuAction } from './AccountMenu'
import { getMyProfile } from '../lib/profiles'
import { isLeaderboardEnabled } from '../lib/supabase'
import type { SnippetLanguage } from '../data/types'
import type { Translation } from '../i18n/translations'

// Hộp thoại đăng nhập kéo theo logo 3 hãng — chỉ tải khi người dùng thật sự mở nó.
const SignInDialog = lazyChunk('SignInDialog', () =>
  import('./SignInDialog').then((m) => ({ default: m.SignInDialog })),
)

const UserStatsDialog = lazyChunk('UserStatsDialog', () =>
  import('./UserStatsDialog').then((m) => ({ default: m.UserStatsDialog })),
)

const AccountSettingsDialog = lazyChunk('AccountSettingsDialog', () =>
  import('./AccountSettingsDialog').then((m) => ({ default: m.AccountSettingsDialog })),
)

const FriendsDialog = lazyChunk('FriendsDialog', () =>
  import('./FriendsDialog').then((m) => ({ default: m.FriendsDialog })),
)

interface AuthButtonProps {
  user: AppUser | null
  loading: boolean
  languages: readonly SnippetLanguage[]
  timeLimits: readonly number[]
  t: Translation
}

const BTN =
  'px-3 py-1 text-sm rounded border cursor-pointer transition-colors duration-150 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500'

export function AuthButton({ user, loading, languages, timeLimits, t }: AuthButtonProps) {
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<AccountMenuAction | null>(null)
  const [nameOverride, setNameOverride] = useState<string | null>(null)

  if (!isLeaderboardEnabled) return null

  // Chưa biết đã đăng nhập chưa: giữ chỗ để header không nhảy khi biết kết quả.
  if (loading) return <div className="w-24 h-7" aria-hidden />

  if (user) {
    // Đổi tên trong Account settings phải thấy ngay trên header, không đợi tải lại trang.
    const shown = nameOverride ? { ...user, displayName: nameOverride } : user
    const close = () => setPanel(null)

    // "Public profile" là trang có địa chỉ riêng, không phải panel. Chưa đặt username
    // thì chưa có địa chỉ nào để mở → đưa thẳng tới chỗ đặt nó.
    const handleAction = (action: AccountMenuAction) => {
      if (action !== 'profile') {
        setPanel(action)
        return
      }

      getMyProfile(user.id).then((profile) => {
        if (profile?.username) window.location.hash = `#/u/${profile.username}`
        else setPanel('settings')
      })
    }

    return (
      <>
        <AccountMenu user={shown} t={t} onAction={handleAction} />

        <Suspense fallback={null}>
          {panel === 'stats' && (
            <UserStatsDialog
              user={shown}
              languages={languages}
              timeLimits={timeLimits}
              onClose={close}
              t={t}
            />
          )}

          {panel === 'friends' && <FriendsDialog user={shown} onClose={close} t={t} />}

          {panel === 'settings' && (
            <AccountSettingsDialog
              user={shown}
              onClose={close}
              onProfileChange={(profile) => setNameOverride(profile.display_name)}
              t={t}
            />
          )}
        </Suspense>
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${BTN} flex items-center gap-1.5`}
      >
        <LogIn className="w-4 h-4" />
        {t.signIn}
      </button>

      {open && (
        <Suspense fallback={null}>
          <SignInDialog onClose={() => setOpen(false)} t={t} />
        </Suspense>
      )}
    </>
  )
}
