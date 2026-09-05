/**
 * Bot cờ vua.
 *
 * Nhận FEN và tự dựng bàn riêng để tìm kiếm — KHÔNG cầm `ChessService` của ván đang
 * chạy. Tìm kiếm phải đi tới đi lui hàng nghìn nước; làm việc đó trên bàn cờ thật thì
 * chỉ cần một lần thoát sớm là ván của người chơi hỏng.
 *
 * Ba mức khác nhau ở THỜI GIAN ĐƯỢC NGHĨ, không phải ở việc cố tình đi dở:
 *   - de   : đi ngẫu nhiên, không tìm kiếm
 *   - vua  : nghĩ 120ms
 *   - kho  : nghĩ 900ms
 *
 * Bot cố tình đi dở thì người chơi nhận ra ngay và thấy bị coi thường. Bot nghĩ ít thì
 * thua một cách tự nhiên — nó nhìn nông và mắc đúng những lỗi người mới hay mắc.
 *
 * Tìm kiếm: negamax + cắt tỉa alpha-beta + đào sâu dần + TÌM KIẾM TĨNH LẶNG. Đánh giá:
 * vật chất + bảng vị trí riêng từng loại quân.
 */

import { Chess } from 'chess.js'
import type { ParsedMove, PromotionPiece, Square } from './types'

export type BotLevel = 'easy' | 'medium' | 'hard'

/**
 * NGÂN SÁCH THỜI GIAN, không phải độ sâu cố định.
 *
 * Bản đầu tôi cố định độ sâu 4 cho mức khó. Đo ra: 4 giây ở khai cuộc và **72 giây** ở
 * trung cuộc — không dùng được. Bỏ bớt lời gọi đắt của chess.js chỉ kéo xuống 41 giây,
 * vì nút cổ chai là chính việc sinh nước đi của thư viện.
 *
 * Ngân sách thời gian giải đúng vấn đề: bot đào sâu dần và dừng khi hết giờ, nên luôn
 * trả lời đúng hẹn dù thế cờ rối tới đâu. Thế đơn giản thì nó tự nhìn sâu hơn.
 */
const BUDGET_MS: Record<BotLevel, number> = {
  easy: 0,
  medium: 120,
  hard: 900,
}

/** Trần độ sâu. Tàn cuộc ít quân có thể đào rất sâu trong ngân sách — chặn lại cho lành. */
const MAX_DEPTH = 8

/**
 * Số nút giữa hai lần xem đồng hồ, trừ 1 để dùng được phép AND bit.
 *
 * Đây là ĐỘ MỊN của việc dừng: bot có thể vọt quá hẹn tối đa bằng thời gian chạy chừng
 * này nút.
 *
 * Đã hạ hai lần theo số đo thật: 2048 nút làm mức vừa (hẹn 120ms) chạy 381ms; 255 kéo
 * xuống 154ms; sau khi thêm tìm kiếm tĩnh lặng thì 255 lại vọt lên 296ms nên hạ tiếp
 * xuống 63, giờ còn 127-154ms. Gọi `Date.now()` dày hơn không đáng kể so với chi phí
 * sinh nước đi của chess.js.
 */
const TIME_CHECK_MASK = 63

/** Ném ra để thoát khỏi đệ quy khi hết giờ. Độ sâu đang dở bị bỏ, dùng kết quả độ sâu trước. */
const TIMEOUT = Symbol('bot-timeout')

/**
 * Giá trị quân, đơn vị phần trăm tốt. Bộ số kinh điển của Claude Shannon, vẫn dùng tới
 * giờ vì nó đủ tốt: Mã và Tượng lệch nhau 10 điểm phản ánh đúng việc Tượng nhỉnh hơn
 * chút ở thế cờ thoáng.
 *
 * Vua để 0 — không bao giờ bị ăn, và cho nó giá trị chỉ làm nhiễu phép cộng.
 */
const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
}

