import type { Snippet, SnippetLanguage } from '../types'
import { drawFromBag } from '../../lib/shuffle'
import { loadBagIds, saveBagIds } from '../../lib/bagStore'
import { javascriptSnippets } from './javascript'
import { typescriptSnippets } from './typescript'
import { csharpSnippets } from './csharp'
import { pythonSnippets } from './python'
import { javaSnippets } from './java'
import { goSnippets } from './go'
import { sqlSnippets } from './sql'
import { bashSnippets } from './bash'
import { cppSnippets } from './cpp'
import { rustSnippets } from './rust'
import { htmlSnippets } from './html'
import { cssSnippets } from './css'
import { jsonSnippets } from './json'
import { specialCharSnippets } from './specialChars'
// Bài khai báo hàng loạt (mục tiêu ~50 bài/ngôn ngữ) để riêng: file viết tay giữ nguyên,
// thêm bao nhiêu cũng không đụng vào phần đã có.
import { javascriptBulk } from './bulk/javascript'
import { typescriptBulk } from './bulk/typescript'
import { pythonBulk } from './bulk/python'
import { csharpBulk } from './bulk/csharp'
import { javaBulk } from './bulk/java'
import { goBulk } from './bulk/go'
import { sqlBulk } from './bulk/sql'
import { bashBulk } from './bulk/bash'
import { cppBulk } from './bulk/cpp'
import { rustBulk } from './bulk/rust'
import { htmlBulk } from './bulk/html'
import { cssBulk } from './bulk/css'
import { jsonBulk } from './bulk/json'
import { textBulk } from './bulk/text'
// Bài TRUNG BÌNH (~90-180 ký tự) dành cho mốc 30s.
import { javascriptMedium } from './medium/javascript'
import { typescriptMedium } from './medium/typescript'
import { pythonMedium } from './medium/python'
import { csharpMedium } from './medium/csharp'
import { javaMedium } from './medium/java'
import { goMedium } from './medium/go'
import { sqlMedium } from './medium/sql'
import { cppMedium } from './medium/cpp'
import { rustMedium } from './medium/rust'
import { bashMedium } from './medium/bash'
import { htmlMedium } from './medium/html'
import { cssMedium } from './medium/css'
import { jsonMedium } from './medium/json'
import { textMedium } from './medium/text'
// Bài DÀI (~10-14 dòng) dành riêng cho mốc 60s.
import { javascriptLong } from './long/javascript'
import { typescriptLong } from './long/typescript'
import { pythonLong } from './long/python'
import { csharpLong } from './long/csharp'
import { javaLong } from './long/java'
import { goLong } from './long/go'
import { sqlLong } from './long/sql'
import { cppLong } from './long/cpp'
import { rustLong } from './long/rust'
import { bashLong } from './long/bash'
import { htmlLong } from './long/html'
import { cssLong } from './long/css'
import { jsonLong } from './long/json'
import { textLong } from './long/text'

export const SNIPPETS: Record<SnippetLanguage, Snippet[]> = {
  javascript: [...javascriptSnippets, ...javascriptBulk],
  typescript: [...typescriptSnippets, ...typescriptBulk],
  csharp: [...csharpSnippets, ...csharpBulk],
  python: [...pythonSnippets, ...pythonBulk],
  java: [...javaSnippets, ...javaBulk],
  go: [...goSnippets, ...goBulk],
  sql: [...sqlSnippets, ...sqlBulk],
  bash: [...bashSnippets, ...bashBulk],
  cpp: [...cppSnippets, ...cppBulk],
  rust: [...rustSnippets, ...rustBulk],
  html: [...htmlSnippets, ...htmlBulk],
  css: [...cssSnippets, ...cssBulk],
  json: [...jsonSnippets, ...jsonBulk],
  text: [...specialCharSnippets, ...textBulk],
}

/**
 * "Túi trộn" cho từng ngôn ngữ: trộn cả danh sách rồi rút lần lượt, hết túi mới trộn
 * lại. Nhờ vậy người gõ liên tục sẽ đi qua HẾT các bài trước khi gặp lại bài nào —
 * random thuần (kể cả có loại bài vừa gõ) vẫn có thể ra một bài ba lần trong khi vài
 * bài khác chưa hiện lần nào.
 *
 * Giữ ở module scope (không phải state trong React) để việc đổi ngôn ngữ qua lại,
 * hay component remount, không làm mất tiến độ của túi.
 */
