import { readFileSync } from 'node:fs'

/**
 * Nộp toàn bộ URL cho IndexNow — Bing, Yandex, Seznam, Naver dùng chung giao thức này.
 *
 * Vì sao cần: Google chỉ có Search Console (bấm tay), nhưng Bing/Yandex thì nhận URL qua
 * API và lập chỉ mục trong vòng vài phút tới vài giờ thay vì chờ bò tới. Với một domain
 * mới chưa có backlink nào, chờ bò tới có nghĩa là chờ hàng tuần.
 *
 * CÁCH CHẠY (sau khi đã deploy, không phải trước):
 *   node scripts/ping-indexnow.mjs
 *
 * Phải deploy trước vì IndexNow tự vào lấy https://<site>/<key>.txt để xác minh mình có
 * quyền với domain — file khoá chưa lên thì nó trả 403 và bỏ toàn bộ lượt nộp.
 */

const KEY = '7b6c330454dc0927518d754733000367'
const HOST = 'www.typre.dev'
const ENDPOINT = 'https://api.indexnow.org/indexnow'

/**
 * Lấy URL từ sitemap đã build, KHÔNG viết cứng danh sách.
 *
 * Thêm ngôn ngữ mới là sitemap tự có thêm URL và script này nộp luôn. Viết cứng thì chắc
 * chắn có ngày nộp thiếu trang mới mà không ai biết.
 */
function readUrls() {
  const xml = readFileSync('dist/sitemap.xml', 'utf8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

async function main() {
  const urlList = readUrls()

  if (urlList.length === 0) {
    console.error('khong doc duoc URL nao tu dist/sitemap.xml — chay `npm run build` truoc')
    process.exit(1)
  }

  console.log(`nop ${urlList.length} URL cho IndexNow...`)

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  })

  const body = await res.text()

  /**
   * 200 = nhận rồi. 202 = nhận nhưng khoá chưa xác minh xong (bình thường ở lần đầu).
   * 403 = không đọc được file khoá — gần như luôn là chưa deploy.
   * 422 = URL không thuộc host đã khai.
   * 429 = nộp quá nhiều lần; đừng chạy lại liên tục, IndexNow không cần nộp lại khi nội
   * dung không đổi.
   */
  console.log(`HTTP ${res.status}${body ? ` — ${body}` : ''}`)

  if (res.status === 403) {
    console.error(`kiem lai: https://${HOST}/${KEY}.txt phai tra ve dung chuoi khoa`)
  }

  process.exit(res.ok || res.status === 202 ? 0 : 1)
}

main()
