import { useEffect, useState } from 'react'
import { KeyRound, TriangleAlert, User } from 'lucide-react'
import { Modal } from './Modal'
import {
  DISPLAY_NAME_MAX,
  USERNAME_RE,
  deleteMyScores,
  getMyProfile,
  updateDisplayName,
  updateUsername,
  type Profile,
} from '../lib/profiles'
import type { AppUser } from '../lib/auth'
import type { Translation } from '../i18n/translations'

interface AccountSettingsDialogProps {
  user: AppUser
  onClose: () => void
  /** Đổi tên hiển thị xong thì App cần biết để hiện tên mới ngay, khỏi phải tải lại. */
  onProfileChange?: (profile: Profile) => void
  t: Translation
}

type Tab = 'account' | 'authentication' | 'danger'
type Saving = 'name' | 'username' | 'reset' | null

const TABS: { id: Tab; labelKey: keyof Translation; Icon: typeof User }[] = [
  { id: 'account', labelKey: 'tabAccount', Icon: User },
  { id: 'authentication', labelKey: 'tabAuthentication', Icon: KeyRound },
  { id: 'danger', labelKey: 'tabDangerZone', Icon: TriangleAlert },
]

const INPUT =
  'px-3 py-2 rounded border font-mono text-sm w-full border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-400'
const BTN =
  'px-4 py-2 rounded text-sm font-medium shrink-0 transition-colors duration-150 enabled:cursor-pointer bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 enabled:hover:border-orange-500 dark:enabled:hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed'
const DANGER_BTN =
  'px-4 py-2 rounded text-sm font-medium shrink-0 transition-colors duration-150 enabled:cursor-pointer border border-red-500/60 text-red-600 dark:text-red-400 enabled:hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed'

function Row({
  title,
  description,
  children,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
      <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">{title}</div>
      <div className="text-sm text-zinc-600 dark:text-zinc-300">{description}</div>
      <div className="flex flex-wrap items-center gap-2 mt-1">{children}</div>
    </div>
  )
}

