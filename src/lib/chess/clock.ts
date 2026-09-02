/**
 * Đồng hồ cờ.
 *
 * Mỗi bên 15 phút cho cả ván. Hết giờ trước là thua, trừ trường hợp đối thủ không đủ
 * quân để chiếu hết — khi đó hoà, theo luật FIDE 6.9.
 */

import type { Color } from './types'

/** 15 phút mỗi bên. */
export const INITIAL_MS = 15 * 60 * 1000

/** Dưới mốc này thì hiện thêm phần mười giây — giây cuối mới là lúc người ta nhìn đồng hồ. */
const TENTHS_BELOW_MS = 10_000

/**
 * "15:00", "1:07", và "0:09.4" khi còn dưới 10 giây.
 *
 * Làm tròn XUỐNG chứ không làm tròn gần nhất: hiện "0:01" trong khi thực tế còn 0,4 giây
 * là hứa với người chơi một giây họ không có.
 */
export function formatClock(ms: number): string {
  const left = Math.max(0, ms)

  if (left < TENTHS_BELOW_MS) {
    const seconds = Math.floor(left / 1000)
    const tenths = Math.floor((left % 1000) / 100)
    return `0:${String(seconds).padStart(2, '0')}.${tenths}`
  }

  const totalSeconds = Math.floor(left / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/**
 * Bên `color` có đủ quân để chiếu hết không?
 *
 * Dùng cho luật hết giờ: nếu người kia hết giờ mà bên này KHÔNG thể chiếu hết dù đối thủ
 * chơi dở nhất có thể, ván là HOÀ chứ không phải thắng. Không có luật này thì một người
 * còn mỗi vua vẫn "thắng" khi đối thủ hết giờ — sai và ai biết luật cũng nhận ra ngay.
 *
 * Không đủ chiếu hết: chỉ có vua; vua + một tượng; vua + một mã. Mọi thứ khác đều đủ
 * (kể cả hai mã — hiếm nhưng vẫn chiếu hết được nếu đối thủ đi dở).
 *
 * Đọc thẳng phần bàn cờ của FEN, không cần dựng lại ván.
 */
export function hasMatingMaterial(fen: string, color: Color): boolean {
  const placement = fen.split(' ')[0] ?? ''

  let minorPieces = 0

  for (const ch of placement) {
    if (ch === '/' || (ch >= '1' && ch <= '8')) continue

    const isWhite = ch === ch.toUpperCase()
    if ((color === 'w') !== isWhite) continue

    const kind = ch.toLowerCase()

    // Hậu, Xe hoặc Tốt là chắc chắn đủ — Tốt vì nó phong được.
    if (kind === 'q' || kind === 'r' || kind === 'p') return true

    if (kind === 'n' || kind === 'b') {
      minorPieces += 1
      if (minorPieces >= 2) return true
    }
  }

  return false
}

export interface ClockSnapshot {
  whiteMs: number
  blackMs: number
}

/**
 * Trạng thái đồng hồ, tính bằng MỐC THỜI GIAN chứ không đếm lùi từng nhịp.
 *
 * Trình duyệt bóp `setInterval` của tab chạy nền xuống 1 lần/giây hoặc thưa hơn. Đếm lùi
 * mỗi nhịp thì người chuyển tab được tặng giờ miễn phí. Lưu "còn bao nhiêu lúc bắt đầu
 * chạy" + "chạy từ lúc nào" rồi trừ theo `Date.now()` thì tab nền hay không cũng như
 * nhau — bộ đếm nhịp chỉ để VẼ LẠI, không để tính.
 */
export interface ClockState {
  /** Số mili giây còn lại tại thời điểm `runningSince`. */
  base: ClockSnapshot
  /** Bên đang bị trừ giờ. */
  turn: Color
  /** Mốc bắt đầu chạy. `null` = đồng hồ đang dừng. */
  runningSince: number | null
}

export function newClock(turn: Color = 'w'): ClockState {
  return {
    base: { whiteMs: INITIAL_MS, blackMs: INITIAL_MS },
    turn,
    runningSince: null,
  }
}

/** Giờ còn lại của hai bên tại thời điểm `now`. */
export function remaining(clock: ClockState, now: number): ClockSnapshot {
  if (clock.runningSince === null) return clock.base

  const spent = Math.max(0, now - clock.runningSince)

  return clock.turn === 'w'
    ? { whiteMs: clock.base.whiteMs - spent, blackMs: clock.base.blackMs }
    : { whiteMs: clock.base.whiteMs, blackMs: clock.base.blackMs - spent }
}

/** Chốt giờ đã dùng và chuyển lượt. Gọi sau MỖI nước đi. */
export function switchTurn(clock: ClockState, turn: Color, now: number): ClockState {
  return {
    base: remaining(clock, now),
    turn,
    runningSince: now,
  }
}

/** Dừng đồng hồ, chốt lại số giờ còn. Gọi khi ván kết thúc. */
export function stop(clock: ClockState, now: number): ClockState {
  return { base: remaining(clock, now), turn: clock.turn, runningSince: null }
}

/** Bên nào đã hết giờ, nếu có. */
export function flagged(snapshot: ClockSnapshot): Color | null {
  if (snapshot.whiteMs <= 0) return 'w'
  if (snapshot.blackMs <= 0) return 'b'
  return null
}

export interface TimeoutResult {
  loser: Color
  /** Hoà theo luật FIDE 6.9 — bên còn giờ không đủ quân chiếu hết. */
  draw: boolean
}

/**
 * Kết quả khi `loser` hết giờ.
 *
 * Để ở đây chứ không nhét trong component: đây là một điều LUẬT, phải kiểm được bằng
 * test. Nằm trong component thì chỉ kiểm được bằng cách dựng đúng thế cờ trên giao diện
 * rồi ngồi đợi 15 phút.
 */
export function timeoutResult(fen: string, loser: Color): TimeoutResult {
  const winner: Color = loser === 'w' ? 'b' : 'w'
  return { loser, draw: !hasMatingMaterial(fen, winner) }
}
