/**
 * Phím vừa nhấn là một PHÍM TẮT (Ctrl+C, Cmd+S, Alt+F...) — cần bỏ qua — hay là đang
 * GÕ RA MỘT KÝ TỰ — cần nhận?
 *
 * Câu hỏi này không trả lời được bằng `ctrlKey || altKey || metaKey` như trước. Đó là
 * cách đúng với bàn phím Mỹ, và chặn sạch dấu ngoặc của gần như cả châu Âu:
 *
 *   - Windows: bàn phím Đức, Pháp, Tây Ban Nha, Bắc Âu... gõ `{ } [ ] \ | @ ~` bằng
 *     phím AltGr, mà trình duyệt trên Windows báo AltGr thành Ctrl+Alt. Chặn theo
 *     ctrlKey/altKey là người dùng ở đó không gõ được dấu ngoặc nào — trong khi ngoặc
 *     và dấu nháy chiếm khoảng 8% mọi ký tự trong kho bài.
 *   - Linux: AltGr báo đúng là `AltGraph` qua `getModifierState`.
 *   - Mac: không có AltGr. Bố cục Đức gõ `{` bằng Option+8, tức là `altKey`.
 *
 * Kiểu tham số là đủ dùng tối thiểu (không phải `KeyboardEvent`) để chạy được trong test
 * thuần, không cần DOM.
 */
export interface ComboKeyLike {
  key: string
  ctrlKey: boolean
  altKey: boolean
  metaKey: boolean
  /** Chỉ hỏi `AltGraph` — khai hẹp vậy để khớp kiểu `ModifierKey` của React. */
  getModifierState?: (key: 'AltGraph') => boolean
}

export function isShortcutCombo(e: ComboKeyLike): boolean {
  // Cmd (Mac) / phím Windows: không bố cục nào dùng chúng để gõ ký tự.
  if (e.metaKey) return true

  // AltGr được báo đúng tên (Linux, và Chrome/Firefox trên Windows khi nhận ra bố cục).
  if (e.getModifierState?.('AltGraph')) return false

  // Windows báo AltGr thành Ctrl+Alt. Phím tắt Ctrl+Alt thật trong trình duyệt gần như
  // không tồn tại, nên coi tổ hợp này là đang gõ ký tự.
  if (e.ctrlKey && e.altKey) return false

  if (e.ctrlKey) return true

  /*
    Chỉ có Alt (Option trên Mac).

    Ra một KÝ HIỆU (không phải chữ/số) thì là đang gõ: bố cục Đức trên Mac gõ `{` bằng
    Option+8, `@` bằng Option+L. Ra chữ hoặc số thì là phím tắt kiểu Alt+F trên Windows,
    nơi Alt không biến đổi ký tự.
  */
  if (e.altKey) return !(e.key.length === 1 && !/[a-z0-9]/i.test(e.key))

  return false
}
