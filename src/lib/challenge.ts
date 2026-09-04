import type { SnippetLanguage } from '../data/types'

/**
 * Link thách đấu: mở app với ĐÚNG bài đó, đúng mốc thời gian đó, kèm điểm cần vượt.
 *
 * Dùng PATH thật (`/c/...`), không phải hash: một Edge Middleware trên Vercel
 * (`middleware.ts` ở gốc repo) chặn đúng path này để vá lại thẻ `og:image`/`og:title`
 * bằng điểm số thật trước khi trả HTML — hash không bao giờ được gửi lên server nên
 * middleware không thể đọc được nếu dùng hash. App vẫn chạy như SPA bình thường:
 * middleware tự fetch `/index.html` gốc rồi trả về, không cần cấu hình rewrite nào
 * trên hosting tĩnh.
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
const PATH_RE = /^\/c\/([a-z+#]+)\/(15|30|60)\/([a-z0-9-]+)\/(\d{1,3})$/i

function toChallenge(match: RegExpMatchArray): Challenge {
  return {
    language: match[1] as SnippetLanguage,
    timeLimit: Number(match[2]),
    snippetId: match[3],
    target: Number(match[4]),
  }
}

/** Đọc link thách đấu dạng cũ (`#/c/...`) — giữ lại để link ai đó copy trước khi đổi sang path vẫn mở được. */
export function readChallengeFromHash(): Challenge | null {
  const match = window.location.hash.match(HASH_RE)
  return match ? toChallenge(match) : null
}

/** Đọc link thách đấu dạng path (`/c/...`), đọc được từ cả server lẫn client. */
export function readChallengeFromPath(): Challenge | null {
  const match = window.location.pathname.match(PATH_RE)
  return match ? toChallenge(match) : null
}

export function buildChallengeUrl(challenge: Challenge): string {
  const { language, timeLimit, snippetId, target } = challenge
  return `${window.location.origin}/c/${language}/${timeLimit}/${snippetId}/${target}`
}

/**
 * Xoá path/hash sau khi đã áp dụng. Không xoá thì bấm "next snippet" xong reload lại
 * là quay về bài thách đấu cũ, tưởng app hỏng.
 */
export function clearChallengeUrl(): void {
  window.history.replaceState(null, '', '/')
}
