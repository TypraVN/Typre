/**
 * Phòng cờ hai người, qua Realtime channel của Supabase.
 *
 * Dùng lại đúng cách phần đua thời gian thực đang làm: broadcast + presence — CHÍNH BẢN
 * THÂN PHÒNG vẫn không có bảng nào cả, ván cờ (nước đi, thế cờ giữa chừng) chỉ sống trong
 * lúc hai người còn mở tab.
 *
 * Ngoại lệ DUY NHẤT: lúc ván KẾT THÚC, kết quả (ai thắng, ELO đổi bao nhiêu) được ghi
 * xuống `chess_ratings`/`chess_games` (xem `record_chess_result` trong
 * add-chess-leaderboard.sql) để có bảng xếp hạng — không phải toàn bộ ván, chỉ đúng một
 * dòng kết quả cuối cùng.
 *
 * Phòng nằm trong hash (`#/cg/<ma>`) như link thách đấu, nên không cần router và không
 * cần rewrite trên hosting tĩnh.
 */

import type { ClockSnapshot } from './clock'
import type { Color, ParsedMove } from './types'

const HASH_RE = /^#\/cg\/([a-z0-9]{6})$/i

export function readRoomFromHash(): string | null {
  const match = window.location.hash.match(HASH_RE)
  return match ? match[1]!.toLowerCase() : null
}

export function buildRoomUrl(roomId: string): string {
  return `${window.location.origin}/#/cg/${roomId}`
}

export function setRoomHash(roomId: string): void {
  window.history.replaceState(null, '', `${window.location.pathname}#/cg/${roomId}`)
}

export function clearRoomHash(): void {
  window.history.replaceState(null, '', window.location.pathname)
}

/** Mã phòng 6 ký tự, cùng bảng chữ với phòng đua. */
export function newRoomId(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

/** Một người trong phòng. */
export interface RoomMember {
  key: string
  name: string
  /**
   * ID tài khoản thật (Supabase), `null` nếu chưa đăng nhập.
   *
   * Chỉ dùng để nộp kết quả lên bảng xếp hạng ELO (xem `record_chess_result` trong
   * add-chess-leaderboard.sql) — không dùng cho logic chia màu hay đồng bộ nước đi, những
   * chỗ đó vẫn dựa vào `key`/`joinedAt` như trước.
   */
  userId: string | null
  /**
   * Mốc thời gian vào phòng, dùng để chia màu.
   *
   * Phải là con số hai máy cùng thấy như nhau, chứ không dựa vào thứ tự presence trả về
   * — thứ tự đó không được bảo đảm, và hai máy chia màu khác nhau là ván hỏng ngay.
   */
  joinedAt: number
}

/**
 * Ai cầm Trắng: người vào phòng TRƯỚC.
 *
 * Trùng mốc thời gian thì so khoá — hai máy cùng chạy phép so này trên cùng dữ liệu nên
 * luôn ra cùng kết quả.
 */
export function colorFor(members: RoomMember[], myKey: string): Color | null {
  const sorted = [...members].sort((a, b) =>
    a.joinedAt === b.joinedAt ? a.key.localeCompare(b.key) : a.joinedAt - b.joinedAt,
  )

  const index = sorted.findIndex((member) => member.key === myKey)
  if (index === -1) return null

  // Người thứ ba trở đi là khán giả, không có màu.
  return index === 0 ? 'w' : index === 1 ? 'b' : null
}

/** Nước đi gửi cho đối thủ. */
export interface MoveMessage {
  move: ParsedMove
  /**
   * Thế cờ SAU nước đi, dùng làm chữ ký đối chiếu.
   *
   * Bên nhận tự áp dụng nước đi để giữ được biên bản (nạp thẳng FEN sẽ mất lịch sử), rồi
   * so FEN. Lệch thì nạp FEN của bên gửi — mất biên bản còn hơn hai bên nhìn hai bàn cờ
   * khác nhau mà không ai biết.
   */
  fen: string
  /**
   * Giờ còn lại của hai bên NGAY SAU nước này.
   *
   * Bên vừa đi mới là bên biết chính xác họ đã dùng bao lâu, nên giờ họ gửi là nguồn
   * đúng. Không đồng bộ thì hai đồng hồ trôi dần khỏi nhau, và cuối ván hai người nhìn
   * hai con số khác hẳn.
   */
  clock?: ClockSnapshot
}

export interface SyncMessage {
  fen: string
  history: string[]
  /** Giờ hiện tại, để người vào lại giữa ván không được cấp 15 phút mới. */
  clock?: ClockSnapshot
}
