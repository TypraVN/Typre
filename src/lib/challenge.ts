import type { SnippetLanguage } from '../data/types'

/**
 * Link thách đấu: mở app với ĐÚNG bài đó, đúng mốc thời gian đó, kèm điểm cần vượt.
 * Dùng hash (`#/c/...`) như trang profile công khai — không cần router, không cần
 * cấu hình rewrite trên hosting tĩnh.
 */
export interface Challenge {
  language: SnippetLanguage
  timeLimit: number
  snippetId: string
  /** wpm của người gửi lời thách. */
  target: number
}

// Chỉ nhận đúng bộ ký tự của id bài và 3 mốc thời gian đang có — link méo thì bỏ qua,
// không để nó đẩy app vào trạng thái lạ.
const HASH_RE = /^#\/c\/([a-z+#]+)\/(15|30|60)\/([a-z0-9-]+)\/(\d{1,3})$/i

export function readChallengeFromHash(): Challenge | null {
  const match = window.location.hash.match(HASH_RE)
  if (!match) return null

  return {
    language: match[1] as SnippetLanguage,
    timeLimit: Number(match[2]),
    snippetId: match[3],
    target: Number(match[4]),
  }
}

export function buildChallengeUrl(challenge: Challenge): string {
  const { language, timeLimit, snippetId, target } = challenge
  return `${window.location.origin}/#/c/${language}/${timeLimit}/${snippetId}/${target}`
}

/**
 * Xoá hash sau khi đã áp dụng. Không xoá thì bấm "next snippet" xong reload lại là
 * quay về bài thách đấu cũ, tưởng app hỏng.
 */
export function clearChallengeHash(): void {
  window.history.replaceState(null, '', window.location.pathname)
}
