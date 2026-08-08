import { X } from 'lucide-react'

type ToastKind = 'info' | 'success' | 'error'

interface ToastProps {
  kind: ToastKind
  dismissLabel: string
  onDismiss: () => void
  children: React.ReactNode
}

const KIND_CLASS: Record<ToastKind, string> = {
  success: 'border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400',
  error: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
  info: 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400',
}

/** Một dòng thông báo. Vị trí do `ToastStack` quyết định, không tự `fixed`. */
export function Toast({ kind, dismissLabel, onDismiss, children }: ToastProps) {
  return (
    <div
      role="status"
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border shadow-lg font-mono text-sm animate-fade-in-up ${KIND_CLASS[kind]}`}
    >
      <span>{children}</span>
      <button
        type="button"
        onClick={onDismiss}
        title={dismissLabel}
        aria-label={dismissLabel}
        className="p-0.5 rounded cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-150"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

/** Xếp nhiều thông báo thành cột — hai cái cùng `fixed` một góc sẽ đè nhau. */
export function ToastStack({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">{children}</div>
  )
}
