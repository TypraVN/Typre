/**
 * Chốt hai danh sách slug trang /practice/ phải khớp nhau.
 *
 * Slug tồn tại ở hai nơi vì hai nơi đó chạy ở hai thời điểm khác nhau: `seo-pages-content`
 * sinh file HTML lúc build, còn `PRACTICE_SLUG` là thứ chân trang React dùng lúc chạy.
 * Không gộp được — script build là .mjs của Node, chân trang nằm trong bundle của trình
 * duyệt.
 *
 * Lệch nhau thì hỏng một chiều rất khó thấy: chân trang trỏ tới một URL không được sinh
 * ra, người dùng bấm vào ăn 404, mà build vẫn xanh và không ai báo. Thêm một ngôn ngữ mà
 * quên một bên là dính ngay.
 */
import { LANGUAGE_PAGES } from './seo-pages-content.mjs'
import { LANGUAGES, PRACTICE_SLUG } from '../src/data/languages'

let failures = 0

function check(label: string, ok: boolean, detail?: string): void {
  if (ok) return
  failures++
  console.log(`  ${label}`)
  if (detail) console.log(`      ${detail}`)
}

const generated = new Map<string, string>(
  LANGUAGE_PAGES.map((page: { id: string; slug: string }) => [page.id, page.slug]),
)

for (const language of LANGUAGES) {
  const expected = generated.get(language)
  check(
    `${language}: phai co trang duoc sinh ra`,
    expected !== undefined,
    'seo-pages-content.mjs khong co muc nao voi id nay',
  )
  if (expected === undefined) continue

  check(
    `${language}: slug phai khop`,
    PRACTICE_SLUG[language] === expected,
    `PRACTICE_SLUG="${PRACTICE_SLUG[language]}" nhung trang sinh ra la "${expected}"`,
  )
}

// Chiều ngược lại: một trang được sinh ra mà chân trang không trỏ tới thì chỉ nằm trong
// sitemap, và không nhận được chút sức mạnh liên kết nào từ trang chủ.
for (const [id] of generated) {
  check(
    `${id}: trang sinh ra phai duoc chan trang tro toi`,
    (LANGUAGES as string[]).includes(id),
    'co trong seo-pages-content.mjs nhung khong co trong LANGUAGES',
  )
}

const total = LANGUAGES.length + generated.size
console.log(`${total - failures}/${total} ca dat`)
if (failures > 0) process.exit(1)
