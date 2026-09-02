/**
 * Ghép mã lỗi thành câu hiển thị.
 *
 * ĐÂY là nơi duy nhất sinh chữ cho người dùng thấy. Parser và engine chỉ trả mã + dữ
 * liệu — ban đầu tôi để chúng tự viết câu, và kết quả là app tiếng Anh hiện lỗi tiếng
 * Việt. Tách ra thì câu chữ luôn lấy từ đúng bộ nhãn của app.
 */

import type { Translation } from '../../i18n/translations'
import type { MoveError, ParseError } from './types'

/** Thay `{khoa}` bằng giá trị. Đủ dùng cho vài câu ngắn, không cần thư viện. */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole)
}

function pieceName(type: string | undefined, t: Translation): string {
  switch (type) {
    case 'n':
      return t.chessPieceKnight
    case 'b':
      return t.chessPieceBishop
    case 'r':
      return t.chessPieceRook
    case 'q':
      return t.chessPieceQueen
    case 'k':
      return t.chessPieceKing
    default:
      return t.chessPiecePawn
  }
}

export function describeParseError(error: ParseError, t: Translation): string {
  const token = error.token ?? ''

  switch (error.code) {
    case 'empty':
      return t.chessErrEmpty
    case 'unknown-square':
      return fill(t.chessErrUnknownSquare, { token })
    case 'same-square':
      return fill(t.chessErrSameSquare, { token })
    case 'bad-promotion':
      return fill(t.chessErrBadPromotion, { token })
    case 'syntax':
    default:
      return t.chessErrSyntax
  }
}

export function describeMoveError(error: MoveError, t: Translation): string {
  const from = error.from ?? ''
  const to = error.to ?? ''
  const piece = pieceName(error.piece, t)

  switch (error.code) {
    case 'game-over':
      return t.chessErrGameOver

    case 'empty-square':
      return fill(t.chessErrEmptyFrom, { from })

    case 'wrong-turn':
      return fill(t.chessErrWrongTurn, {
        from,
        turn: error.turn === 'w' ? t.chessWhite : t.chessBlack,
      })

    case 'leaves-king-in-check':
      return fill(t.chessErrInCheck, { from, to })

    case 'pinned':
      return fill(t.chessErrPinned, { from, piece })

    case 'illegal':
    default: {
      const targets = error.legalTargets ?? []

      /**
       * Có nước đi được thì LIỆT KÊ ra.
       *
       * Đây là khác biệt giữa báo lỗi và dạy người chơi: "con tốt ở e2 không tới được e5"
       * chỉ nói họ sai, còn "nó đi được e3, e4" nói họ phải làm gì. Với người vừa học cả
       * cờ vua lẫn cú pháp thì vế sau đáng giá hơn nhiều.
       */
      if (targets.length === 0) {
        return fill(t.chessErrIllegalNoTargets, { piece, from, to })
      }

      return fill(t.chessErrIllegal, {
        piece,
        from,
        to,
        targets: targets.join(', '),
      })
    }
  }
}
