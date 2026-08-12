import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { MAX_CUSTOM_CHARS, normalizeCustomCode } from '../lib/customSnippet'
import type { Translation } from '../i18n/translations'

interface CustomCodeDialogProps {
  initialCode: string
  onSubmit: (code: string) => void
  onClose: () => void
  t: Translation
}

/**
 * Dán code của mình vào để luyện. Chuẩn hoá NGAY khi gõ/dán chứ không đợi lúc bấm nút,
 * để người dùng thấy trước cái mình sẽ phải gõ — nếu đợi tới lúc submit mới đổi thì họ
 * gõ một đằng, màn hình hiện một nẻo.
 */
export function CustomCodeDialog({ initialCode, onSubmit, onClose, t }: CustomCodeDialogProps) {
  const [raw, setRaw] = useState(initialCode)
  const areaRef = useRef<HTMLTextAreaElement>(null)

  const { code, truncated, cleaned } = normalizeCustomCode(raw)
  const empty = code.length === 0

  useEffect(() => {
    areaRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.customCodeTitle}
        className="relative w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 animate-pop-in"
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

        <div className="px-6 py-5 flex flex-col gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {t.customCodeTitle}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t.customCodeSubtitle}
            </p>
          </div>

          <textarea
            ref={areaRef}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            rows={12}
            placeholder={t.customCodePlaceholder}
            className="w-full px-3 py-2 rounded border font-mono text-sm resize-y border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-400"
            style={{ fontVariantLigatures: 'none', tabSize: 4 }}
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            <span className={code.length > MAX_CUSTOM_CHARS * 0.9 ? 'text-orange-500' : ''}>
              {code.length} / {MAX_CUSTOM_CHARS}
            </span>
            <span>
              {code.length === 0 ? 0 : code.split('\n').length} {t.customCodeLines}
            </span>
            {cleaned && <span className="text-orange-500">{t.customCodeCleaned}</span>}
            {truncated && <span className="text-orange-500">{t.customCodeTruncated}</span>}
          </div>

          <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
            {t.customCodeNoLeaderboard}
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded border cursor-pointer transition-colors duration-150 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={() => onSubmit(code)}
              disabled={empty}
              className="px-3 py-1.5 text-sm rounded cursor-pointer transition-colors duration-150 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-default"
            >
              {t.customCodeStart}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
