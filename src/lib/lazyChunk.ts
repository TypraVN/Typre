import { createElement, lazy } from 'react'
import type { ComponentType } from 'react'

/**
 * Hiện khi đã reload một lần mà vẫn không tải được (mất mạng, chunk hỏng thật).
 *
 * Phải trả về một component chứ KHÔNG được `throw`: throw ra ngoài `Suspense` mà không có
 * error boundary thì React unmount cả cây và người dùng nhận trang TRẮNG — tệ hơn nhiều
 * so với việc mất đúng một hộp thoại. Đã gặp thật khi test.
 */
function ChunkFailed() {
  return createElement(
    'div',
    {
      className:
        'fixed inset-x-0 bottom-4 mx-auto w-fit max-w-[90vw] px-4 py-2 rounded-lg border border-red-500/40 bg-red-500/10 font-mono text-sm text-red-600 dark:text-red-400',
      role: 'alert',
    },
    "Couldn't load this part. ",
    createElement(
      'button',
      {
        type: 'button',
        className: 'underline cursor-pointer',
        onClick: () => window.location.reload(),
      },
      'Reload the page',
    ),
  )
}

/**
 * `React.lazy` có tự phục hồi khi chunk tải hỏng.
 *
 * Vì sao cần: hosting tĩnh chỉ giữ file của bản deploy MỚI NHẤT. Tab nào đang mở từ
 * trước khi deploy vẫn chạy bundle cũ, và mọi chunk cũ đã bị xoá khỏi server — nên bấm
 * vào thứ gì tải-theo-yêu-cầu (bảng xếp hạng, User stats, hộp thoại dán code) là import
 * thất bại, `Suspense` rơi vào fallback null và giao diện IM LẶNG không mở gì.
 *
 * Người dùng chỉ thấy "bấm không phản ứng" — không có cách nào tự đoán ra là phải F5.
 *
 * Cách xử: import hỏng thì tải lại trang một lần để lấy bundle mới. Cờ trong
 * `sessionStorage` chặn vòng lặp vô hạn nếu lỗi là do nguyên nhân khác (mất mạng, chunk
 * hỏng thật) — lần thứ hai thì để lỗi nổi lên chứ không reload nữa.
 */
// Ràng buộc y như `React.lazy` khai báo. `never` ở đây làm props thành contravariant và
// TS từ chối mọi component thật, nên phải dùng đúng `any` như React dùng.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyChunk<T extends ComponentType<any>>(
  key: string,
  load: () => Promise<{ default: T }>,
) {
  const flag = `typre-chunk-reload:${key}`

  return lazy(() =>
    load()
      .then((mod) => {
        // Tải được rồi thì xoá cờ, để lần deploy sau vẫn còn một lượt reload dự phòng.
        try {
          sessionStorage.removeItem(flag)
        } catch {
          // Chế độ riêng tư có thể chặn sessionStorage — không đáng để làm vỡ luồng.
        }
        return mod
      })
      .catch(() => {
        let alreadyTried = false
        try {
          alreadyTried = sessionStorage.getItem(flag) === '1'
          sessionStorage.setItem(flag, '1')
        } catch {
          // Không đọc/ghi được thì coi như đã thử, thà hiện thông báo còn hơn reload vô tận.
          alreadyTried = true
        }

        if (alreadyTried) {
          return { default: ChunkFailed as unknown as T }
        }

        window.location.reload()

        // Promise không bao giờ resolve: giữ Suspense ở trạng thái chờ cho tới lúc trang
        // tải lại, thay vì nháy một khung lỗi rồi mới reload.
        return new Promise<{ default: T }>(() => {})
      }),
  )
}
