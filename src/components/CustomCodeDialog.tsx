import { useEffect, useRef, useState } from 'react'
import { Link2, X } from 'lucide-react'
import { MAX_CUSTOM_CHARS, normalizeCustomCode } from '../lib/customSnippet'
import { ImportError, importFromGitHub, type ImportErrorCode } from '../lib/githubImport'
import type { SnippetLanguage } from '../data/types'
import type { Translation } from '../i18n/translations'

interface CustomCodeDialogProps {
  initialCode: string
  /** `language` có khi code tải từ link GitHub và đoán được ngôn ngữ từ đuôi file. */
  onSubmit: (code: string, language?: SnippetLanguage) => void
  onClose: () => void
  t: Translation
}

const IMPORT_ERROR_TEXT: Record<ImportErrorCode, keyof Translation> = {
  'invalid-url': 'importErrorInvalidUrl',
  'not-found': 'importErrorNotFound',
  'rate-limit': 'importErrorRateLimit',
  'too-large': 'importErrorTooLarge',
  'not-text': 'importErrorNotText',
  network: 'importErrorNetwork',
}

/**
 * Dán code của mình vào để luyện. Chuẩn hoá NGAY khi gõ/dán chứ không đợi lúc bấm nút,
 * để người dùng thấy trước cái mình sẽ phải gõ — nếu đợi tới lúc submit mới đổi thì họ
 * gõ một đằng, màn hình hiện một nẻo.
 */
export function CustomCodeDialog({ initialCode, onSubmit, onClose, t }: CustomCodeDialogProps) {
  const [raw, setRaw] = useState(initialCode)
  const areaRef = useRef<HTMLTextAreaElement>(null)

  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [importError, setImportError] = useState<ImportErrorCode | null>(null)
  /** File vừa tải: tên để báo lại cho người dùng, ngôn ngữ để tô màu đúng khi bắt đầu gõ. */
  const [imported, setImported] = useState<{ fileName: string; language?: SnippetLanguage } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const { code, truncated, cleaned } = normalizeCustomCode(raw)
  const empty = code.length === 0

  useEffect(() => {
    areaRef.current?.focus()
    // Đóng hộp thoại giữa lúc đang tải thì bỏ request, đừng để nó về sau rồi ghi vào
    // một component đã gỡ.
    return () => abortRef.current?.abort()
  }, [])

  const loadLink = async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setImportError(null)
    try {
      const result = await importFromGitHub(link, controller.signal)
      setRaw(result.code)
      setImported({ fileName: result.fileName, language: result.language })
    } catch (err) {
      if (controller.signal.aborted) return
      setImportError(err instanceof ImportError ? err.code : 'network')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

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

          <form
            className="flex flex-col gap-1"
            onSubmit={(e) => {
              e.preventDefault()
              if (link.trim() && !loading) void loadLink()
            }}
          >
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="url"
                  inputMode="url"
                  value={link}
                  onChange={(e) => {
                    setLink(e.target.value)
                    setImportError(null)
                  }}
                  placeholder={t.importPlaceholder}
                  aria-label={t.importPlaceholder}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="w-full pl-8 pr-3 py-1.5 rounded border font-mono text-sm border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading || link.trim() === ''}
                className="shrink-0 px-3 py-1.5 text-sm rounded border cursor-pointer transition-colors duration-150 border-orange-500/60 dark:border-orange-400/60 text-orange-600 dark:text-orange-400 hover:border-orange-500 dark:hover:border-orange-400 disabled:opacity-40 disabled:cursor-default"
              >
                {loading ? t.importLoading : t.importLoad}
              </button>
            </div>
            {importError ? (
              <p className="font-mono text-xs text-red-500 dark:text-red-400">{t[IMPORT_ERROR_TEXT[importError]]}</p>
            ) : imported ? (
              <p className="font-mono text-xs text-green-600 dark:text-green-400">
                {t.importLoaded.replace('{file}', imported.fileName)}
              </p>
            ) : (
              <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500">{t.importHint}</p>
            )}
          </form>

          <textarea
            ref={areaRef}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            // Dán vào là đổi sang code khác: bỏ ngôn ngữ đoán từ file vừa tải, không thì
            // dán đè một đoạn JS lên file .py vẫn bị tô màu theo Python. Chỉ cắt bớt hay
            // sửa vài chữ trong code vừa tải thì vẫn giữ.
            onPaste={() => setImported(null)}
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
              onClick={() => onSubmit(code, imported?.language)}
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
