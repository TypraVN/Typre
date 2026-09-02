/**
 * Kiểm ChessService bằng thế cờ thật. Chạy: `npm run test:chess`
 *
 * Cố ý dùng ván đấu và thế cờ có thật thay vì thế bịa: luật cờ vua nhiều ngoại lệ
 * (nhập thành, bắt tốt qua đường, ghim, phong quân) mà thế bịa hay bỏ sót.
 */

import { ChessService } from '../src/lib/chess/chessService'
import { parseCommand } from '../src/lib/chess/commandParsers'
import type { ChessLanguage, Square } from '../src/lib/chess/types'

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

/** Đi bằng chuỗi lệnh thật, đúng luồng người dùng sẽ chạy. */
function play(service: ChessService, lang: ChessLanguage, command: string) {
  const parsed = parseCommand(lang, command)
  if (!parsed.ok) return { ok: false as const, why: `parser: ${parsed.error.code}` }

  const result = service.applyMove(parsed.move)
  return result.ok
    ? { ok: true as const, san: result.san, state: result.state }
    : { ok: false as const, why: `luat: ${result.error.code}` }
}

// ── Nước mở màn qua đúng luồng parser → engine ────────────────────────────────
{
  const s = new ChessService()
  const r = play(s, 'javascript', `board.move('e2', 'e4');`)
  check('e2e4 di duoc', r.ok, true)
  check('SAN cua e2e4', r.ok && r.san, 'e4')
  check('sau e2e4 den luot den', s.state.turn, 'b')
}

// ── Bốn loại lỗi luật phải phân biệt được ─────────────────────────────────────
{
  const s = new ChessService()

  const empty = s.applyMove({ from: 'e5' as Square, to: 'e6' as Square })
  check('o trong', !empty.ok && empty.error.code, 'empty-square')

  const theirs = s.applyMove({ from: 'e7' as Square, to: 'e5' as Square })
  check('quan doi thu', !theirs.ok && theirs.error.code, 'wrong-turn')

  const blocked = s.applyMove({ from: 'e2' as Square, to: 'e5' as Square })
  check('di qua xa', !blocked.ok && blocked.error.code, 'illegal')

  /**
   * Lỗi phải KÈM các ô đi được, không chỉ nói "không hợp lệ".
   *
   * Giao diện vừa ghép chúng vào câu vừa chấm lên bàn cờ. Kiểm dữ liệu chứ không kiểm
   * câu chữ: câu chữ nằm ở tầng nhãn và đổi lúc nào cũng được, còn dữ liệu là hợp đồng.
   */
  check('loi kem cac o di duoc', !blocked.ok && blocked.error.legalTargets, ['e3', 'e4'])
  check('loi kem quan gi', !blocked.ok && blocked.error.piece, 'p')
  check('loi kem o xuat phat', !blocked.ok && blocked.error.from, 'e2')
}

// ── Bị chiếu thì phải đỡ ──────────────────────────────────────────────────────
{
  /**
   * Sau 1.f3 e5 2.a3 Qh4+ — Trắng BỊ CHIẾU nhưng chặn được bằng g3.
   *
   * Phải là thế chiếu mà gỡ được. Thế đầu tiên tôi viết tay ở đây hoá ra là chiếu HẾT
   * (1.f3 e5 2.g4 Qh4#), nên ca kiểm "bỏ qua chiếu bị từ chối" nhận về 'game-over' chứ
   * không phải 'leaves-king-in-check' — bài test sai chứ không phải code sai.
   */
  const s = new ChessService('rnb1kbnr/pppp1ppp/8/4p3/7q/P4P2/1PPPP1PP/RNBQKBNR w KQkq - 1 3')
  check('dang bi chieu', s.state.status, 'check')

  // b2-b3 là nước tốt hợp lệ trong thế bình thường, nhưng ở đây nó bỏ mặc vua đang bị chiếu.
  const ignore = s.applyMove({ from: 'b2' as Square, to: 'b3' as Square })
  check('bo qua chieu bi tu choi', !ignore.ok && ignore.error.code, 'leaves-king-in-check')

  const block = s.applyMove({ from: 'g2' as Square, to: 'g3' as Square })
  check('chan chieu duoc', block.ok, true)
}

