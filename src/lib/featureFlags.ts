/**
 * Cờ bật/tắt tính năng chưa công bố.
 *
 * Dùng để giữ code đã deploy nhưng CHƯA cho người lạ thấy. Cách này hơn hẳn việc gỡ
 * commit: không phải quay ngược lịch sử, không mất phần đã kiểm, và bật lại chỉ là đổi
 * một dòng.
 */

const CHESS_KEY = 'typre-flag-chess'

/**
 * Đọc `?chess=1` một lần rồi NHỚ vào localStorage.
 *
 * Nhớ lại vì app dùng hash routing: bấm sang trang hồ sơ hay link thách đấu là mất tham
 * số truy vấn, và tính năng tự tắt giữa chừng. Nhớ rồi thì mở link một lần là bật cho
 * cả trình duyệt đó — đủ để bro và vài người thử dùng trên chính trang thật.
 */
function readChessFlag(): boolean {
  // Máy dev thì luôn bật, khỏi phải thêm tham số mỗi lần chạy.
  if (import.meta.env.DEV) return true

  try {
    const params = new URLSearchParams(window.location.search)

    if (params.has('chess')) {
      const on = params.get('chess') !== '0'
      localStorage.setItem(CHESS_KEY, on ? '1' : '0')

      // Xoá tham số khỏi thanh địa chỉ để link chia sẻ tiếp không lộ nó ra.
      params.delete('chess')
      const query = params.toString()
      window.history.replaceState(
        null,
        '',
        window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
      )

      return on
    }

    return localStorage.getItem(CHESS_KEY) === '1'
  } catch {
    // Trình duyệt chặn localStorage (cửa sổ riêng tư, chặn cookie bên thứ ba).
    return false
  }
}

/** Chế độ cờ đã mở cho người dùng này chưa. Chốt một lần lúc nạp trang. */
export const CHESS_ENABLED = readChessFlag()
