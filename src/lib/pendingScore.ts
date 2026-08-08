import type { SnippetLanguage } from '../data/types'

/**
 * Đăng nhập bằng OAuth/magic link luôn làm trang tải lại, nên kết quả vừa gõ biến mất
 * trước khi kịp gửi lên bảng xếp hạng. Ở đây giữ tạm điểm đó lại để gửi ngay sau khi
 * đăng nhập xong.
 *
 * Dùng localStorage (không phải sessionStorage) vì magic link trong email mở ở TAB MỚI —
 * sessionStorage không đi cùng sang tab đó.
 */
const KEY = 'codetyping-pending-score'

// Để lâu quá thì điểm đó chẳng còn liên quan gì tới việc vừa làm — coi như không có.
const MAX_AGE_MS = 30 * 60 * 1000

export interface PendingScore {
  language: SnippetLanguage
  timeLimit: number
  wpm: number
  cpm: number
  rawWpm: number
  consistency: number
  accuracy: number
  savedAt: number
}

export type PendingScoreInput = Omit<PendingScore, 'savedAt'>

export function savePendingScore(score: PendingScoreInput): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...score, savedAt: Date.now() }))
  } catch {
    // Hết quota / chế độ riêng tư: không giữ được điểm cũng không sao, chỉ mất tiện lợi.
  }
}

export function clearPendingScore(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Không đọc/ghi được storage thì cũng chẳng có gì để xoá.
  }
}

/**
 * Đọc VÀ xoá luôn trong một lần gọi — nếu chỉ đọc thì hai lần auth event liên tiếp sẽ
 * gửi trùng cùng một điểm lên bảng.
 */
export function takePendingScore(): PendingScore | null {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return null
  }
  if (!raw) return null

  clearPendingScore()

  try {
    const parsed = JSON.parse(raw) as PendingScore
    if (typeof parsed?.wpm !== 'number' || typeof parsed?.savedAt !== 'number') return null
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}
