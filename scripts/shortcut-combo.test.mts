/**
 * Kiểm `isShortcutCombo`: phím nào là phím tắt (bỏ qua), phím nào là đang gõ ký tự.
 *
 * Mỗi ca là hình dạng keydown THẬT mà trình duyệt bắn ra trên từng hệ điều hành và bố
 * cục bàn phím. Không test được bằng bàn phím thật trong CI, nên ghi đúng những gì từng
 * nền tảng báo vào đây — sai một ca là có cả một nhóm người dùng không gõ được ký tự đó.
 */

import {
  chordMatches,
  isShortcutCombo,
  type ChordKeyLike,
  type ComboKeyLike,
} from '../src/lib/shortcutCombo'

let passed = 0
const failures: string[] = []

function key(
  k: string,
  mods: { ctrl?: boolean; alt?: boolean; meta?: boolean; altGraph?: boolean } = {},
): ComboKeyLike {
  return {
    key: k,
    ctrlKey: mods.ctrl ?? false,
    altKey: mods.alt ?? false,
    metaKey: mods.meta ?? false,
    getModifierState: (m) => m === 'AltGraph' && (mods.altGraph ?? false),
  }
}

function check(label: string, e: ComboKeyLike, wantCombo: boolean) {
  const got = isShortcutCombo(e)
  if (got === wantCombo) {
    passed++
    return
  }
  failures.push(
    `  ${label}\n      mong doi: ${wantCombo ? 'phim tat (bo qua)' : 'go ky tu (nhan)'}\n      nhan duoc: ${got ? 'phim tat' : 'go ky tu'}`,
  )
}

// ── Gõ bình thường ───────────────────────────────────────────────────────────
check('chu thuong', key('a'), false)
check('ky hieu can Shift (Shift khong lam no thanh phim tat)', key('!'), false)
check('Enter', key('Enter'), false)

// ── Phím tắt thật: phải bỏ qua ───────────────────────────────────────────────
check('Ctrl+C', key('c', { ctrl: true }), true)
check('Ctrl+V', key('v', { ctrl: true }), true)
check('Cmd+S (Mac)', key('s', { meta: true }), true)
check('Alt+F (menu Windows)', key('f', { alt: true }), true)
check('Alt+1', key('1', { alt: true }), true)

// ── AltGr trên Windows: báo thành Ctrl+Alt, PHẢI nhận ────────────────────────
check('Windows, Duc: AltGr+7 = {', key('{', { ctrl: true, alt: true }), false)
check('Windows, Duc: AltGr+8 = [', key('[', { ctrl: true, alt: true }), false)
check('Windows, Duc: AltGr+Q = @', key('@', { ctrl: true, alt: true }), false)
check('Windows, Bac Au: AltGr+4 = $', key('$', { ctrl: true, alt: true }), false)
check('Windows, Phap: AltGr+( = [', key('[', { ctrl: true, alt: true, altGraph: true }), false)

// ── AltGr trên Linux: báo đúng tên AltGraph ──────────────────────────────────
check('Linux, Duc: AltGr+7 = {', key('{', { altGraph: true }), false)
check('Linux, Bac Au: AltGr+4 = $', key('$', { altGraph: true }), false)

// ── Option trên Mac: bố cục Đức gõ ngoặc bằng Option ─────────────────────────
check('Mac, Duc: Option+8 = {', key('{', { alt: true }), false)
check('Mac, Duc: Option+5 = [', key('[', { alt: true }), false)
check('Mac, Duc: Option+L = @', key('@', { alt: true }), false)

// ── Cmd vẫn thắng mọi thứ ────────────────────────────────────────────────────
check('Cmd+Option+I (DevTools Mac)', key('i', { meta: true, alt: true }), true)

// ═════════════════════════════════════════════════════════════════════════════
// chordMatches: phím tắt tổ hợp trên bàn phím Mỹ và châu Âu
// ═════════════════════════════════════════════════════════════════════════════

function chord(
  k: string,
  code: string,
  mods: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean; altGraph?: boolean } = {},
): ChordKeyLike {
  return {
    key: k,
    code,
    ctrlKey: mods.ctrl ?? false,
    altKey: mods.alt ?? false,
    shiftKey: mods.shift ?? false,
    metaKey: mods.meta ?? false,
    getModifierState: (m) => m === 'AltGraph' && (mods.altGraph ?? false),
  }
}

function checkChord(label: string, e: ChordKeyLike, keys: string[], want: boolean) {
  const got = chordMatches(e, keys)
  if (got === want) {
    passed++
    return
  }
  failures.push(`  ${label}\n      mong doi: ${want ? 'DUNG' : 'SAI'}\n      nhan duoc: ${got ? 'DUNG' : 'SAI'}`)
}