/**
 * Bảng vị trí RIÊNG cho từng loại quân, đọc theo góc nhìn quân TRẮNG (hàng 0 = hàng 8).
 *
 * Bản đầu dùng CHUNG một bảng "thưởng trung tâm" cho mọi quân. Nghe hợp lý nhưng sai
 * nặng ở đúng một chỗ: nó thưởng cả cho VUA đứng giữa bàn — điều tệ nhất có thể làm ở
 * khai cuộc và trung cuộc. Bot bị chính hàm đánh giá của mình dụ đi vua ra giữa.
 *
 * Bộ số dưới đây là bảng "simplified evaluation" quen thuộc, đủ tốt cho mức này.
 */
const PIECE_SQUARE: Record<string, number[][]> = {
  // Tốt: tiến lên có thưởng, càng gần phong càng lớn. Phạt nhẹ tốt d/e còn ở nhà.
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  // Mã: mạnh ở giữa, gần như vô dụng ở góc.
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  // Xe: thưởng hàng 7 (ép vua đối phương) và các cột giữa.
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  /**
   * Vua: NGƯỢC HẲN với các quân khác — thưởng khi nấp ở góc sau khi nhập thành, phạt
   * nặng khi ra giữa. Đây chính là chỗ bảng chung cũ làm sai.
   */
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
}

/** Điểm chiếu hết. Đủ lớn để mọi số vật chất cộng lại cũng không vượt qua. */
const MATE_SCORE = 1_000_000

/**
 * Chấm điểm thế cờ, theo góc nhìn của BÊN TRẮNG.
 *
 * Luôn quy về một bên để phép đảo dấu trong negamax không bị nhầm chiều — đây là chỗ
 * sai kinh điển khi tự viết engine.
 */
function evaluate(game: Chess): number {
  /**
   * Đọc thẳng phần bàn cờ trong chuỗi FEN thay vì gọi `game.board()`.
   *
   * `board()` dựng một mảng 8×8 toàn đối tượng mới, và hàm này chạy ở MỌI lá của cây tìm
   * kiếm — hàng chục nghìn lần mỗi nước đi. Duyệt chuỗi không cấp phát gì.
   */
  const placement = game.fen()
  let score = 0
  let row = 0
  let col = 0

  for (let i = 0; i < placement.length; i++) {
    const ch = placement[i]!

    if (ch === ' ') break

    if (ch === '/') {
      row++
      col = 0
      continue
    }

    if (ch >= '1' && ch <= '8') {
      col += ch.charCodeAt(0) - 48
      continue
    }

    const lower = ch.toLowerCase()
    // Chữ hoa là quân Trắng theo quy ước FEN.
    const isWhite = ch !== lower

    /**
     * Bảng viết theo góc nhìn Trắng, nên quân Đen phải LẬT hàng.
     *
     * Bản đầu tra cùng một ô cho cả hai màu. Với bảng đối xứng thì không sao, nhưng bảng
     * tốt và bảng vua thì KHÔNG đối xứng — tra sai là Đen được thưởng vì tiến về phía
     * hàng 8 của chính nó, tức đi lùi.
     */
    const table = PIECE_SQUARE[lower]
    const bonus = table ? (table[isWhite ? row : 7 - row]?.[col] ?? 0) : 0
    const value = (PIECE_VALUE[lower] ?? 0) + bonus

    score += isWhite ? value : -value
    col++
  }

  return score
}

/**
 * Sắp xếp nước đi: ăn quân trước.
 *
 * Cắt tỉa alpha-beta chỉ hiệu quả khi nước tốt được xét sớm. Không sắp xếp thì độ sâu 4
 * chậm gấp mấy lần mà kết quả y hệt.
 */
function orderMoves(game: Chess) {
  return game.moves({ verbose: true }).sort((a, b) => {
    const gainA = a.captured ? (PIECE_VALUE[a.captured] ?? 0) - (PIECE_VALUE[a.piece] ?? 0) : -1
    const gainB = b.captured ? (PIECE_VALUE[b.captured] ?? 0) - (PIECE_VALUE[b.piece] ?? 0) : -1
    return gainB - gainA
  })
}

