/**
 * Lớp bọc chess.js.
 *
 * Việc của nó: nhận `{ from, to }` đã được parser tách ra, hỏi chess.js xem luật cờ có
 * cho đi không, rồi trả về trạng thái mới hoặc một lỗi ĐÃ PHÂN LOẠI.
 *
 * Phần phân loại lỗi mới là lý do tệp này tồn tại. chess.js chỉ ném đúng một câu
 * `Invalid move: {...}` cho mọi trường hợp — quân không có ở đó, quân của đối thủ, bị
 * chắn đường, hay đi xong thì hở vua. Với người đang HỌC gõ lệnh thì bốn lỗi đó cần bốn
 * câu trả lời khác nhau, nên ở đây tự suy ra trước khi gọi.
 */

import { Chess, type Move, type Square as ChessSquare } from 'chess.js'
import {
  type Color,
  type GameState,
  type GameStatus,
  type MoveError,
  type MoveResult,
  type ParsedMove,
  type PromotionPiece,
  type Square,
} from './types'

/** Ô của chess.js là cùng tập giá trị, nhưng hai kiểu khai riêng nên phải bắc cầu. */
function toChessSquare(square: Square): ChessSquare {
  return square as ChessSquare
}

export interface BoardPiece {
  square: Square
  /** p, n, b, r, q, k */
  type: string
  color: Color
}

export class ChessService {
  private game: Chess

  constructor(fen?: string) {
    this.game = new Chess(fen)
  }

  /**
   * Áp dụng một nước đi.
   *
   * KHÔNG bọc `game.move()` trong try/catch rồi trả về "nước đi không hợp lệ": làm vậy
   * thì người chơi không bao giờ biết vì sao. Kiểm ba điều kiện dễ hiểu trước, chỉ khi
   * qua hết mới để chess.js phán quyết.
   */
  applyMove(move: ParsedMove): MoveResult {
    if (this.game.isGameOver()) {
      return this.reject({ code: 'game-over' })
    }

    const piece = this.game.get(toChessSquare(move.from))

    if (!piece) {
      return this.reject({ code: 'empty-square', from: move.from })
    }

    if (piece.color !== this.game.turn()) {
      return this.reject({ code: 'wrong-turn', from: move.from, turn: this.game.turn() })
    }

    const legal = this.game.moves({ square: toChessSquare(move.from), verbose: true })
    const matching = legal.filter((candidate) => candidate.to === move.to)

    if (matching.length === 0) {
      /**
       * Đang bị chiếu mà quân này không có nước nào hợp lệ: gần như chắc chắn người chơi
       * đang bỏ qua việc phải đỡ chiếu, hoặc quân đang ghim. Nói rõ ra hữu ích hơn hẳn
       * câu "nước đi không hợp lệ".
       */
      if (this.game.isCheck()) {
        return this.reject({
          code: 'leaves-king-in-check',
          from: move.from,
          to: move.to,
          piece: piece.type,
          legalTargets: legal.map((candidate) => candidate.to as Square),
        })
      }

      if (legal.length === 0) {
        return this.reject({ code: 'pinned', from: move.from, piece: piece.type })
      }

      return this.reject({
        code: 'illegal',
        from: move.from,
        to: move.to,
        piece: piece.type,
        legalTargets: legal.map((candidate) => candidate.to as Square),
      })
    }

    /**
     * Tốt tới hàng cuối BẮT BUỘC phải phong. Người chơi không ghi thì mặc định Hậu —
     * đúng thông lệ, và bắt gõ thêm `'q'` ở mọi nước phong chỉ làm phiền.
     */
    const needsPromotion = matching.some((candidate) => candidate.promotion !== undefined)
    const promotion: PromotionPiece | undefined = needsPromotion
      ? (move.promotion ?? 'q')
      : undefined

    let result: Move

    try {
      result = this.game.move({
        from: toChessSquare(move.from),
        to: toChessSquare(move.to),
        ...(promotion ? { promotion } : {}),
      })
    } catch {
      // Tới đây thì ba kiểm tra trên đã qua, nên đây là trường hợp mình chưa lường được.
      // Trả lỗi chung còn hơn để ngoại lệ thoát ra làm trắng màn hình.
      return this.reject({ code: 'illegal', from: move.from, to: move.to, piece: piece.type })
    }

    return { ok: true, state: this.state, san: result.san }
  }

  private reject(error: MoveError): MoveResult {
    return { ok: false, error }
  }