export function AccountSettingsDialog({
  user,
  onClose,
  onProfileChange,
  t,
}: AccountSettingsDialogProps) {
  const [tab, setTab] = useState<Tab>('account')
  const [profile, setProfile] = useState<Profile | null>(null)
  // Không đọc được hồ sơ (chưa chạy migration, mất mạng...) thì phải KHOÁ ô nhập:
  // để mở thì bấm lưu sẽ update 0 dòng mà vẫn báo "đã đổi tên".
  const [profileState, setProfileState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [displayName, setDisplayName] = useState(user.displayName)
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState<Saving>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  // Xoá điểm là không hoàn tác được → bắt bấm hai lần, không dùng window.confirm.
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    getMyProfile(user.id).then((p) => {
      if (!p) {
        setProfileState('missing')
        return
      }
      setProfile(p)
      setDisplayName(p.display_name)
      setUsername(p.username ?? '')
      setProfileState('ready')
    })
  }, [user.id])

  const editable = profileState === 'ready'

  const publicLink = profile?.username
    ? `${window.location.origin}/#/u/${profile.username}`
    : null

  const saveName = async () => {
    setSaving('name')
    setMessage(null)
    const { error } = await updateDisplayName(user.id, displayName)
    setSaving(null)

    if (error) {
      setMessage({ kind: 'error', text: error === 'invalid-name' ? t.invalidName : error })
      return
    }

    const next = profile ? { ...profile, display_name: displayName.trim() } : null
    if (next) {
      setProfile(next)
      onProfileChange?.(next)
    }
    setMessage({ kind: 'ok', text: t.nameUpdated })
  }

  const saveUsername = async () => {
    setSaving('username')
    setMessage(null)
    const { error } = await updateUsername(user.id, username)
    setSaving(null)

    if (error) {
      setMessage({
        kind: 'error',
        text: error === 'taken' ? t.usernameTaken : error === 'invalid' ? t.usernameInvalid : error,
      })
      return
    }

    const next = profile ? { ...profile, username: username.trim().toLowerCase() } : null
    if (next) {
      setProfile(next)
      onProfileChange?.(next)
    }
    setMessage({ kind: 'ok', text: t.usernameUpdated })
  }

  const resetBests = async () => {
    setSaving('reset')
    setMessage(null)
    const { error } = await deleteMyScores(user.id)
    setSaving(null)
    setConfirmReset(false)
    setMessage(
      error ? { kind: 'error', text: error } : { kind: 'ok', text: t.bestsReset },
    )
  }

  return (
    <Modal
      label={t.menuAccountSettings}
      closeLabel={t.close}
      onClose={onClose}
      widthClass="max-w-3xl"
    >
      <div className="flex flex-col sm:flex-row">
        <nav className="sm:w-48 shrink-0 p-3 sm:border-r border-b sm:border-b-0 border-zinc-200 dark:border-zinc-800 flex sm:flex-col gap-1 overflow-x-auto">
          {TABS.map(({ id, labelKey, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-left whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                tab === id
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${id === 'danger' ? 'text-red-500' : 'text-zinc-400'}`} />
              {t[labelKey]}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0 px-6 py-4 pr-12">
          {tab === 'account' && (
            <>
              {profileState === 'missing' && (
                <div className="mb-2 px-3 py-2 rounded border border-yellow-500/50 bg-yellow-500/10 font-mono text-xs text-yellow-700 dark:text-yellow-400">
                  {t.profileUnavailable}
                </div>
              )}

              <Row title={t.updateNameTitle} description={t.updateNameDesc}>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={DISPLAY_NAME_MAX}
                  aria-label={t.updateNameTitle}
                  disabled={!editable}
                  className={INPUT}
                />
                <button
                  type="button"
                  onClick={saveName}
                  disabled={
                    !editable || saving !== null || displayName.trim() === (profile?.display_name ?? '')
                  }
                  className={BTN}
                >
                  {saving === 'name' ? t.saving : t.updateName}
                </button>
              </Row>

              <Row
                title={t.usernameTitle}
                description={
                  <>
                    {t.usernameDesc}
                    {publicLink && (
                      <div className="mt-1 font-mono text-xs text-orange-600 dark:text-orange-400 break-all">
                        {publicLink}
                      </div>
                    )}
                  </>
                }
              >
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="nhat_dep_trai"
                  aria-label={t.usernameTitle}
                  disabled={!editable}
                  className={INPUT}
                />
                <button
                  type="button"
                  onClick={saveUsername}
                  disabled={
                    !editable ||
                    saving !== null ||
                    !USERNAME_RE.test(username.trim()) ||
                    username.trim() === (profile?.username ?? '')
                  }
                  className={BTN}
                >
                  {saving === 'username' ? t.saving : t.saveUsername}
                </button>
              </Row>
            </>
          )}

          {tab === 'authentication' && (
            <>
              <Row title={t.signedInWith} description={t.signedInWithDesc}>
                <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
                  {user.provider ?? '—'}
                </span>
              </Row>
              <Row title={t.emailLabel} description={t.emailRowDesc}>
                <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">
                  {user.email ?? '—'}
                </span>
              </Row>
            </>
          )}

          {tab === 'danger' && (
            <Row
              title={t.resetBestsTitle}
              description={
                <>
                  {t.resetBestsDesc}{' '}
                  <span className="text-red-600 dark:text-red-400">{t.cannotUndo}</span>
                </>
              }
            >
              {confirmReset ? (
                <>
                  <button
                    type="button"
                    onClick={resetBests}
                    disabled={saving !== null}
                    className={DANGER_BTN}
                  >
                    {saving === 'reset' ? t.saving : t.confirmReset}
                  </button>
                  <button type="button" onClick={() => setConfirmReset(false)} className={BTN}>
                    {t.cancel}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className={DANGER_BTN}
                >
                  {t.resetBests}
                </button>
              )}
            </Row>
          )}

          {message && (
            <div
              className={`mt-4 font-mono text-xs ${
                message.kind === 'ok'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
