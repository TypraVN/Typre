/**
 * Kiểu dữ liệu cho chế độ "Code-driven Chess" — đi cờ bằng cách gõ lệnh đúng cú pháp
 * của ngôn ngữ đang chọn.
 *
 * Tầng này KHÔNG phụ thuộc chess.js. Parser chỉ có một việc: biến chuỗi người dùng gõ
 * thành `{ from, to }`. Luật cờ là chuyện của `chessService.ts`. Tách như vậy để bộ test
 * parser chạy được bằng Node thuần, và để đổi thư viện cờ sau này không phải đụng tới
 * 14 bộ parser.
 */

import type { SnippetLanguage } from '../../data/types'

/**
 * Dùng lại đúng danh sách ngôn ngữ của app thay vì khai một danh sách riêng.
 *
 * Nhờ vậy `Record<ChessLanguage, ...>` ở commandParsers.ts buộc phải có đủ 14 mục —
 * thêm ngôn ngữ mới cho app mà quên viết parser là TypeScript báo lỗi ngay lúc build,
 * chứ không phải tới lúc người dùng chọn ngôn ngữ đó rồi mới vỡ.
 */
export type ChessLanguage = SnippetLanguage

export type BoardFile = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
export type BoardRank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'

/** Ô cờ dạng đại số: 'a1' … 'h8'. Kiểu ghép cho TypeScript chặn sai ngay lúc biên dịch. */
export type Square = `${BoardFile}${BoardRank}`

/** Quân được phong khi tốt tới hàng cuối. Chữ thường, khớp ký hiệu của chess.js. */
export type PromotionPiece = 'q' | 'r' | 'b' | 'n'

export interface ParsedMove {
  from: Square
  to: Square
  /**
   * Chỉ có khi người chơi ghi rõ quân phong. Thiếu thì `chessService` mặc định Hậu —
   * đúng thông lệ cờ vua, và tránh bắt người chơi gõ thêm khi 99% trường hợp là Hậu.
   */
  promotion?: PromotionPiece
}

export type ParseErrorCode =
  /** Chuỗi rỗng hoặc chỉ có khoảng trắng. */
  | 'empty'
  /** Không khớp khuôn cú pháp của ngôn ngữ đang chọn. */
  | 'syntax'
  /** Cú pháp đúng nhưng ô cờ nằm ngoài a1–h8. */
  | 'unknown-square'
  /** Ô đi và ô đến trùng nhau. */
  | 'same-square'
  /** Ký hiệu quân phong không phải q/r/b/n. */
  | 'bad-promotion'

/**
 * Lỗi phân tích: CHỈ mã và dữ liệu, KHÔNG có câu chữ.
 *
 * Tầng này không được sinh chuỗi hiển thị. Ban đầu tôi để `message` ở đây và viết sẵn
 * câu tiếng Việt — kết quả là app tiếng Anh hiện lỗi tiếng Việt, nhìn như hỏng. Trả về
 * mã thì giao diện ghép câu bằng đúng bộ nhãn của app, và sau này thêm ngôn ngữ giao
 * diện cũng không phải sửa engine.
 */
export interface ParseError {
  code: ParseErrorCode
  /** Đoạn văn bản gây lỗi, để ghép vào câu thông báo. */
  token?: string
  /**
   * Vị trí ký tự gây lỗi (0-based) để giao diện đặt gạch đỏ đúng chỗ.
   *
   * Không phải lỗi nào cũng định vị được — lỗi cú pháp toàn cục thì để trống, UI chỉ
   * gạch cả dòng.
   */
  at?: number
}

export type ParseResult =
  | { ok: true; move: ParsedMove }
  | { ok: false; error: ParseError }

/** Lý do luật cờ từ chối nước đi. Tách hẳn khỏi lỗi cú pháp: hai loại rất khác nhau. */
export type MoveErrorCode =
  /** Ô xuất phát không có quân nào. */
  | 'empty-square'
  /** Quân ở ô đó là của đối thủ. */
  | 'wrong-turn'
  /** Quân đó không đi được tới ô kia, hoặc bị chắn đường. */
  | 'illegal'
  /** Đi xong thì vua của mình bị chiếu — luật cấm. */
  | 'leaves-king-in-check'
  /** Quân đang ghim: đi là hở vua. */
  | 'pinned'
  /** Ván đã kết thúc. */
  | 'game-over'

/** Lỗi luật cờ: cũng chỉ mã và dữ liệu, cùng lý do với `ParseError`. */
export interface MoveError {
  code: MoveErrorCode
  from?: Square
  to?: Square
  /** Ký hiệu quân ở ô xuất phát: p, n, b, r, q, k. */
  piece?: string
  /**
   * Các ô quân đó ĐI ĐƯỢC.
   *
   * Giao diện vừa ghép vào câu thông báo vừa tô sáng lên bàn cờ — báo lỗi kèm lối ra
   * thì người mới học được, báo lỗi cụt thì họ chỉ đoán.
   */
  legalTargets?: Square[]
  /** Bên đang tới lượt, cho lỗi đi nhầm quân đối thủ. */
  turn?: Color
}

export type MoveResult =
  | { ok: true; state: GameState; san: string }
  | { ok: false; error: MoveError }

export type Color = 'w' | 'b'

export type GameStatus =
  | 'playing'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw-fifty-move'
  | 'draw-threefold'
  | 'draw-insufficient'

export interface GameState {
  /** Thế cờ đầy đủ. Đây là nguồn sự thật duy nhất — mọi thứ khác suy ra từ nó. */
  fen: string
  turn: Color
  status: GameStatus
  /** Chỉ có khi status là 'checkmate'. Hoà thì không ai thắng. */
  winner?: Color
  /** Lịch sử nước đi dạng ký hiệu chuẩn (SAN), ví dụ 'e4', 'Nf3', 'O-O'. */
  history: string[]
  /** Ván đã kết thúc chưa — tiện cho UI, khỏi phải liệt kê lại các status kết thúc. */
  isOver: boolean
}

/** Một bộ parser cho một ngôn ngữ. */
export interface LanguageParser {
  /**
   * Dựng câu lệnh hợp lệ cho một nước đi.
   *
   * Ví dụ hiển thị được SINH RA từ hàm này chứ không viết tay: viết tay thì sửa parser
   * xong quên sửa ví dụ, và người chơi gõ theo đúng ví dụ lại bị báo sai cú pháp. Có
   * hàm dựng thì bộ test kiểm được vòng tròn `parse(render(x)) === x` cho cả 14 ngôn
   * ngữ, nên hai thứ không thể lệch nhau.
   */
  render: (from: Square, to: Square, promotion?: PromotionPiece) => string
  parse: (input: string) => ParseResult
}

const FILES = 'abcdefgh'
const RANKS = '12345678'

/** Kiểm tra một chuỗi có phải ô cờ hợp lệ không, đồng thời thu hẹp kiểu cho TypeScript. */
export function isSquare(value: string): value is Square {
  return (
    value.length === 2 && FILES.includes(value[0]!) && RANKS.includes(value[1]!)
  )
}

export function isPromotionPiece(value: string): value is PromotionPiece {
  return value === 'q' || value === 'r' || value === 'b' || value === 'n'
}
