import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface DialogBoundaryProps {
  children: ReactNode
  /** Nhãn nút đóng — dùng lại `t.close`. */
  closeLabel: string
  message: string
  onClose: () => void
}

interface DialogBoundaryState {
  error: Error | null
}

/**
 * Chặn lỗi render bên trong một hộp thoại.
 *
 * Vì sao BẮT BUỘC phải có: React gỡ TOÀN BỘ cây khi một lỗi render không được bắt. Các
 * hộp thoại ở đây chỉ bọc trong `Suspense`, mà `Suspense` không bắt lỗi — nên một lỗi
 * nhỏ trong bảng thống kê sẽ xoá sạch cả app, người dùng nhận trang trắng và mất luôn
 * lượt gõ đang dở. Đã gặp đúng chuyện này trong phiên trước với `lazyChunk`.
 *
 * Nguồn lỗi thực tế nhất là dữ liệu localStorage lưu từ phiên bản cũ: người dùng lâu năm
 * có hình dạng dữ liệu mà code hiện tại không còn lường tới, còn máy người phát triển
 * luôn sạch nên không bao giờ tái hiện được.
 *
 * Phải là class component — React chưa có hook nào thay được `componentDidCatch`.
 */
export class DialogBoundary extends Component<DialogBoundaryProps, DialogBoundaryState> {
  state: DialogBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): DialogBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Ghi log để còn lần ra được: người dùng chỉ nói "nó lỗi", không ai chụp được stack.
    console.error('[Typre] lỗi trong hộp thoại:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-sm rounded-xl border border-red-500/40 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3">
          <p className="font-mono text-sm text-zinc-700 dark:text-zinc-200">{this.props.message}</p>

          {/* Hiện message thật: người dùng copy được là mình lần ra ngay, thay vì đoán. */}
          <code className="block max-h-24 overflow-auto rounded bg-zinc-100 dark:bg-zinc-950 p-2 font-mono text-[11px] text-red-600 dark:text-red-400">
            {this.state.error.message}
          </code>

          <button
            type="button"
            onClick={this.props.onClose}
            className="self-end px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-sm cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 transition-colors duration-150"
          >
            {this.props.closeLabel}
          </button>
        </div>
      </div>
    )
  }
}