/** Đồng hồ dùng chung cho một lượt tìm kiếm. Đặt lại ở mỗi lần `pickMove`. */
let deadline = Infinity
let nodes = 0

function checkTime(): void {
  nodes++
  if ((nodes & TIME_CHECK_MASK) === 0 && Date.now() > deadline) {
    throw TIMEOUT
  }
}

/**
 * Negamax có cắt tỉa alpha-beta. Trả điểm theo góc nhìn của bên ĐANG TỚI LƯỢT.
 *
 * `ply` là số nửa nước đã đi từ gốc. Dùng để chiếu hết SỚM được điểm cao hơn chiếu hết
 * muộn — không có nó thì bot thấy hai đường cùng dẫn tới thắng là chọn bừa, và có thể
 * cứ dây dưa mãi không kết thúc ván.
 */
/**
 * TÌM KIẾM TĨNH LẶNG — chỉ xét nước ĂN QUÂN cho tới khi thế cờ "yên".
 *
 * Đây là thứ thiếu quan trọng nhất của bản đầu. Dừng đếm ở đúng độ sâu đã định nghĩa là
 * đánh giá thế cờ GIỮA một chuỗi ăn quân: bot thấy "ăn được Hậu, hơn 9 điểm" rồi dừng,
 * không nhìn thấy nước ăn lại ngay sau đó. Đó là hiệu ứng chân trời, và là nguồn sai lầm
 * lớn nhất của mọi engine đơn giản.
 *
 * Cách chữa: tới độ sâu 0 thì đừng dừng hẳn, mà đi tiếp CHỈ các nước ăn quân cho tới khi
 * không còn gì để ăn. Rẻ vì mỗi thế chỉ có vài nước ăn, nhưng bỏ được gần hết loại sai
 * lầm "đưa quân vào chỗ bị ăn lại".
 *
 * `standPat` là điểm khi KHÔNG ăn gì thêm. Phải có, vì bên đi không bị ép phải ăn — nếu
 * mọi nước ăn đều tệ thì họ cứ đứng yên.
 */
function quiesce(game: Chess, alpha: number, beta: number, ply: number): number {
  checkTime()

  const moves = game.moves({ verbose: true })

  /**
   * PHẢI xét chiếu hết ở đây, không chỉ ở `search`.
   *
   * Bản đầu bỏ qua, và bot mất nước chiếu hết trong MỘT nước: `Ra8#` không phải nước ăn
   * quân nên tìm kiếm tĩnh lặng chỉ trả về điểm vật chất, còn độ sâu 2 (nơi có xét chiếu
   * hết) thì không phải lúc nào cũng kịp chạy xong trong ngân sách. Bài test bắt được vì
   * nó hỏng CHẬP CHỜN — lúc kịp lúc không.
   *
   * Không tốn thêm gì: danh sách nước đi vốn đã phải sinh để lọc ra nước ăn quân.
   */
  if (moves.length === 0) {
    return game.isCheck() ? -MATE_SCORE + ply : 0
  }

  const white = evaluate(game)
  const standPat = game.turn() === 'w' ? white : -white

  if (standPat >= beta) return beta
  if (standPat > alpha) alpha = standPat

  const captures = moves
    .filter((move) => move.captured !== undefined)
    .sort((a, b) => {
      // Ăn quân to bằng quân nhỏ trước: khả năng cắt tỉa cao nhất.
      const gainA = (PIECE_VALUE[a.captured!] ?? 0) - (PIECE_VALUE[a.piece] ?? 0)
      const gainB = (PIECE_VALUE[b.captured!] ?? 0) - (PIECE_VALUE[b.piece] ?? 0)
      return gainB - gainA
    })

  for (const move of captures) {
    game.move(move)
    const score = -quiesce(game, -beta, -alpha, ply + 1)
    game.undo()

    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }

  return alpha
}

