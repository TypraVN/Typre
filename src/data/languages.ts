/**
 * Danh sách ngôn ngữ và mốc thời gian của app.
 *
 * Để riêng khỏi `App.tsx` chứ không xuất từ đó: file vừa xuất component vừa xuất hằng số
 * thì React Fast Refresh tắt cho cả file — sửa một dòng JSX là mất trạng thái đang gõ dở
 * và phải bắt đầu lại. Đây là lý do lint cảnh báo `only-export-components`, và tách ra là
 * cách sửa đúng chứ không phải tắt cảnh báo.
 */

import type { SnippetLanguage } from './types'

/** Thứ tự ở đây là thứ tự nút hiện trên giao diện. */
export const LANGUAGES: SnippetLanguage[] = [
  'javascript',
  'typescript',
  'csharp',
  'python',
  'java',
  'go',
  'sql',
  'bash',
  'cpp',
  'rust',
  'html',
  'css',
  'json',
  'text',
]

/**
 * Slug trang /practice/ của từng ngôn ngữ.
 *
 * Gần như trùng với id, TRỪ `text` — trang của nó nhắm từ khoá "special characters" chứ
 * không ai tìm "text typing practice". Chính cái ngoại lệ đó là lý do phải có bảng này:
 * chân trang mà tự suy slug từ id sẽ trỏ vào /practice/text/ và ra 404 lặng lẽ.
 *
 * Nguồn thật của các slug là `scripts/seo-pages-content.mjs` (nó sinh ra file HTML).
 * `scripts/seo-links.test.mts` đối chiếu hai bên, nên lệch nhau là test đỏ chứ không phải
 * người dùng bấm mới biết.
 */
export const PRACTICE_SLUG: Record<SnippetLanguage, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  csharp: 'csharp',
  python: 'python',
  java: 'java',
  go: 'go',
  sql: 'sql',
  bash: 'bash',
  cpp: 'cpp',
  rust: 'rust',
  html: 'html',
  css: 'css',
  json: 'json',
  text: 'special-characters',
}

/**
 * Ba mốc thời gian.
 *
 * Đổi bộ này thì phải sửa ĐỒNG BỘ cả `check (time_limit in ...)` trong
 * `supabase/schema.sql` và chạy `alter table` trên database đang chạy — không sửa là
 * Supabase từ chối điểm ở mốc mới trong khi giao diện vẫn chạy bình thường.
 */
export const TIME_LIMITS = [15, 30, 60] as const

export const DEFAULT_TIME_LIMIT = TIME_LIMITS[1]
