/* eslint-disable no-undef */

/**
 * Service worker cho Typre. Mục tiêu: gõ được khi KHÔNG có mạng.
 *
 * Toàn bộ bài gõ nằm trong bundle nên chỉ cần cache file tĩnh là app chạy trọn vẹn
 * offline; chỉ bảng xếp hạng và đăng nhập là cần mạng, và hai thứ đó đã tự ẩn khi không
 * gọi được.
 *
 * Viết tay thay vì thêm plugin: chiến lược ở đây chỉ có hai nhánh, mà một plugin build
 * kéo theo cấu hình và bản sinh tự động khó soi khi có sự cố.
 */

// Đổi VERSION là xoá sạch cache của bản trước ở bước `activate`. v2: bản v1 có thể đã
// cache HTML fallback dưới URL của file .js (xem `isUsableAsset`) và bản vá không tự dọn
// được những entry đã hỏng đó.
const VERSION = 'typre-v2'
const ASSET_CACHE = `${VERSION}-assets`
const PAGE_CACHE = `${VERSION}-pages`

self.addEventListener('install', (event) => {
  // Không precache danh sách asset: tên file có hash và đổi mỗi lần build, viết cứng vào
  // đây là chắc chắn lệch. Cache dần theo lần dùng đầu tiên.
  event.waitUntil(caches.open(PAGE_CACHE).then((cache) => cache.add('/')))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Dọn cache của phiên bản cũ, không thì mỗi lần đổi VERSION lại tích thêm một bộ.
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

/** File trong /assets/ có hash trong tên nên nội dung là bất biến — cache là an toàn. */
function isHashedAsset(url) {
  return url.origin === self.location.origin && url.pathname.startsWith('/assets/')
}

/**
 * Chặn cache "200 nhưng sai nội dung".
 *
 * Hosting tĩnh SPA trả về index.html cho MỌI đường dẫn không tồn tại — kể cả
 * `/assets/Leaderboard-abc123.js` của bản deploy cũ đã bị xoá. Response đó là 200 nên
 * `res.ok` vẫn đúng, và cache-first sẽ giữ mẩu HTML ấy dưới tên file .js VĨNH VIỄN:
 * mọi lần import sau đều hỏng, reload cũng không cứu được vì service worker trả lại
 * đúng bản hỏng trong cache. Đã gặp thật khi test.
 */
function isUsableAsset(res) {
  return res.ok && !/text\/html/i.test(res.headers.get('content-type') ?? '')
}

/** Ảnh, font, favicon: đổi rất ít, cache được nhưng vẫn nên làm mới nền. */
function isStaticFile(url) {
  return (
    url.origin === self.location.origin &&
    /\.(svg|png|jpg|jpeg|webp|ico|woff2?|webmanifest|txt|xml)$/.test(url.pathname)
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Chỉ xử lý GET. POST/PATCH là gửi điểm lên Supabase — cache là sai hoàn toàn.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Mọi thứ khác origin (Supabase, Google Fonts) để mạng lo. Cache dữ liệu bảng xếp
  // hạng là còn tệ hơn không có: người dùng thấy điểm cũ mà tưởng là mới.
  if (url.origin !== self.location.origin) return

  if (isHashedAsset(url)) {
    // Cache-first: tên có hash nên bản đã cache không bao giờ cũ.
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            if (isUsableAsset(res)) {
              const copy = res.clone()
              caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy))
            }
            return res
          }),
      ),
    )
    return
  }

  if (isStaticFile(url)) {
    event.respondWith(
      caches.match(request).then((hit) => {
        const network = fetch(request)
          .then((res) => {
            if (isUsableAsset(res)) {
              const copy = res.clone()
              caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy))
            }
            return res
          })
          .catch(() => hit)

        return hit ?? network
      }),
    )
    return
  }

  /**
   * Trang HTML: network-first. Cache-first ở đây là mắc bản cũ mãi — deploy mới xong mà
   * người dùng vẫn chạy bản tuần trước, đúng cái bẫy `index.html` đã đặt no-cache trong
   * vercel.json để tránh.
   */
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(PAGE_CACHE).then((cache) => cache.put('/', copy))
        }
        return res
      })
      .catch(() =>
        // Mất mạng: trả bản đã cache. App là SPA dùng hash routing nên mọi đường dẫn đều
        // là cùng một `/`.
        caches.match('/').then((hit) => hit ?? new Response('offline', { status: 503 })),
      ),
  )
})
