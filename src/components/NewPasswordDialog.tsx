import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Modal } from './Modal'
import { PASSWORD_MIN, updatePassword } from '../lib/auth'
import type { Translation } from '../i18n/translations'

interface NewPasswordDialogProps {
  onDone: () => void
  t: Translation
}

/**
 * Hiện khi người dùng vào app từ link "đặt lại mật khẩu". Lúc đó Supabase đã tạo sẵn
 * một session tạm (event PASSWORD_RECOVERY) — tức người dùng ĐANG đăng nhập nhưng
 * chưa có mật khẩu mới, nên phải đặt xong mới bỏ màn này đi.
 */
export function NewPasswordDialog({ onDone, t }: NewPasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < PASSWORD_MIN) {
      setError(t.passwordTooShort)
      return
    }

    setBusy(true)
    const { error: err } = await updatePassword(password)
    setBusy(false)

    if (err) {
      setError(err)
      return
    }
    setDone(true)
  }

  return (
    <Modal label={t.newPasswordTitle} closeLabel={t.close} onClose={onDone} widthClass="max-w-md">
      <div className="px-6 py-5 flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t.newPasswordTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t.newPasswordSubtitle}</p>
        </div>

        {done ? (
          <>
            <div className="px-3 py-3 rounded border border-green-600/40 bg-green-500/10 font-mono text-sm text-green-700 dark:text-green-400">
              {t.passwordUpdated}
            </div>
            <button
              type="button"
              onClick={onDone}
              className="px-4 py-2.5 rounded font-medium text-sm cursor-pointer transition-colors duration-150 bg-zinc-900 dark:bg-orange-500 text-white hover:bg-zinc-700 dark:hover:bg-orange-400"
            >
              {t.startTyping}
            </button>
          </>
        ) : (
          <form onSubmit={save} className="flex flex-col gap-3">
            <label
              htmlFor="new-password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
                className="w-full px-3 py-2 pr-10 rounded border font-mono text-sm border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-400"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                title={show ? t.hidePassword : t.showPassword}
                aria-label={show ? t.hidePassword : t.showPassword}
                className="absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
              {t.passwordHint}
            </span>

            <button
              type="submit"
              disabled={busy}
              className="mt-1 px-4 py-2.5 rounded font-medium text-sm cursor-pointer transition-colors duration-150 bg-zinc-900 dark:bg-orange-500 text-white hover:bg-zinc-700 dark:hover:bg-orange-400 disabled:opacity-50"
            >
              {busy ? t.saving : t.savePassword}
            </button>

            {error && (
              <div className="font-mono text-xs text-red-500 dark:text-red-400">{error}</div>
            )}
          </form>
        )}
      </div>
    </Modal>
  )
}