// ── Bàn phím Mỹ: giữ nguyên như trước ────────────────────────────────────────
checkChord('My: Ctrl+/', chord('/', 'Slash', { ctrl: true }), ['Ctrl', '/'], true)
checkChord('My: Ctrl+`', chord('`', 'Backquote', { ctrl: true }), ['Ctrl', '`'], true)
checkChord('My: Ctrl+\\', chord('\\', 'Backslash', { ctrl: true }), ['Ctrl', '\\'], true)
checkChord('My: Ctrl+]', chord(']', 'BracketRight', { ctrl: true }), ['Ctrl', ']'], true)
checkChord('My: Ctrl+.', chord('.', 'Period', { ctrl: true }), ['Ctrl', '.'], true)
checkChord('My: Ctrl+Shift+P', chord('P', 'KeyP', { ctrl: true, shift: true }), ['Ctrl', 'Shift', 'P'], true)
checkChord('My: Ctrl+P', chord('p', 'KeyP', { ctrl: true }), ['Ctrl', 'P'], true)
checkChord('My: Alt+Up', chord('ArrowUp', 'ArrowUp', { alt: true }), ['Alt', 'Up'], true)
checkChord('My: Ctrl+Space', chord(' ', 'Space', { ctrl: true }), ['Ctrl', 'Space'], true)
checkChord('My: F12', chord('F12', 'F12'), ['F12'], true)

// ── Bàn phím Mỹ: những thứ PHẢI vẫn sai ──────────────────────────────────────
checkChord('My: thieu Ctrl (chi bam /)', chord('/', 'Slash'), ['Ctrl', '/'], false)
checkChord('My: thua Shift — Ctrl+Shift+/ ra ?', chord('?', 'Slash', { ctrl: true, shift: true }), ['Ctrl', '/'], false)
checkChord('My: Ctrl+P thay vi Ctrl+Shift+P', chord('p', 'KeyP', { ctrl: true }), ['Ctrl', 'Shift', 'P'], false)
checkChord('My: Ctrl+Shift+P thay vi Ctrl+P', chord('P', 'KeyP', { ctrl: true, shift: true }), ['Ctrl', 'P'], false)
checkChord('My: phim khac hoan toan', chord('k', 'KeyK', { ctrl: true }), ['Ctrl', '/'], false)
checkChord('My: thua Alt — Alt+Shift+Down thay vi Shift+Down', chord('ArrowDown', 'ArrowDown', { alt: true, shift: true }), ['Shift', 'Down'], false)

// ── Đức, Windows ─────────────────────────────────────────────────────────────
checkChord('Duc Win: Ctrl+/ = Ctrl+Shift+7', chord('/', 'Digit7', { ctrl: true, shift: true }), ['Ctrl', '/'], true)
checkChord('Duc Win: Ctrl+] = Ctrl+AltGr+9', chord(']', 'Digit9', { ctrl: true, alt: true, altGraph: true }), ['Ctrl', ']'], true)
checkChord('Duc Win: Ctrl+] khi AltGr chi bao Ctrl+Alt', chord(']', 'Digit9', { ctrl: true, alt: true }), ['Ctrl', ']'], true)
checkChord('Duc Win: Ctrl+\\ = Ctrl+AltGr+ß', chord('\\', 'Minus', { ctrl: true, alt: true, altGraph: true }), ['Ctrl', '\\'], true)
checkChord('Duc Win: Ctrl+` la phim chet → theo vi tri', chord('Dead', 'Backquote', { ctrl: true }), ['Ctrl', '`'], true)
checkChord('Duc Win: Ctrl+. van la phim thuong', chord('.', 'Period', { ctrl: true }), ['Ctrl', '.'], true)

// ── Đức, Linux (AltGr báo đúng tên, không kèm Ctrl) ──────────────────────────
checkChord('Duc Linux: Ctrl+] = Ctrl+AltGr+9', chord(']', 'Digit9', { ctrl: true, altGraph: true }), ['Ctrl', ']'], true)

// ── Pháp AZERTY ──────────────────────────────────────────────────────────────
checkChord('Phap: Ctrl+/ = Ctrl+Shift+:', chord('/', 'Period', { ctrl: true, shift: true }), ['Ctrl', '/'], true)

// ── Châu Âu: những thứ PHẢI vẫn sai ──────────────────────────────────────────
checkChord('Duc: thieu Ctrl (Shift+7 tron)', chord('/', 'Digit7', { shift: true }), ['Ctrl', '/'], false)
checkChord('Duc: Ctrl+Shift+7 cho phim tat Ctrl+P', chord('/', 'Digit7', { ctrl: true, shift: true }), ['Ctrl', 'P'], false)

console.log(`\n${passed}/${passed + failures.length} ca dat`)

if (failures.length > 0) {
  console.log(`\n${failures.length} ca HONG:\n`)
  console.log(failures.join('\n\n'))
  process.exit(1)
}

console.log('Tat ca deu dat.\n')
