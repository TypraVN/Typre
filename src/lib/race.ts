import type { SnippetLanguage } from '../data/types'

/**
 * Đua real-time: nhiều người gõ CÙNG MỘT bài, thấy tiến độ của nhau chạy trực tiếp.
 *
 * Dùng Realtime channel của Supabase (broadcast + presence) nên KHÔNG cần bảng mới,
 * không cần migration: broadcast/presence không lưu gì xuống database.
 *
 * Phòng nằm trong hash như link thách đấu (`#/r/...`) — không cần router, không cần
 * cấu hình rewrite trên hosting tĩnh. Toàn bộ thông tin phòng nằm trong link, nên
 * người nhận mở link là vào đúng bài, đúng mốc, không phải hỏi ai.
 */
export interface Race {
  roomId: string
  language: SnippetLanguage
  timeLimit: number
  snippetId: string
}

const HASH_RE = /^#\/r\/([a-z0-9]{6})\/([a-z+#]+)\/(15|30|60)\/([a-z0-9-]+)$/i

export function readRaceFromHash(): Race | null {
  const match = window.location.hash.match(HASH_RE)
  if (!match) return null

  return {
    roomId: match[1].toLowerCase(),
    language: match[2] as SnippetLanguage,
    timeLimit: Number(match[3]),
    snippetId: match[4],
  }
}

export function buildRaceUrl(race: Race): string {
  const { roomId, language, timeLimit, snippetId } = race
  return `${window.location.origin}/#/r/${roomId}/${language}/${timeLimit}/${snippetId}`
}

export function clearRaceHash(): void {
  window.history.replaceState(null, '', window.location.pathname)
}

/**
 * Mã phòng 6 ký tự. Không cần chống trùng tuyệt đối: 36^6 ≈ 2,2 tỷ, và phòng chỉ sống
 * trong lúc mọi người còn mở tab — trùng thì cùng lắm là hai nhóm lạ gặp nhau.
 */
export function newRoomId(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

/** Trạng thái một người trong phòng, gửi qua presence. */
export interface Racer {
  /** Khoá presence, ổn định trong suốt một tab. */
  key: string
  name: string
  /** 0-100, phần trăm ký tự đã gõ của bài. */
  percent: number
  wpm: number
  /**
   * Lượt đã KẾT THÚC, dù là gõ xong hay hết giờ. Không có cờ này thì ai hết giờ giữa bài
   * sẽ đứng im mãi ở phần trăm dở dang và cả phòng không biết họ đã dừng.
   */
  done: boolean
  /** Gõ HẾT bài (khác với hết giờ). Chỉ người này mới có thứ tự về đích. */
  completed: boolean
  /** Thứ tự về đích, 1 là người đầu tiên. 0 = không về đích. */
  place: number
}

/**
 * Tên hiển thị khi chưa đăng nhập. Có hậu tố ngẫu nhiên để hai khách trong cùng phòng
 * không trùng tên — không thì không ai biết vạch nào của mình.
 */
export function guestName(): string {
  return `guest-${Math.floor(Math.random() * 9000 + 1000)}`
}