  get state(): GameState {
    const status = this.status
    const state: GameState = {
      fen: this.game.fen(),
      turn: this.game.turn(),
      status,
      history: this.game.history(),
      captured: this.captured,
      isOver: this.game.isGameOver(),
    }

    // Chiếu hết thì bên VỪA ĐI thắng, tức bên đối diện với bên đang tới lượt.
    if (status === 'checkmate') {
      state.winner = this.game.turn() === 'w' ? 'b' : 'w'
    }

    return state
  }

  /**
   * Quân đã bị ăn, đọc từ BIÊN BẢN chứ không suy từ thế cờ.
   *
   * Cách kia — đếm quân còn trên bàn rồi lấy bộ đủ trừ đi — nghe gọn hơn nhưng sai ở
   * phong cấp: Tốt lên hàng cuối hoá Hậu thì bàn cờ thiếu một Tốt, và phép trừ báo là
   * Tốt đó đã bị ăn. Biên bản thì ghi thẳng nước nào ăn quân gì, không phải đoán.
   *
   * Đổi lại, nhánh `load()` xoá biên bản nên khu quân chết trống. Nhánh đó chỉ chạy khi
   * hai máy lệch thế cờ, và ở đó đã chấp nhận mất biên bản rồi — mất thêm khu quân chết
   * vẫn đỡ hơn là bày ra một danh sách bịa.
   */
  private get captured(): { w: string[]; b: string[] } {
    const taken: { w: string[]; b: string[] } = { w: [], b: [] }

    for (const move of this.game.history({ verbose: true })) {
      if (!move.captured) continue

      // `color` là bên ĐI, nên quân bị ăn thuộc bên còn lại.
      taken[move.color === 'w' ? 'b' : 'w'].push(move.captured)
    }

    return taken
  }

  private get status(): GameStatus {
    if (this.game.isCheckmate()) return 'checkmate'
    if (this.game.isStalemate()) return 'stalemate'
    if (this.game.isInsufficientMaterial()) return 'draw-insufficient'
    if (this.game.isThreefoldRepetition()) return 'draw-threefold'
    if (this.game.isDrawByFiftyMoves()) return 'draw-fifty-move'
    if (this.game.isCheck()) return 'check'
    return 'playing'
  }

  /**
   * Các ô mà quân ở `square` đi tới được.
   *
   * KHÔNG phải mã chết: `scripts/chess-service.test.mts` gọi thẳng hàm này để kiểm tra
   * gợi ý ô đi được, tách biệt khỏi đường đi qua `MoveError.legalTargets` mà giao diện
   * dùng. Xoá đi lúc rà lại code — tưởng không nơi nào gọi vì chỉ grep trong `src/`, bỏ
   * sót `scripts/` — làm `npm test` vỡ ngay. Giữ lại cả hai: một để UI tô sáng gợi ý sau
   * khi gõ sai, một để test có cách kiểm độc lập không phải cố tình gõ sai trước.
   */
  legalTargets(square: Square): Square[] {
    return this.game
      .moves({ square: toChessSquare(square), verbose: true })
      .map((move) => move.to as Square)
  }

  /**
   * Ô đi/ô đến của nước gần nhất, để `undo()` biết trượt quân ngược chiều nào.
   *
   * `null` khi chưa có nước nào — ván vừa mới bắt đầu.
   */
  lastMoveSquares(): { from: Square; to: Square } | null {
    const history = this.game.history({ verbose: true })
    const last = history[history.length - 1]
    return last ? { from: last.from as Square, to: last.to as Square } : null
  }

  /** Danh sách quân đang trên bàn, phẳng, để component vẽ. */
  pieces(): BoardPiece[] {
    return this.game
      .board()
      .flat()
      .filter((cell): cell is NonNullable<typeof cell> => cell !== null)
      .map((cell) => ({
        square: cell.square as Square,
        type: cell.type,
        color: cell.color,
      }))
  }

  /**
   * Lùi một nửa nước (một lượt của một bên).
   *
   * Chế độ đấu bot cần gọi HAI lần để lùi về lượt của người chơi — bot đã đi rồi.
   */
  undo(): GameState {
    this.game.undo()
    return this.state
  }

  reset(fen?: string): GameState {
    this.game = new Chess(fen)
    return this.state
  }

  /** Nạp lại từ FEN. Dùng khi đồng bộ ván đấu hai người qua mạng. */
  load(fen: string): GameState {
    this.game.load(fen)
    return this.state
  }
}
