import { allSnippets } from '../data/snippets'
import type { Snippet, SnippetLanguage } from '../data/types'

/**
 * Bài luyện riêng, ghép từ DÒNG CODE THẬT trong kho chứ không phải chuỗi ký hiệu rời.
 *
 * Gõ `{ } [ ] => ::` đứng một mình không giống lúc viết code: cái khó là chuyển từ chữ
 * sang ký hiệu rồi về chữ (`items.map((x) => x.id)`). Lấy dòng từ kho của đúng ngôn ngữ
 * đang chọn thì mỗi ngôn ngữ tự có cụm khó của nó — Rust ra `::` và `->`, JS ra `=>` và
 * `?.` — mà không phải viết tay danh sách nào.
 *
 *   - `symbols`: các dòng dày ký hiệu nhất.
 *   - `weak`: các dòng chứa đúng những phím người dùng vừa gõ sai nhiều nhất.
 */
export type DrillSpec = { kind: 'symbols' } | { kind: 'weak'; chars: string[] }

const DRILL_ID_PREFIX = 'drill-'

export function isDrillSnippet(snippet: Snippet): boolean {
  return snippet.id.startsWith(DRILL_ID_PREFIX)
}

/**
 * Độ dài bài theo mốc thời gian, cùng thước với kho bài (~200 ký tự/phút ở 40 wpm).
 * Bài luyện ký hiệu gõ chậm hơn code thường nên lấy hơi ngắn hơn rổ tương ứng.
 */
function targetChars(timeLimit: number): number {
  if (timeLimit >= 60) return 240
  if (timeLimit >= 30) return 120
  return 55
}

/** Dòng quá ngắn thì toàn `}` với `);`, quá dài thì tràn khung trên điện thoại. */
const MIN_LINE = 8
const MAX_LINE = 60

const linesCache = new Map<SnippetLanguage, string[]>()

/** Mọi dòng khác nhau của một ngôn ngữ, đã bỏ thụt lề (dòng luyện đứng riêng, không lồng). */
function linesFor(language: SnippetLanguage): string[] {
  const cached = linesCache.get(language)
  if (cached) return cached

  const unique = new Set<string>()
  for (const entry of allSnippets()) {
    if (entry.language !== language) continue
    for (const raw of entry.snippet.code.split('\n')) {
      const line = raw.trim()
      if (line.length >= MIN_LINE && line.length <= MAX_LINE) unique.add(line)
    }
  }

  const lines = [...unique]
  linesCache.set(language, lines)
  return lines
}

/** Ký tự không phải chữ, số, `_` hay khoảng trắng — tức những phím phải với tay ra xa. */
function symbolCount(line: string): number {
  let count = 0
  for (const ch of line) {
    if (/[^\w\s]/.test(ch)) count += 1
  }
  return count
}

function shuffled<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Lấy dòng theo thứ tự cho tới khi đủ độ dài — ít nhất 2 dòng để có lần xuống dòng. */
function assemble(candidates: string[], limit: number): string {
  const picked: string[] = []
  let total = 0

  for (const line of candidates) {
    if (total >= limit && picked.length >= 2) break
    picked.push(line)
    total += line.length + 1
  }

  return picked.join('\n')
}

function symbolCandidates(lines: string[]): string[] {
  // Dày ký hiệu: ít nhất 4 ký hiệu VÀ chiếm ≥ 1/4 dòng. Ngôn ngữ ít ký hiệu (SQL, text)
  // không đủ dòng như vậy thì nới dần, thà luyện dòng nhạt hơn còn hơn bài rỗng.
  const dense = lines.filter((line) => symbolCount(line) >= 4 && symbolCount(line) / line.length >= 0.25)
  if (dense.length >= 12) return shuffled(dense)

  return shuffled(lines.filter((line) => symbolCount(line) >= 2))
}

function weakCandidates(lines: string[], chars: string[]): string[] {
  const hits = (line: string) => {
    let count = 0
    for (const ch of line) if (chars.includes(ch)) count += 1
    return count
  }

  // Dòng có phím yếu xuất hiện nhiều lần lên trước — một dòng `{ { } }` luyện được
  // nhiều hơn bốn dòng mỗi dòng một dấu `{`.
  const rich = lines.filter((line) => hits(line) >= 2)
  const some = lines.filter((line) => hits(line) === 1)
  return [...shuffled(rich), ...shuffled(some)]
}

let drillSeq = 0

/**
 * Sinh một bài luyện mới. Mỗi lần gọi ra id mới để khung gõ dựng lại từ đầu, kể cả khi
 * vô tình ra đúng nội dung cũ.
 */
export function buildDrill(spec: DrillSpec, language: SnippetLanguage, timeLimit: number): Snippet {
  const lines = linesFor(language)
  const candidates = spec.kind === 'symbols' ? symbolCandidates(lines) : weakCandidates(lines, spec.chars)

  // Phím yếu không có trong ngôn ngữ này (đổi từ JS sang SQL mà phím yếu là `=>`)
  // thì luyện ký hiệu chung, không trả bài rỗng.
  const code = assemble(candidates.length > 0 ? candidates : symbolCandidates(lines), targetChars(timeLimit))

  drillSeq += 1
  return { id: `${DRILL_ID_PREFIX}${spec.kind}-${drillSeq}`, language, code }
}

/**
 * Phím đáng luyện từ thống kê lỗi của một lượt: tối đa 3 phím sai nhiều nhất. Bỏ khoảng
 * trắng và xuống dòng — sai mấy phím đó là do nhịp tay, không luyện bằng cách gõ thêm
 * dòng có dấu cách được.
 */
export function drillableChars(mistakeCounts: Record<string, number>): string[] {
  return Object.entries(mistakeCounts)
    .filter(([ch]) => ch.length === 1 && ch.trim() !== '')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ch]) => ch)
}