/**
 * Chia bài theo mốc thời gian. Người gõ ~40 wpm đi được khoảng 200 ký tự mỗi phút,
 * nên 15s ≈ 50 ký tự, 30s ≈ 100, 60s ≈ 200+. Trước đây 15s và 30s rút CHUNG một túi
 * mà trung vị cả kho chỉ 45 ký tự, nên mốc 30s toàn ra bài gõ 5 giây là xong.
 */
const SHORT_MAX_CHARS = 70
const MEDIUM_MAX_CHARS = 200

/**
 * Bài dài viết riêng cho mốc 60s. Ngôn ngữ nào chưa có thì KHÔNG có key ở đây và
 * `poolFor` tự rơi xuống bộ ngắn hơn — thiếu dữ liệu thì mất hay, chứ không vỡ app.
 */
const LONG_SNIPPETS: Partial<Record<SnippetLanguage, Snippet[]>> = {
  javascript: javascriptLong,
  typescript: typescriptLong,
  python: pythonLong,
  csharp: csharpLong,
  java: javaLong,
  go: goLong,
  sql: sqlLong,
  cpp: cppLong,
  rust: rustLong,
  bash: bashLong,
  html: htmlLong,
  css: cssLong,
  json: jsonLong,
  text: textLong,
}

/** Bài trung bình viết riêng cho mốc 30s, gộp thêm với bài dài sẵn có trong kho. */
const MEDIUM_SNIPPETS: Partial<Record<SnippetLanguage, Snippet[]>> = {
  javascript: javascriptMedium,
  typescript: typescriptMedium,
  python: pythonMedium,
  csharp: csharpMedium,
  java: javaMedium,
  go: goMedium,
  sql: sqlMedium,
  cpp: cppMedium,
  rust: rustMedium,
  bash: bashMedium,
  html: htmlMedium,
  css: cssMedium,
  json: jsonMedium,
  text: textMedium,
}

type Bucket = 'short' | 'medium' | 'long'

/** Mỗi ngôn ngữ ba rổ, chia sẵn một lần lúc nạp module. */
const POOLS: Record<SnippetLanguage, Record<Bucket, Snippet[]>> = Object.fromEntries(
  (Object.keys(SNIPPETS) as SnippetLanguage[]).map((lang) => {
    const all = SNIPPETS[lang]
    return [
      lang,
      {
        short: all.filter((s) => s.code.length <= SHORT_MAX_CHARS),
        medium: [
          ...(MEDIUM_SNIPPETS[lang] ?? []),
          // Bài sẵn có mà đủ dài cũng gom vào rổ 30s, khỏi phải viết lại.
          ...all.filter(
            (s) => s.code.length > SHORT_MAX_CHARS && s.code.length <= MEDIUM_MAX_CHARS,
          ),
        ],
        long: LONG_SNIPPETS[lang] ?? [],
      },
    ]
  }),
) as Record<SnippetLanguage, Record<Bucket, Snippet[]>>

/**
 * Số bài của một ngôn ngữ theo từng rổ.
 *
 * Dùng cho các trang giới thiệu từng ngôn ngữ (`scripts/generate-seo-pages.mjs`): số
 * phải LẤY TỪ ĐÂY chứ không viết cứng vào trang, không thì thêm bài xong là trang quảng
 * cáo một con số sai — vừa mất uy tín vừa không ai biết để sửa.
 */
/**
 * MỌI snippet trong kho, cả ba rổ, không trùng lặp.
 *
 * `SNIPPETS` chỉ chứa bài viết tay + bài bổ sung; rổ 30s và 60s nằm ở `MEDIUM_SNIPPETS`
 * và `LONG_SNIPPETS`. Bộ quét chất lượng dữ liệu phải thấy HẾT — bản quét đầu của tôi
 * dùng `SNIPPETS` và chỉ chạm được 955 trong 2.590 bài, tức bỏ sót hai phần ba kho.
 */
