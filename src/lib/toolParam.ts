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