// ── Chiếu hết: ván kết thúc và xác định người thắng ───────────────────────────
{
  const s = new ChessService()
  const moves: Array<[ChessLanguage, string]> = [
    ['javascript', `board.move('f2', 'f3');`],
    ['python', `board.move("e7", "e5")`],
    ['go', `board.Move("g2", "g4")`],
    ['text', `d8->h4`],
  ]

  for (const [lang, command] of moves) play(s, lang, command)

  check('chieu bi (fools mate)', s.state.status, 'checkmate')
  check('den thang', s.state.winner, 'b')
  check('van ket thuc', s.state.isOver, true)

  const after = s.applyMove({ from: 'a2' as Square, to: 'a3' as Square })
  check('het van thi khong di duoc', !after.ok && after.error.code, 'game-over')
}

// ── Nhập thành: đi vua hai ô, engine tự hiểu ──────────────────────────────────
{
  const s = new ChessService('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1')
  const r = s.applyMove({ from: 'e1' as Square, to: 'g1' as Square })
  check('nhap thanh gan di duoc', r.ok, true)
  check('SAN la O-O', r.ok && r.san, 'O-O')
}

// ── Bắt tốt qua đường ─────────────────────────────────────────────────────────
{
  const s = new ChessService('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3')
  const r = s.applyMove({ from: 'e5' as Square, to: 'f6' as Square })
  check('bat tot qua duong', r.ok, true)
  check('SAN co dau x', r.ok && r.san, 'exf6')
}

// ── Phong quân ────────────────────────────────────────────────────────────────
{
  const s = new ChessService('8/P6k/8/8/8/8/7K/8 w - - 0 1')

  const auto = s.applyMove({ from: 'a7' as Square, to: 'a8' as Square })
  check('khong ghi quan phong thi mac dinh Hau', auto.ok && auto.san, 'a8=Q')
}
{
  const s = new ChessService('8/P6k/8/8/8/8/7K/8 w - - 0 1')
  const parsed = parseCommand('javascript', `board.move('a7', 'a8', 'n');`)
  const r = parsed.ok ? s.applyMove(parsed.move) : null
  check('ghi ro thi phong dung quan', r?.ok && r.san, 'a8=N')
}

// ── Hết nước đi mà không bị chiếu = hoà ───────────────────────────────────────
{
  const s = new ChessService('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')
  check('het nuoc di', s.state.status, 'stalemate')
  check('hoa thi khong ai thang', s.state.winner, undefined)
}

// ── Không đủ quân chiếu hết = hoà ─────────────────────────────────────────────
{
  const s = new ChessService('7k/8/6K1/8/8/8/8/8 w - - 0 1')
  check('vua doi vua', s.state.status, 'draw-insufficient')
}

// ── Lùi nước ──────────────────────────────────────────────────────────────────
{
  const s = new ChessService()
  s.applyMove({ from: 'e2' as Square, to: 'e4' as Square })
  s.applyMove({ from: 'e7' as Square, to: 'e5' as Square })
  check('da di 2 nuoc', s.state.history.length, 2)

  s.undo()
  check('lui mot nua nuoc', s.state.history.length, 1)
  check('lui xong den luot den', s.state.turn, 'b')
}

// ── Gợi ý ô đi được, cho giao diện tô sáng ────────────────────────────────────
{
  const s = new ChessService()
  check('ma b1 di duoc 2 o', s.legalTargets('b1' as Square).sort(), ['a3', 'c3'])
  check('quan bi chan thi khong co o nao', s.legalTargets('a1' as Square), [])
}

// ── Danh sách quân để vẽ bàn ──────────────────────────────────────────────────
{
  const s = new ChessService()
  check('bat dau co 32 quan', s.pieces().length, 32)
}

console.log(`\n${passed}/${passed + failures.length} ca dat`)

if (failures.length > 0) {
  console.log(`\n${failures.length} ca HONG:\n`)
  console.log(failures.join('\n\n'))
  process.exit(1)
}

console.log('Tat ca deu dat.\n')
