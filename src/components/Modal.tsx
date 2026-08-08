import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  /** Nhãn cho trình đọc màn hình + tooltip nút đóng. */
  label: string
  closeLabel: string
  onClose: () => void
  /** Class chiều rộng tối đa của thẻ, vd "max-w-3xl". */
  widthClass?: string
  children: React.ReactNode
}

/**
 * Vỏ chung cho các panel mở từ menu tài khoản. Gom vào một chỗ vì cả ba panel đều
 * cần đúng bộ hành vi này, và vì App.tsx chặn phím tắt theo
 * `[role="dialog"][aria-modal="true"]` — mỗi panel tự dựng vỏ là sớm muộn có cái
 * quên thuộc tính đó rồi Escape lại reset mất bài đang gõ.
 */
export function Modal({ label, closeLabel, onClose, widthClass = 'max-w-2xl', children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8 bg-black/60 animate-fade-in"
      onMouseDown={(e) => {
        // Chỉ đóng khi bấm đúng lớp nền, không phải khi bấm bên trong thẻ.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative w-full ${widthClass} rounded-xl shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 animate-pop-in`}
      >
        <button
          type="button"
          onClick={onClose}
          title={closeLabel}
          aria-label={closeLabel}
          className="absolute top-3 right-3 z-10 p-1 rounded cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors duration-150"
        >
          <X className="w-4 h-4" />
        </button>

        {children}
      </div>
    </div>
  )
}
