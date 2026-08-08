import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import {
  PASSWORD_MIN,
  getEnabledProviders,
  sendPasswordReset,
  signInWith,
  signInWithEmail,
  signInWithPassword,
  signUpWithPassword,
  SUPPORTED_PROVIDERS,
  type OAuthProvider,
} from '../lib/auth'
import { ProviderIcon } from './ProviderIcon'
import { Logo } from './Logo'
import type { Translation } from '../i18n/translations'

interface SignInDialogProps {
  onClose: () => void
  t: Translation
}

/** signin/signup dùng mật khẩu; magic + forgot chỉ cần email. */
type Mode = 'signin' | 'signup' | 'magic' | 'forgot'

// Đủ để chặn lỗi gõ nhầm; xác thực thật vẫn do Supabase làm.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PROVIDER_LABEL: Record<OAuthProvider, keyof Translation> = {
  google: 'continueWithGoogle',
  facebook: 'continueWithFacebook',
  github: 'continueWithGithub',
}

const INPUT =
  'w-full px-3 py-2 rounded border font-mono text-sm border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-400'
const LINK =
  'text-xs text-orange-600 dark:text-orange-400 hover:underline cursor-pointer bg-transparent border-0 p-0'

export function SignInDialog({ onClose, t }: SignInDialogProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // null = chưa biết provider nào bật; nút vẫn hiện nhưng tạm khoá.
  const [enabled, setEnabled] = useState<OAuthProvider[] | null>(null)
  // Provider đang chờ chuyển trang. Giữa lúc bấm và lúc trang thật sự nhảy đi có một
  // khoảng gọi mạng — không báo gì thì trông như bấm không ăn.
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getEnabledProviders().then(setEnabled)
    emailRef.current?.focus()
  }, [])

  // Escape để đóng — hộp thoại nào cũng nên có, nhất là khi nó chặn cả màn hình.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  /** Đổi chế độ thì xoá hết thông báo cũ, không thì màn mới hiện lời nhắc của màn cũ. */
  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  const handleProvider = async (provider: OAuthProvider) => {
    setError(null)
    setPendingProvider(provider)

    const { error: err } = await signInWith(provider)

    // Thành công thì trang đang chuyển đi — cứ để nguyên trạng thái "đang chuyển".
    if (err) {
      setPendingProvider(null)
      // Hiện lý do thật (vd "Unsupported provider") thay vì luôn một câu chung chung.
      setError(err === 'not-configured' ? t.leaderboardOffline : err)
    }
  }

  const needsPassword = mode === 'signin' || mode === 'signup'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)

    const mail = email.trim()
    if (!EMAIL_RE.test(mail)) {
      setError(t.invalidEmail)
      return
    }
    if (needsPassword && password.length < PASSWORD_MIN) {
      setError(t.passwordTooShort)
      return
    }

    setBusy(true)

    if (mode === 'signin') {
      const { error: err } = await signInWithPassword(mail, password)
      setBusy(false)
      // Sai email HOẶC sai mật khẩu đều trả về cùng một lỗi — cố ý như vậy, để không
      // ai dò được email nào đã có tài khoản.
      if (err) setError(err)
      else onClose()
      return
    }

    if (mode === 'signup') {
      const { error: err, needsConfirmation } = await signUpWithPassword(mail, password)
      setBusy(false)
      if (err) setError(err)
      else if (needsConfirmation) setNotice(t.confirmEmailSent)
      else onClose()
      return
    }

    if (mode === 'forgot') {
      const { error: err } = await sendPasswordReset(mail)
      setBusy(false)
      if (err) setError(err)
      else setNotice(t.resetEmailSent)
      return
    }

    const { error: err } = await signInWithEmail(mail)
    setBusy(false)
    if (err) setError(err)
    else setNotice(t.magicLinkSent)
  }

  const submitLabel =
    mode === 'signin'
      ? t.signIn
      : mode === 'signup'
        ? t.createAccount
        : mode === 'forgot'
          ? t.sendResetLink
          : t.sendMagicLink

  const title =
    mode === 'signup' ? t.signUpTitle : mode === 'forgot' ? t.forgotTitle : t.signInTitle
  const subtitle =
    mode === 'signup'
      ? t.signUpSubtitle
      : mode === 'forgot'
        ? t.forgotSubtitle
        : mode === 'magic'
          ? t.magicSubtitle
          : t.signInSubtitle

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      onMouseDown={(e) => {
        // Chỉ đóng khi bấm đúng lớp nền, không phải khi bấm bên trong thẻ.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 animate-pop-in"
      >
        <button
          type="button"
          onClick={onClose}
          title={t.close}
          aria-label={t.close}
          className="absolute top-3 right-3 p-1 rounded cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors duration-150"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <Logo size="sm" />
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>

          {notice ? (
            <div className="px-3 py-3 rounded border border-green-600/40 bg-green-500/10 font-mono text-sm text-green-700 dark:text-green-400">
              {notice}
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-3">
              {/* noValidate ở trên: để mọi lỗi hiện cùng một kiểu trong app. Không tắt
                  thì email sai định dạng bị trình duyệt chặn bằng bong bóng riêng của
                  nó và thông báo của mình không bao giờ chạy tới. */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="signin-email"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {t.emailLabel}
                </label>
                <input
                  id="signin-email"
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={INPUT}
                />
              </div>

              {needsPassword && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="signin-password"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      // Gợi ý đúng loại giúp trình quản lý mật khẩu lưu/điền chính xác.
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      className={`${INPUT} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      title={showPassword ? t.hidePassword : t.showPassword}
                      aria-label={showPassword ? t.hidePassword : t.showPassword}
                      className="absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                      {t.passwordHint}
                    </span>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || pendingProvider !== null}
                className="mt-1 px-4 py-2.5 rounded font-medium text-sm cursor-pointer transition-colors duration-150 bg-zinc-900 dark:bg-orange-500 text-white hover:bg-zinc-700 dark:hover:bg-orange-400 disabled:opacity-50"
              >
                {busy ? t.saving : submitLabel}
              </button>

              <div className="flex flex-wrap items-center justify-between gap-2">
                {mode === 'signin' && (
                  <>
                    <button type="button" onClick={() => switchMode('forgot')} className={LINK}>
                      {t.forgotPassword}
                    </button>
                    <button type="button" onClick={() => switchMode('signup')} className={LINK}>
                      {t.needAccount}
                    </button>
                  </>
                )}
                {mode === 'signup' && (
                  <button type="button" onClick={() => switchMode('signin')} className={LINK}>
                    {t.haveAccount}
                  </button>
                )}
                {(mode === 'forgot' || mode === 'magic') && (
                  <button type="button" onClick={() => switchMode('signin')} className={LINK}>
                    {t.backToSignIn}
                  </button>
                )}
                {mode === 'signin' && (
                  <button type="button" onClick={() => switchMode('magic')} className={LINK}>
                    {t.useMagicLink}
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t.or}</div>

          <div className="flex flex-col gap-2">
            {SUPPORTED_PROVIDERS.map((p) => {
              // Chưa biết (enabled === null) thì tạm khoá, tránh cho bấm vào nút
              // có thể chưa dùng được.
              const ready = enabled?.includes(p) ?? false
              const isPending = pendingProvider === p

              return (
                <button
                  key={p}
                  type="button"
                  disabled={!ready || pendingProvider !== null}
                  onClick={() => handleProvider(p)}
                  title={ready ? undefined : t.providerNotEnabled}
                  className="relative flex items-center justify-center gap-3 px-8 sm:px-12 py-2.5 rounded border text-sm font-medium transition-colors duration-150 border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-100 enabled:cursor-pointer enabled:hover:border-zinc-500 dark:enabled:hover:border-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="absolute left-4 flex items-center">
                    <ProviderIcon provider={p} />
                  </span>
                  {/* flex-wrap: màn hẹp thì ghi chú tự xuống dòng thay vì cắt cụt nhãn
                      ("Continue with Goo…") — nút cao thêm một dòng, vẫn đọc được hết. */}
                  <span className="flex flex-wrap items-center justify-center gap-x-2 min-w-0">
                    <span>{isPending ? t.redirecting : t[PROVIDER_LABEL[p]]}</span>
                    {enabled && !ready && (
                      <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                        ({t.providerNotEnabled})
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {error && (
            <div className="font-mono text-xs text-red-500 dark:text-red-400">{error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
