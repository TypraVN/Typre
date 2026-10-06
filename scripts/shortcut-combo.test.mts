/**
 * Kiểm `isShortcutCombo`: phím nào là phím tắt (bỏ qua), phím nào là đang gõ ký tự.
 *
 * Mỗi ca là hình dạng keydown THẬT mà trình duyệt bắn ra trên từng hệ điều hành và bố
 * cục bàn phím. Không test được bằng bàn phím thật trong CI, nên ghi đúng những gì từng
 * nền tảng báo vào đây — sai một ca là có cả một nhóm người dùng không gõ được ký tự đó.
 */

import { isShortcutCombo, type ComboKeyLike } from '../src/lib/shortcutCombo'

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

console.log(`\n${passed}/${passed + failures.length} ca dat`)

if (failures.length > 0) {
  console.log(`\n${failures.length} ca HONG:\n`)
  console.log(failures.join('\n\n'))
  process.exit(1)
}

console.log('Tat ca deu dat.\n')
