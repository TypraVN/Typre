/**
 * Kiểm `parseSource`: link nào đọc được thành file để tải, link nào phải báo sai.
 *
 * Người dùng dán đủ kiểu link — link file, link raw, link gist, có hoặc không có `#L..`,
 * và cả link không phải file (trang repo, thư mục). Đọc sai một kiểu là hoặc tải nhầm thứ
 * khác, hoặc báo "link sai" cho một link hoàn toàn hợp lệ.
 */

import { languageFromFileName, parseSource } from '../src/lib/githubImport'

let passed = 0
const failures: string[] = []

function check(label: string, got: unknown, want: unknown) {
  const a = JSON.stringify(got)
  const b = JSON.stringify(want)
  if (a === b) {
    passed++
    return
  }
  failures.push(`  ${label}\n      mong doi : ${b}\n      nhan duoc: ${a}`)
}

// ── Link file trên github.com ────────────────────────────────────────────────
check(
  'blob thuong',
  parseSource('https://github.com/TypraVN/Typre/blob/main/src/lib/drill.ts'),
  {
    kind: 'raw',
    url: 'https://raw.githubusercontent.com/TypraVN/Typre/main/src/lib/drill.ts',
    fileName: 'drill.ts',
    lines: null,
  },
)
check(
  'blob kem mot dong #L12',
  parseSource('https://github.com/a/b/blob/main/x.py#L12'),
  { kind: 'raw', url: 'https://raw.githubusercontent.com/a/b/main/x.py', fileName: 'x.py', lines: { start: 12, end: 12 } },
)
check(
  'blob kem dai dong #L10-L40',
  parseSource('https://github.com/a/b/blob/v1.2/dir/y.rs#L10-L40'),
  { kind: 'raw', url: 'https://raw.githubusercontent.com/a/b/v1.2/dir/y.rs', fileName: 'y.rs', lines: { start: 10, end: 40 } },
)
check(
  'dai dong nguoc #L40-L10 duoc dao lai',
  (parseSource('https://github.com/a/b/blob/main/y.rs#L40-L10') as { lines: unknown }).lines,
  { start: 10, end: 40 },
)
check(
  'co khoang trang thua quanh link',
  (parseSource('  https://github.com/a/b/blob/main/y.go \n') as { fileName: string }).fileName,
  'y.go',
)

// ── raw / gist ───────────────────────────────────────────────────────────────
check(
  'raw.githubusercontent.com giu nguyen',
  parseSource('https://raw.githubusercontent.com/a/b/main/src/app.js'),
  { kind: 'raw', url: 'https://raw.githubusercontent.com/a/b/main/src/app.js', fileName: 'app.js', lines: null },
)
check(
  'gist co ten nguoi dung',
  parseSource('https://gist.github.com/someone/aa5a315d61ae9438b18d'),
  { kind: 'gist', id: 'aa5a315d61ae9438b18d', fileHint: null },
)
check(
  'gist chon file bang #file-',
  parseSource('https://gist.github.com/someone/aa5a315d61ae9438b18d#file-app-js'),
  { kind: 'gist', id: 'aa5a315d61ae9438b18d', fileHint: 'app-js' },
)

// ── Những link PHẢI báo sai ──────────────────────────────────────────────────
check('trang repo (khong phai file)', parseSource('https://github.com/a/b'), null)
check('thu muc (tree)', parseSource('https://github.com/a/b/tree/main/src'), null)
check('trang ca nhan gist', parseSource('https://gist.github.com/someone'), null)
check('trang khac', parseSource('https://gitlab.com/a/b/-/blob/main/x.py'), null)
check('khong phai link', parseSource('const x = 1'), null)
check('giao thuc la', parseSource('javascript:alert(1)'), null)

// ── Đoán ngôn ngữ từ đuôi file ───────────────────────────────────────────────
check('.tsx -> typescript', languageFromFileName('App.tsx'), 'typescript')
check('.PY viet hoa -> python', languageFromFileName('MAIN.PY'), 'python')
check('.h -> cpp', languageFromFileName('vec.h'), 'cpp')
check('khong co duoi', languageFromFileName('Makefile'), undefined)
check('duoi la', languageFromFileName('notes.xyz'), undefined)

console.log(`\n${passed}/${passed + failures.length} ca dat`)

if (failures.length > 0) {
  console.log(`\n${failures.length} ca HONG:\n`)
  console.log(failures.join('\n\n'))
  process.exit(1)
}

console.log('Tat ca deu dat.\n')
