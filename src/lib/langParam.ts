import type { SnippetLanguage } from '../data/types'

/**
 * Ngôn ngữ đến từ `?lang=` — các trang giới thiệu ở /practice/<ngôn ngữ>/ dùng nó để mở
 * app đúng ngôn ngữ vừa đọc.
 *
 * Không có bước này thì bấm "Start typing Python" xong lại rơi vào JavaScript, và trang
 * giới thiệu thành cái cửa dẫn đi đâu đó chứ không dẫn tới đúng thứ nó vừa hứa.
 *
 * Dùng query `?lang=` chứ không dùng hash: hash đã dành cho thách đấu/đua/profile, và
 * query thì đọc được ngay lúc mount mà không đụng vào bộ định tuyến hash.
 */
export function readLanguageParam(valid: readonly SnippetLanguage[]): SnippetLanguage | null {
  try {
    const raw = new URLSearchParams(window.location.search).get('lang')
    if (!raw) return null

    // Chỉ nhận đúng các ngôn ngữ đang có: link cũ hoặc người ta sửa tay URL không được
    // đẩy app vào trạng thái không có bài nào.
    return (valid as readonly string[]).includes(raw) ? (raw as SnippetLanguage) : null
  } catch {
    return null
  }
}

/**
 * Xoá `?lang=` khỏi URL sau khi đã áp dụng.
 *
 * Để lại thì mọi lần F5 sau đó đều ép về ngôn ngữ của trang giới thiệu, ghi đè lựa chọn
 * người dùng vừa đổi — họ đổi sang Rust, reload, lại thấy Python, tưởng app hỏng.
 */
export function clearLanguageParam(): void {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('lang')) return

    url.searchParams.delete('lang')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  } catch {
    // Không sửa được URL thì thôi, không đáng để làm vỡ luồng khởi động.
  }
}
