/**
 * Vá lại thẻ meta trong `index.html` cho đúng một loại URL: link thách đấu
 * (`/c/<language>/<time>/<snippetId>/<wpm>`). Bot unfurl link của Twitter/X, LinkedIn,
 * Discord, Slack không chạy JavaScript — chúng chỉ đọc HTML gốc — nên muốn ảnh/preview
 * đổi theo từng điểm số thật thì phải vá ngay ở tầng này, JS phía client vá quá trễ.
 *
 * Middleware tự fetch `/index.html` (bản đã build, đúng asset đã hash) rồi trả thẳng —
 * không cần thêm rewrite nào trong vercel.json, giữ đúng nguyên tắc "hosting tĩnh
 * không cần cấu hình route" của phần còn lại trong app (xem `src/lib/challenge.ts`).
 *
 * `noindex`: URL này là một trong vô số tổ hợp ngôn ngữ/điểm số, không phải nội dung
 * thật — không để Google index nó, tất cả nội dung thật đều quy về "/" (canonical đã
 * sẵn có trong index.html).
 */
export const config = {
  matcher: '/c/:path*',
}

const CHALLENGE_RE = /^\/c\/([a-z0-9+#]+)\/(15|30|60)\/([a-z0-9-]+)\/(\d{1,3})$/i

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  )
}

function replaceMetaTag(html: string, attr: 'property' | 'name', key: string, content: string): string {
  const re = new RegExp(`<meta\\s+[^>]*${attr}=["']${key}["'][^>]*>`, 'i')
  return html.replace(re, `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`)
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const match = url.pathname.match(CHALLENGE_RE)
  if (!match) return fetch(request)

  const [, language, , , wpmRaw] = match
  const wpm = wpmRaw.replace(/^0+(?=\d)/, '')

  const origin = await fetch(new URL('/index.html', url))
  if (!origin.ok) return origin
  let html = await origin.text()

  // Ảnh preview CỐ Ý không đổi theo điểm số: từng thử qua `@vercel/og` (vẽ ảnh động lúc
  // chạy) nhưng thư viện đó chỉ chạy sạch trên Edge, mà Vercel gộp CHUNG một bundle
  // tương thích cho mọi Edge Function trong dự án (kể cả middleware này) — chỉ cần
  // route đó tồn tại, dù không hề được import, là middleware bị kéo theo lỗi "referencing
  // unsupported modules" và không deploy được. Bản Node.js của thư viện thì tự vỡ vì
  // dependency của nó (harfbuzzjs) gọi `require('fs')` bên trong ngữ cảnh ES module. Giữ
  // lại phần có giá trị nhất — tiêu đề/mô tả đúng điểm số thật — và để ảnh dùng chung
  // `og.png` tĩnh sẵn có, không sinh ảnh riêng theo từng lời thách đấu.
  const title = `${wpm} WPM in ${language} — beat this score on Typre`
  const description = `Can you beat ${wpm} WPM typing real ${language} code? Try the challenge on Typre, a free typing trainer for programmers.`

  html = replaceMetaTag(html, 'property', 'og:title', title)
  html = replaceMetaTag(html, 'property', 'og:description', description)
  html = replaceMetaTag(html, 'name', 'twitter:title', title)
  html = replaceMetaTag(html, 'name', 'twitter:description', description)
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
  html = html.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>')

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
