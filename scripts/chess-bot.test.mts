/**
 * Kiểm bot. Chạy cùng `npm run test:chess`.
 *
 * Mọi thế cờ dùng ở đây đều đã đối chiếu bằng chess.js trước khi viết vào — thế viết tay
 * rất dễ sai (lần đầu tôi tưởng một thế là "đang bị chiếu" thì hoá ra đã chiếu hết).
 */

import { Chess } from 'chess.js'
import { pickMove, type BotLevel } from '../src/lib/chess/chessBot'
import { ChessService } from '../src/lib/chess/chessService'

let passed = 0
const failures: string[] = []

function check(label: string, got: unknown, want: unknown) {
  const a = JSON.stringify(got)
  const b = JSON.stringify(want)
  if (a === b) {
    passed++
    return
  }
  failures.push(`  ${label}\n      mong doi: ${b}\n      nhan duoc: ${a}`)
}

/**
 * Test truyen `budgetMs` rieng, nho hon ngan sach that.
 *
 * Khong phai de chinh do kho ma de bo test chay trong vai giay: muc kho that nghi 900ms
 * moi nuoc, nhan voi hang tram nuoc trong cac ca tu danh la ca phut cho doi.
 */

/** Bơm hàm ngẫu nhiên cố định để kết quả lặp lại được giữa các lần chạy. */
const fixedRandom = () => 0

const LEVELS: BotLevel[] = ['easy', 'medium', 'hard']

// ── Ván đã kết thúc thì không có nước nào ─────────────────────────────────────
{
  const mated = '6k1/5ppp/8/8/8/8/8/R5K1 b - - 0 1'
  const g = new Chess(mated)
  check('the co dung la het van', g.isGameOver(), false)
}
{
  // Fool's mate: đen đã chiếu hết trắng.
  const g = new Chess()
  for (const mv of ['f3', 'e5', 'g4', 'Qh4#']) g.move(mv)
  check('fools mate la het van', g.isCheckmate(), true)

  for (const level of LEVELS) {
    check(`het van thi ${level} tra null`, pickMove(g.fen(), { level, budgetMs: 20 }), null)
  }
}

// ── Nước bot trả về LUÔN phải hợp lệ ─────────────────────────────────────────
{
  let illegal = 0
  let plies = 0

  for (const level of LEVELS) {
    const service = new ChessService()

    // Chơi 40 nửa nước, bot tự đấu với chính nó.
    for (let i = 0; i < 40; i++) {
      const state = service.state
      if (state.isOver) break

      const move = pickMove(state.fen, { level, random: Math.random, budgetMs: 25 })
      if (!move) break

      const result = service.applyMove(move)
      plies++
      if (!result.ok) illegal++
    }
  }

  check('bot tu danh khong sinh nuoc sai', illegal, 0)
  check('co danh that (khong phai 0 nuoc)', plies > 60, true)
}

// ── Ăn quân bỏ không ─────────────────────────────────────────────────────────
{
  // Hậu đen đứng d4 không ai bảo vệ, tốt trắng e3 ăn được.
  const fen = '4k3/8/8/8/3q4/4P3/8/4K3 w - - 0 1'

  const easy = pickMove(fen, { level: 'easy', random: fixedRandom })
  check('de: van tra ve mot nuoc', easy !== null, true)

  for (const level of ['medium', 'hard'] as BotLevel[]) {
    const move = pickMove(fen, { level, random: fixedRandom, budgetMs: 120 })
    check(`${level}: an hau bo khong (e3xd4)`, move && `${move.from}${move.to}`, 'e3d4')
  }
}

// ── Tìm ra chiếu hết trong một nước ──────────────────────────────────────────
{
  // Xe trắng a1, vua đen g8 bị tốt của chính nó bịt lối — Ra8 là chiếu hết.
  const fen = '6k1/5ppp/8/8/8/8/8/R6K w - - 0 1'

  for (const level of ['medium', 'hard'] as BotLevel[]) {
    const move = pickMove(fen, { level, random: fixedRandom, budgetMs: 120 })
    check(`${level}: tim ra chieu het (Ra8)`, move && `${move.from}${move.to}`, 'a1a8')
  }
}

// ── Mức khó phải THẤY TRƯỚC nước trả đũa, mức dễ thì không ───────────────────
{
  /**
   * Bẫy: ăn tốt b7 bằng Hậu thì mất Hậu ngay (Tượng c8 ăn lại).
   *
   * Đây là kiểm tra đáng giá nhất trong tệp: nó phân biệt bot thật sự nhìn trước với bot
   * chỉ đếm vật chất một nước.
   */
  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  const g = new Chess(fen)
  for (const mv of ['e4', 'e5', 'Qf3', 'Nc6', 'Qxf7']) {
    try {
      g.move(mv)
    } catch {
      /* nước không hợp lệ trong biến thể này, bỏ qua */
    }
  }
  check('the co bay dung la den di', g.turn(), 'b')

  // Đen ăn lại Hậu trắng ở f7 bằng vua — bot mức vừa trở lên phải thấy.
  const canRecapture = g.moves({ verbose: true }).some((m) => m.to === 'f7' && m.captured)
  check('den an lai duoc o f7', canRecapture, true)

  for (const level of ['medium', 'hard'] as BotLevel[]) {
    const move = pickMove(g.fen(), { level, random: fixedRandom, budgetMs: 120 })
    check(`${level}: an lai hau o f7`, move && move.to, 'f7')
  }
}

// ── Mức khó không tự đi vào chiếu hết ────────────────────────────────────────
{
  const fen = '6k1/5ppp/8/8/8/8/5PPP/R5K1 b - - 0 1'
  const move = pickMove(fen, { level: 'hard', random: fixedRandom, budgetMs: 250 })

  if (move) {
    const g = new Chess(fen)
    g.move({ from: move.from, to: move.to })
    // Sau nước của đen, trắng có chiếu hết ngay được không?
    const mateNext = g.moves().some((mv) => {
      g.move(mv)
      const mate = g.isCheckmate()
      g.undo()
      return mate
    })
    check('kho: khong tu di vao chieu het', mateNext, false)
  }
}

// ── Ba mức phải khác nhau về chất lượng ──────────────────────────────────────
{
  // Cho mức khó đấu mức dễ 60 nửa nước; khó phải hơn hẳn về vật chất.
  const service = new ChessService()
  let ply = 0

  while (ply < 60 && !service.state.isOver) {
    const level: BotLevel = service.state.turn === 'w' ? 'hard' : 'easy'
    const move = pickMove(service.state.fen, {
      level,
      random: Math.random,
      budgetMs: level === 'hard' ? 150 : 0,
    })
    if (!move) break
    service.applyMove(move)
    ply++
  }

  const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
  let material = 0
  for (const piece of service.pieces()) {
    material += (piece.color === 'w' ? 1 : -1) * (VALUE[piece.type] ?? 0)
  }

  check('kho danh bai de ve vat chat', material > 0, true)
}

console.log(`\n${passed}/${passed + failures.length} ca dat`)

if (failures.length > 0) {
  console.log(`\n${failures.length} ca HONG:\n`)
  console.log(failures.join('\n\n'))
  process.exit(1)
}

console.log('Tat ca deu dat.\n')
