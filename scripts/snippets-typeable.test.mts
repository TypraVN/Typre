/**
 * Mọi ký tự trong mọi snippet phải GÕ ĐƯỢC trên bàn phím thường.
 *
 * Đây là bài kiểm quan trọng nhất của kho dữ liệu. App này chỉ có một việc: cho người ta
 * gõ lại đoạn code. Một ký tự không gõ được — dấu nháy cong, gạch ngang dài, ký tự vẽ
 * khung — là người chơi KẸT VĨNH VIỄN ở đó, hết giờ mà không hiểu vì sao. Họ sẽ nghĩ app
 * hỏng chứ không nghĩ dữ liệu sai, và bỏ đi.
 *
 * Lint không bắt được lớp lỗi này: `’` là ký tự hợp lệ trong chuỗi JavaScript.
 */

import { allSnippets } from '../src/data/snippets/index'

/**
 * Ký tự gõ được: ASCII in được (từ dấu cách tới ~) và xuống dòng.
 *
 * Tab KHÔNG nằm trong danh sách: engine tự thụt lề khi xuống dòng, nên tab trong dữ liệu
 * chỉ gây lệch giữa thứ hiện ra và thứ người ta gõ.
 */
function isTypeable(code: number): boolean {
  return code === 10 || (code >= 32 && code <= 126)
}

/** Tên gọi cho các ký tự hay lọt vào nhất, để báo lỗi đọc được ngay. */
const NAMES: Record<string, string> = {
  ' ': 'khoang trang khong ngat (nbsp)',
  '‘': 'nhay don cong trai',
  '’': 'nhay don cong phai',
  '“': 'nhay kep cong trai',
  '”': 'nhay kep cong phai',
  '–': 'gach ngang en',
  '—': 'gach ngang em',
  '…': 'dau ba cham',
  '\t': 'tab',
}

interface Offence {
  language: string
  id: string
  char: string
  code: number
  line: string
}

const offences: Offence[] = []
let scanned = 0

for (const { language, snippet } of allSnippets()) {
  scanned++

  for (const ch of snippet.code) {
    const code = ch.codePointAt(0) ?? 0
    if (isTypeable(code)) continue

    offences.push({
      language,
      id: snippet.id,
      char: ch,
      code,
      line: snippet.code.split('\n').find((l) => l.includes(ch))?.trim().slice(0, 60) ?? '',
    })
    break // Một snippet báo một lần là đủ để đi sửa.
  }
}

/**
 * Khoảng trắng thừa ở cuối dòng, và dòng trắng ở đầu/cuối snippet.
 *
 * Cùng loại bẫy với ký tự không gõ được, chỉ khác là VÔ HÌNH. Người chơi gõ xong dòng,
 * thấy giống hệt bản mẫu, mà con trỏ không chịu sang dòng — không có cách nào đoán ra là
 * còn thiếu hai dấu cách. Với một app đo độ chính xác thì đây là lỗi dữ liệu nặng.
 */
const whitespaceOffences: Array<{ language: string; id: string; why: string }> = []

for (const { language, snippet } of allSnippets()) {
  const lines = snippet.code.split('\n')

  const trailing = lines.findIndex((line) => /[ \t]+$/.test(line))
  if (trailing !== -1) {
    whitespaceOffences.push({
      language,
      id: snippet.id,
      why: `dong ${trailing + 1} co khoang trang thua o cuoi`,
    })
    continue
  }

  if (snippet.code !== snippet.code.trim()) {
    whitespaceOffences.push({ language, id: snippet.id, why: 'thua khoang trang o dau/cuoi bai' })
  }
}

console.log(`\nDa quet ${scanned} snippet`)

if (whitespaceOffences.length > 0) {
  console.log(`\n${whitespaceOffences.length} snippet CO KHOANG TRANG VO HINH:\n`)
  for (const o of whitespaceOffences) {
    console.log(`  [${o.language}] ${o.id} — ${o.why}`)
  }
}

if (offences.length > 0) {
  console.log(`\n${offences.length} snippet CO KY TU KHONG GO DUOC:\n`)

  for (const o of offences) {
    const name = NAMES[o.char] ?? `U+${o.code.toString(16).toUpperCase().padStart(4, '0')}`
    console.log(`  [${o.language}] ${o.id}`)
    console.log(`      ky tu : ${JSON.stringify(o.char)}  (${name})`)
    console.log(`      dong  : ${o.line}`)
  }

  process.exit(1)
}

if (whitespaceOffences.length > 0) process.exit(1)

console.log('Moi ky tu deu go duoc, khong co khoang trang vo hinh.\n')
