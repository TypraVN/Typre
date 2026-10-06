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

// ── Phím tắt tổ hợp (Ctrl+/, Ctrl+Shift+P...) ───────────────────────────────

export const MODIFIER_TOKENS = ['Ctrl', 'Alt', 'Shift', 'Meta']

/**
 * Tên hiển thị trên phím → giá trị `KeyboardEvent.key` thật.
 *
 * `Space` bắt buộc phải có: trình duyệt trả về đúng một dấu cách `' '`, nên so thẳng với
 * chuỗi `'Space'` là không bao giờ khớp — phím tắt hiện ra nhưng gõ kiểu gì cũng sai.
 */
const KEY_ALIASES: Record<string, string> = {
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
  Space: ' ',
}

/**
 * Ký hiệu → vị trí phím VẬT LÝ trên bàn phím Mỹ (`KeyboardEvent.code`).
 *
 * Phím tắt VS Code được in theo bàn phím Mỹ. Trên bàn phím khác, chính cái phím đó
 * vẫn nằm đúng chỗ, chỉ là in ký tự khác — so theo vị trí là cách duy nhất để người
 * dùng bàn phím Đức bấm được `Ctrl+`` (`` ` `` là phím chết ở đó, không ra ký tự).
 */
const SYMBOL_CODES: Record<string, string> = {
  '/': 'Slash',
  '`': 'Backquote',
  '\\': 'Backslash',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  '.': 'Period',
  ',': 'Comma',
  ';': 'Semicolon',
  "'": 'Quote',
  '-': 'Minus',
  '=': 'Equal',
}

export interface ChordKeyLike extends ComboKeyLike {
  shiftKey: boolean
  code?: string
}

function matchesKey(pressed: string, token: string): boolean {
  const expected = KEY_ALIASES[token] ?? token
  if (expected.length === 1) return pressed.toLowerCase() === expected.toLowerCase()
  return pressed === expected
}

/**
 * Lần nhấn `e` có đúng là phím tắt `keys` (vd `['Ctrl', '/']`) không.
 *
 * Với chữ cái và phím có tên (F12, Up, Space): so ký tự + cờ bổ trợ khớp CHÍNH XÁC,
 * như trước giờ.
 *
 * Với KÝ HIỆU, nới thêm hai đường — vì so chính xác là bàn phím châu Âu không bao giờ
 * đúng được:
 *
 *   - Theo ký tự, bỏ qua Shift/AltGr dùng để TẠO RA ký hiệu: bàn phím Đức gõ `/` bằng
 *     Shift+7 và `]` bằng AltGr+9 (Windows báo AltGr thành Ctrl+Alt). So cờ chính xác
 *     thì `Ctrl+/` trở thành `Ctrl+Shift+/` và luôn sai.
 *   - Theo vị trí phím (`e.code`), cờ phải khớp chính xác: cho người bấm đúng phím mà
 *     người Mỹ bấm, kể cả khi phím đó là phím chết trên bố cục của họ.
 *
 * Bàn phím Mỹ không đổi gì: `Ctrl+Shift+/` ra `?`, không khớp ký tự; khớp vị trí nhưng
 * thừa Shift — vẫn sai, đúng như trước. Không có phím tắt nào trong bộ cần Shift + ký
 * hiệu, nên nới Shift cho ký hiệu không nhập nhằng với phím tắt nào khác.
 */
export function chordMatches(e: ChordKeyLike, keys: string[]): boolean {
  const main = keys.find((k) => !MODIFIER_TOKENS.includes(k))
  if (!main) return false

  const wantCtrl = keys.includes('Ctrl')
  const wantAlt = keys.includes('Alt')
  const wantShift = keys.includes('Shift')
  const wantMeta = keys.includes('Meta')

  const exact =
    e.ctrlKey === wantCtrl && e.altKey === wantAlt && e.shiftKey === wantShift && e.metaKey === wantMeta

  if (matchesKey(e.key, main) && exact) return true

  const code = SYMBOL_CODES[main]
  if (!code) return false

  // Theo vị trí phím: cờ phải khớp chính xác.
  if (e.code === code && exact) return true

  // Theo ký tự, cho phép Shift/AltGr chỉ dùng để tạo ra ký hiệu.
  if (e.key === main && e.ctrlKey === wantCtrl && e.metaKey === wantMeta) {
    const altGr = e.getModifierState?.('AltGraph') ?? false
    const altOk = e.altKey === wantAlt || (!wantAlt && (altGr || e.ctrlKey))
    const shiftOk = e.shiftKey === wantShift || !wantShift
    return altOk && shiftOk
  }

  return false
}
