import type { BoardPiece } from '../lib/chess/chessService'
import type { Square } from '../lib/chess/types'

interface ChessBoardProps {
  pieces: BoardPiece[]
  /** Nước vừa đi, để tô sáng hai ô — người chơi cần thấy bot vừa làm gì. */
  lastMove: { from: Square; to: Square } | null
  /** Ô của vua đang bị chiếu, tô đỏ. */
  checkSquare: Square | null
  /** Xoay bàn để bên đen ở dưới. */
  flipped: boolean
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const

/**
 * Ký tự cờ vua Unicode thay vì ảnh.
 *
 * Không cần tải thêm gì, nét ở mọi cỡ, và đổi màu theo chủ đề bằng `color` của CSS. Bộ
 * quân bằng ảnh SVG đẹp hơn chút nhưng thêm 12 tệp và một khoản tải nữa cho một chế độ
 * phụ — không đáng.
 */
const GLYPH: Record<string, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}

export function ChessBoard({ pieces, lastMove, checkSquare, flipped }: ChessBoardProps) {
  const bySquare = new Map(pieces.map((piece) => [piece.square, piece]))

  const files = flipped ? [...FILES].reverse() : FILES
  const ranks = flipped ? [...RANKS].reverse() : RANKS

  return (
    <div className="inline-block select-none font-mono">
      <div className="grid grid-cols-[auto_repeat(8,minmax(0,1fr))] gap-0">
        {ranks.map((rank) => (
          <Row key={rank} rank={rank}>
            {files.map((file) => {
              const square = `${file}${rank}` as Square
              const piece = bySquare.get(square)

              /**
               * Ô sáng khi tổng chỉ số hàng + cột là chẵn. Tính từ ký tự chứ không từ
               * chỉ số mảng, nên lật bàn không làm đảo màu ô.
               */
              const light = (file.charCodeAt(0) - 97 + Number(rank)) % 2 === 1

              const isLast = lastMove?.from === square || lastMove?.to === square
              const isCheck = checkSquare === square

              return (
                <div
                  key={square}
                  data-square={square}
                  className={[
                    'relative flex items-center justify-center',
                    'w-[clamp(2rem,9vw,3.25rem)] h-[clamp(2rem,9vw,3.25rem)]',
                    'text-[clamp(1.25rem,6vw,2.25rem)] leading-none',
                    light ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-zinc-400 dark:bg-zinc-700',
                    isLast && 'ring-2 ring-inset ring-orange-500 dark:ring-orange-400',
                    isCheck && 'bg-red-400 dark:bg-red-500/70',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {piece && (
                    <span
                      /*
                        Quân trắng vẽ bằng KÝ TỰ ĐEN rồi tô trắng + viền, chứ không dùng
                        ký tự quân trắng (♔). Ký tự quân trắng là hình rỗng ruột, đặt trên
                        ô sáng thì gần như biến mất. Cách này cho hình đặc, tương phản tốt
                        trên cả hai màu ô và cả hai chủ đề.
                      */
                      className={
                        piece.color === 'w'
                          ? 'text-white [text-shadow:0_0_1px_#000,0_0_2px_#000]'
                          : 'text-zinc-900'
                      }
                      aria-label={`${piece.color === 'w' ? 'white' : 'black'} ${piece.type} on ${square}`}
                    >
                      {GLYPH[piece.type]}
                    </span>
                  )}
                </div>
              )
            })}
          </Row>
        ))}

        {/* Ô góc trống dưới cột số hàng. */}
        <div />
        {files.map((file) => (
          <div
            key={file}
            className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 pt-1"
          >
            {file}
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({ rank, children }: { rank: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center justify-end pr-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        {rank}
      </div>
      {children}
    </>
  )
}
