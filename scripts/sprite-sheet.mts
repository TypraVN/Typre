/**
 * Xuất một tấm SVG xem trước cả bộ quân, để soi hình mà không phải mở app.
 *
 * Vẽ trên cả ô sáng lẫn ô tối vì đó chính là chỗ dễ hỏng nhất: một bộ màu đẹp trên nền
 * này có thể chìm hẳn trên nền kia.
 */
import { writeFileSync } from 'node:fs'
import { PIECE_SPRITES, SPRITE_VIEW_BOX } from '../src/lib/chess/pieceSprites'

const TYPES = ['K', 'Q', 'R', 'B', 'N', 'P']
const CELL = 76
const SQUARE = ['#a1a1aa', '#71717a']

const parts: string[] = []
let y = 0

for (const bg of SQUARE) {
  let x = 0
  for (const color of ['w', 'b']) {
    for (const type of TYPES) {
      const groups = PIECE_SPRITES[color + type]!
      parts.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="${bg}"/>`)
      const pad = CELL * 0.08
      const paths = groups.map((g) => `<path d="${g.d}" stroke="${g.stroke}" fill="none"/>`).join('')
      parts.push(
        `<svg x="${x + pad}" y="${y + pad}" width="${CELL - 2 * pad}" height="${CELL - 2 * pad}" viewBox="${SPRITE_VIEW_BOX}" shape-rendering="crispEdges">${paths}</svg>`,
      )
      x += CELL
    }
  }
  y += CELL
}

const width = CELL * TYPES.length * 2
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y}" viewBox="0 0 ${width} ${y}">${parts.join('')}</svg>`
writeFileSync('sprite-sheet.svg', svg)
console.log(`sprite-sheet.svg  ${width}x${y}`)
