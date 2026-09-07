import type { ShortcutSet } from '../store/usePreferencesStore'

const VALID_SETS: readonly ShortcutSet[] = ['vscode', 'vim']

/**
 * Bộ phím tắt đến từ `?shortcuts=` — các trang giới thiệu ở /practice/<bo>-shortcuts/
 * dùng nó để mở app đúng tab phím tắt vừa đọc. Cùng cơ chế với `langParam.ts`.
 */
export function readShortcutsParam(): ShortcutSet | null {
  try {
    const raw = new URLSearchParams(window.location.search).get('shortcuts')
    if (!raw) return null
    return (VALID_SETS as readonly string[]).includes(raw) ? (raw as ShortcutSet) : null
  } catch {
    return null
  }
}

/** Xoá `?shortcuts=` khỏi URL sau khi đã áp dụng, cùng lý do với `clearLanguageParam`. */
export function clearShortcutsParam(): void {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('shortcuts')) return

    url.searchParams.delete('shortcuts')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  } catch {
    // Không sửa được URL thì thôi, không đáng để làm vỡ luồng khởi động.
  }
}

/**
 * `?chess=1` — trang giới thiệu ở /practice/chess/ dùng nó để mở thẳng bàn cờ.
 *
 * Cần một tham số riêng chứ không dựa vào tab được nhớ: chế độ CỐ Ý không lưu vào
 * localStorage nữa (xem `usePreferencesStore`), mọi lượt vào web đều rơi về phần gõ code.
 * Không có tham số này thì nút "Play chess" trên trang giới thiệu đổ người dùng vào đúng
 * màn hình họ vừa bỏ qua để bấm vào nó.
 */
export function readChessParam(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('chess') === '1'
  } catch {
    return false
  }
}

/** Xoá `?chess=` khỏi URL sau khi đã áp dụng, cùng lý do với `clearShortcutsParam`. */
export function clearChessParam(): void {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('chess')) return

    url.searchParams.delete('chess')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  } catch {
    // Không sửa được URL thì thôi, không đáng để làm vỡ luồng khởi động.
  }
}