function search(game: Chess, depth: number, alpha: number, beta: number, ply: number): number {
  checkTime()

  if (depth === 0) return quiesce(game, alpha, beta, ply)

  const moves = orderMoves(game)

  /**
   * Không còn nước đi = chiếu hết (nếu đang bị chiếu) hoặc hết nước đi hoà.
   *
   * Suy ra từ danh sách nước đi VỐN ĐÃ PHẢI SINH, thay vì gọi `isCheckmate()` +
   * `isStalemate()` + `isDraw()` + `isThreefoldRepetition()` ở mọi nút. Bốn hàm đó tự
   * sinh lại nước đi bên trong, và chính chúng làm mức khó mất 72 giây một nước.
   */
  if (moves.length === 0) {
    return game.isCheck() ? -MATE_SCORE + ply : 0
  }

  let best = -Infinity

  for (const move of moves) {
    game.move(move)
    const score = -search(game, depth - 1, -beta, -alpha, ply + 1)
    game.undo()

    if (score > best) best = score
    if (best > alpha) alpha = best
    if (alpha >= beta) break
  }

  return best
}

export interface BotOptions {
  level: BotLevel
  /** Cho phép bơm hàm ngẫu nhiên vào để test lặp lại được. */
  random?: () => number
  /** Ghi đè ngân sách thời gian (ms). Test dùng để chạy nhanh, không phải để chỉnh độ khó. */
  budgetMs?: number
}

/**
 * Chọn nước đi cho bên đang tới lượt trong thế cờ `fen`.
 *
 * Trả `null` khi ván đã kết thúc — người gọi phải xử lý, đừng cho rằng lúc nào cũng có
 * nước đi.
 */
export function pickMove(fen: string, options: BotOptions): ParsedMove | null {
  const random = options.random ?? Math.random
  const game = new Chess(fen)

  if (game.isGameOver()) return null

  const moves = orderMoves(game)
  if (moves.length === 0) return null

  const budget = options.budgetMs ?? BUDGET_MS[options.level]

  if (budget === 0) {
    const choice = moves[Math.floor(random() * moves.length)] ?? moves[0]!
    return toParsedMove(choice)
  }

  deadline = Date.now() + budget
  nodes = 0

  /**
   * Đào sâu dần: chạy xong độ sâu 1, rồi 2, rồi 3… tới khi hết giờ.
   *
   * Nghe phí vì phải làm lại từ đầu mỗi vòng, nhưng không phải: cây tìm kiếm phình theo
   * cấp số nhân nên toàn bộ các độ sâu trước cộng lại vẫn nhỏ hơn độ sâu hiện tại. Đổi
   * lại, LÚC NÀO cũng có sẵn một nước tốt nhất để trả về khi chuông reo.
   */
  let candidates = [moves[0]!]

  for (let depth = 1; depth <= MAX_DEPTH; depth++) {
    try {
      let best = -Infinity
      let atThisDepth: typeof moves = []

      for (const move of moves) {
        checkTime()
        game.move(move)
        const score = -search(game, depth - 1, -Infinity, Infinity, 1)
        game.undo()

        if (score > best) {
          best = score
          atThisDepth = [move]
        } else if (score === best) {
          atThisDepth.push(move)
        }
      }

      candidates = atThisDepth
    } catch (error) {
      // Hết giờ giữa chừng: BỎ độ sâu đang dở. Kết quả nửa vời còn tệ hơn độ sâu trước
      // đã chạy trọn, vì các nước xét sau chưa được chấm điểm.
      if (error === TIMEOUT) break
      throw error
    }
  }

  /**
   * Nhiều nước cùng điểm thì bốc ngẫu nhiên một nước.
   *
   * Không có bước này thì bot luôn đi y hệt trong cùng thế cờ, và ván thứ hai trở đi
   * chán ngay — người chơi chỉ cần học thuộc.
   */
  const picked = candidates[Math.floor(random() * candidates.length)] ?? candidates[0]!
  return toParsedMove(picked)
}

function toParsedMove(move: { from: string; to: string; promotion?: string }): ParsedMove {
  const parsed: ParsedMove = {
    from: move.from as Square,
    to: move.to as Square,
  }

  if (move.promotion) parsed.promotion = move.promotion as PromotionPiece

  return parsed
}
