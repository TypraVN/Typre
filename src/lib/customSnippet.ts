import type { Snippet, SnippetLanguage } from '../data/types'

/**
 * Chuẩn hoá code người dùng dán vào trước khi đưa cho engine gõ.
 *
 * Không chuẩn hoá thì gặp cả loạt ký tự KHÔNG GÕ ĐƯỢC trên bàn phím thường, và lượt gõ
 * thành bất khả thi: dán từ trang web/Word hay lẫn nháy cong, gạch dài, dấu ba chấm một
 * ký tự, khoảng trắng không ngắt. Engine cũng chỉ hiểu space cho thụt lề, không hiểu tab.
 *
 * Các lớp ký tự vô hình dưới đây viết bằng KÝ TỰ THẬT, nên luôn kèm comment liệt kê code
 * point — không có comment thì không ai đọc ra regex đang khớp cái gì.
 *
 * Riêng ký tự ĐIỀU KHIỂN thì BẮT BUỘC dùng escape `\x..`: viết thật sẽ lẫn NUL byte vào
 * source, git coi cả file là binary và mất diff (đã mắc một lần ở đây).
 */

/** Giới hạn độ dài. Mốc dài nhất là 60s ≈ 400 ký tự ở 80 wpm, nên 3000 là rất thoải mái. */
export const MAX_CUSTOM_CHARS = 3000

/**
 * Ký tự "in đẹp" → ký tự ASCII gõ được. Nháy cong và gạch dài là thứ hay lẫn vào nhất
 * khi copy code từ blog hoặc tài liệu.
 */
const TYPOGRAPHIC: Array<[RegExp, string]> = [
  // Nháy đơn cong: ‘ ’ ‚ ‛
  [/[‘’‚‛]/g, "'"],
  // Nháy kép cong: “ ” „ ‟
  [/[“”„‟]/g, '"'],
  // Gạch dài: – — ―
  [/[–—―]/g, '-'],
  // Dấu ba chấm một ký tự: …
  [/…/g, '...'],
  // Khoảng trắng không ngắt (U+00A0) và các loại space unicode khác (en/em/thin space
  // U+2000-200A, narrow no-break U+202F, medium math U+205F, ideographic U+3000).
  [/[  -   　]/g, ' '],
  // Zero-width space / non-joiner / joiner và BOM: vô hình, dán vào là gõ mãi không qua.
  [/[​-‍﻿]/g, ''],
]

/** Thụt lề bằng tab → 4 space, vì engine dùng space và Tab để NHẢY qua dải space. */
const TAB_WIDTH = 4

export interface NormalizeResult {
  code: string
  /** Đã cắt bớt vì vượt `MAX_CUSTOM_CHARS`. */
  truncated: boolean
  /** Có ký tự nào bị đổi/loại trong lúc chuẩn hoá. */
  cleaned: boolean
}

export function normalizeCustomCode(raw: string): NormalizeResult {
  let code = raw.replace(/\r\n?/g, '\n')

  const beforeClean = code
  for (const [pattern, replacement] of TYPOGRAPHIC) {
    code = code.replace(pattern, replacement)
  }

  code = code
    .replace(/\t/g, ' '.repeat(TAB_WIDTH))
    // Ký tự điều khiển còn lại, TRỪ newline (\x0A). Tab đã đổi ở trên nên gộp \x09 vào.
    .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '')

  const cleaned = code !== beforeClean

  code = code
    .split('\n')
    // Khoảng trắng cuối dòng là vô hình: người gõ không thấy nên không thể gõ đúng.
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    // Nhiều dòng trống liên tiếp → một dòng trống.
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')

  const truncated = code.length > MAX_CUSTOM_CHARS
  if (truncated) {
    const cut = code.slice(0, MAX_CUSTOM_CHARS)
    // Cắt ở cuối dòng gần nhất cho đỡ đứt giữa câu lệnh.
    const lastBreak = cut.lastIndexOf('\n')
    code = lastBreak > MAX_CUSTOM_CHARS / 2 ? cut.slice(0, lastBreak) : cut
  }

  return { code, truncated, cleaned }
}

/**
 * Id riêng để phân biệt với bài trong kho. Cần cho 2 việc: chặn gửi điểm lên bảng xếp
 * hạng (không thì ai cũng dán đoạn dễ nhất để cày điểm), và chặn tạo link thách đấu
 * (link chỉ mang id, người nhận không có code của bạn nên mở ra là trượt).
 */
export const CUSTOM_SNIPPET_ID = 'custom-own-code'

export function isCustomSnippet(snippet: Snippet): boolean {
  return snippet.id === CUSTOM_SNIPPET_ID
}

export function buildCustomSnippet(code: string, language: SnippetLanguage): Snippet {
  return { id: CUSTOM_SNIPPET_ID, language, code }
}