export function allSnippets(): Array<{ language: SnippetLanguage; snippet: Snippet }> {
  const out: Array<{ language: SnippetLanguage; snippet: Snippet }> = []
  const seen = new Set<string>()

  for (const language of Object.keys(POOLS) as SnippetLanguage[]) {
    const pools = POOLS[language]

    for (const snippet of [...pools.short, ...pools.medium, ...pools.long]) {
      // Bài đủ dài trong `SNIPPETS` được gom vào cả rổ 30s, nên phải lọc trùng.
      const key = `${language}|${snippet.id}`
      if (seen.has(key)) continue

      seen.add(key)
      out.push({ language, snippet })
    }
  }

  return out
}

export function snippetCounts(language: SnippetLanguage): {
  short: number
  medium: number
  long: number
  total: number
} {
  const pools = POOLS[language]
  const short = pools.short.length
  const medium = pools.medium.length
  const long = pools.long.length

  return { short, medium, long, total: short + medium + long }
}

/**
 * Vài bài mẫu của một ngôn ngữ, để trang giới thiệu cho người ta xem sẽ phải gõ gì.
 *
 * CỐ Ý lấy theo thứ tự cố định chứ không ngẫu nhiên: trang tĩnh sinh lại ở mỗi lần build,
 * mà nội dung đổi mỗi lần build thì con bot thấy một trang không ổn định — và mình cũng
 * không bao giờ biết trang thật đang hiện bài nào.
 */
export function sampleSnippets(language: SnippetLanguage, count: number): string[] {
  const pools = POOLS[language]
  const source = pools.short.length > 0 ? pools.short : SNIPPETS[language]

  return source.slice(0, count).map((snippet) => snippet.code)
}

/** Rổ mong muốn theo mốc thời gian; rổ rỗng thì lùi dần về rổ có bài. */
function poolFor(language: SnippetLanguage, timeLimit: number): { key: string; items: Snippet[] } {
  const pools = POOLS[language]
  const wanted: Bucket[] =
    timeLimit >= 60 ? ['long', 'medium', 'short'] : timeLimit >= 30 ? ['medium', 'short'] : ['short']

  for (const bucket of wanted) {
    if (pools[bucket].length > 0) return { key: `${language}-${bucket}`, items: pools[bucket] }
  }
  return { key: `${language}-all`, items: SNIPPETS[language] }
}

/**
 * Mỗi rổ một TÚI RIÊNG (khoá theo `language-bucket`): dùng chung túi thì đổi qua lại
 * 15s/60s sẽ làm rối thứ tự và sinh ra lặp bài sớm.
 */
const bags: Record<string, Snippet[]> = {}

/**
 * Tra bài theo id trên CẢ BA rổ. Cần cho link thách đấu: link chỉ mang theo id, mà bài
 * dài/vừa không nằm trong `SNIPPETS` nên tìm ở đó thôi là trượt.
 */
const BY_ID: Map<string, Snippet> = new Map(
  (Object.keys(POOLS) as SnippetLanguage[])
    .flatMap((lang) => [...POOLS[lang].short, ...POOLS[lang].medium, ...POOLS[lang].long])
    .map((s) => [s.id, s]),
)

export function getSnippetById(id: string): Snippet | undefined {
  return BY_ID.get(id)
}

/** Rổ nào đã đọc localStorage rồi — chỉ hydrate một lần cho mỗi rổ. */
const hydrated = new Set<string>()

export function getRandomSnippet(
  language: SnippetLanguage,
  excludeId?: string,
  timeLimit = 30,
): Snippet {
  const { key, items } = poolFor(language, timeLimit)
  const bag = (bags[key] ??= [])

  if (!hydrated.has(key)) {
    hydrated.add(key)
    const savedIds = loadBagIds(key)

    if (savedIds !== null) {
      const byId = new Map(items.map((snippet) => [snippet.id, snippet]))
      // Bỏ id lạ: kho bài có thể đã thêm/xoá giữa hai lần mở app, và id cũ không còn
      // tồn tại thì không được đẩy `undefined` vào túi.
      for (const id of savedIds) {
        const snippet = byId.get(id)
        if (snippet !== undefined) bag.push(snippet)
      }
    }
  }

  const picked = drawFromBag(bag, items, excludeId)
  saveBagIds(
    key,
    bag.map((snippet) => snippet.id),
  )

  return picked
}
