import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import type { Translation } from '../i18n/translations'

/**
 * Thanh gợi ý cài app, góc dưới trái — `ToastStack` đã chiếm góc dưới phải (xem
 * `Toast.tsx`), hai cái `fixed` cùng góc sẽ đè nhau.
 */
export function InstallBanner({ t }: { t: Translation }) {
  const { show, showIosHint, promptInstall, dismiss } = useInstallPrompt()
  if (!show) return null

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-xs animate-fade-in-up">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border shadow-lg font-mono text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300">
        <span className="flex-1">{showIosHint ? t.installBannerIos : t.installBannerText}</span>
        {!showIosHint && (
          <button
            type="button"
            onClick={promptInstall}
            className="flex items-center gap-1 px-2 py-1 rounded border shrink-0 cursor-pointer border-orange-500/50 text-orange-600 dark:text-orange-400 hover:border-orange-500 transition-colors duration-150"
          >
            <Download className="w-3.5 h-3.5" />
            {t.installButton}
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          title={t.dismiss}
          aria-label={t.dismiss}
          className="p-0.5 rounded cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-150 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
