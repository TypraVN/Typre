import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { build } from 'vite'
import { LANGUAGE_PAGES } from './seo-pages-content.mjs'

/**
 * Sinh 14 trang tĩnh giới thiệu từng ngôn ngữ, chạy SAU `vite build`.
 *
 * Vì sao cần: app là SPA một địa chỉ duy nhất, nên cả site chỉ có MỘT URL để xếp hạng.
 * Không ai search "Typre" — họ search "python typing practice", "java typing test". Mỗi
 * ngôn ngữ một trang thật là 14 cửa vào thay vì 1, mỗi cửa nhắm một từ khoá cụ thể ít
 * cạnh tranh hơn hẳn từ khoá chung.
 *
 * Đây là trang TĨNH, không phải route của SPA: bot đọc được ngay mà không cần chạy
 * JavaScript, và không phải thêm rewrite nào trên Vercel.
 */

const SITE = 'https://www.typre.dev'
const DIST = 'dist'
const TMP_DIR = 'node_modules/.typre-seo'

/**
 * Nạp dữ liệu bài để lấy SỐ THẬT.
 *
 * Node không import trực tiếp file .ts được, nên nhờ chính Vite dịch một lần ra ESM tạm.
 * Cách này thay vì tự đếm bằng regex trên file dữ liệu: đếm bằng regex là sai ngay khi
 * cấu trúc file đổi, mà sai thì không ai phát hiện — trang vẫn build ra, chỉ là con số
 * quảng cáo bị lệch.
 */
async function loadSnippetCounts() {
  await build({
    logLevel: 'error',
    // Không có dòng này thì Vite copy cả public/ vào thư mục tạm rồi ta xoá đi — vô ích,
    // và một lần lỡ trỏ TMP_DIR sai chỗ là mất luôn thư mục thật.
    publicDir: false,
    build: {
      lib: {
        entry: 'src/data/snippets/index.ts',
        formats: ['es'],
        // Trả tên đầy đủ thay vì để Vite tự thêm đuôi: đuôi nó chọn (.js hay .mjs) phụ
        // thuộc `type` trong package.json, đổi cái đó là script này đứt.
        fileName: () => 'snippets.mjs',
      },
      outDir: TMP_DIR,
      emptyOutDir: true,
      minify: false,
    },
  })

  const mod = await import(`../${TMP_DIR}/snippets.mjs?t=${Date.now()}`)
  return { snippetCounts: mod.snippetCounts, sampleSnippets: mod.sampleSnippets }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Đổi `code` trong nội dung thành <code>. Nội dung do mình viết nên không cần parser. */
function inlineCode(text) {
  return escapeHtml(text).replace(/`([^`]+)`/g, '<code>$1</code>')
}

/**
 * CSS nhúng thẳng vào trang.
 *
 * Không dùng lại bundle CSS của app: tên file có hash đổi mỗi lần build, và các trang này
 * chỉ cần vài chục dòng. Nhúng vào là trang hiện đúng ngay ở lần tải đầu, không nhấp
 * trắng — quan trọng vì đây thường là lần đầu người ta thấy Typre.
 */
const STYLES = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #18181b;
    color: #d4d4d8;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    line-height: 1.7;
    font-size: 16px;
  }
  .bar { height: 5px; background: #f97316; }
  .wrap { max-width: 720px; margin: 0 auto; padding: 40px 24px 72px; }
  header { display: flex; align-items: center; gap: 14px; margin-bottom: 48px; }
  header svg { width: 40px; height: 40px; flex-shrink: 0; }
  header a { color: #fafafa; font-size: 24px; font-weight: 700; text-decoration: none; }
  h1 { color: #fafafa; font-size: 30px; line-height: 1.3; margin: 0 0 12px; }
  h2 { color: #fafafa; font-size: 19px; margin: 40px 0 10px; }
  p { margin: 0 0 16px; }
  code {
    background: #09090b;
    color: #fdba74;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: #09090b;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 14px 16px;
    margin: 0 0 12px;
    overflow-x: auto;
    font-size: 14px;
    line-height: 1.6;
  }
  pre code { background: none; color: #d4d4d8; padding: 0; font-size: inherit; }
  /*
    Lưới tự co thay vì flex-wrap: trên màn 375px, flex-wrap cho 4 ô xếp DỌC thành 4 hàng
    và đẩy nút bấm xuống dưới đáy màn hình — người từ Google vào bằng điện thoại không
    thấy nút nào. Đã đo: nút ở 823px trong khi màn cao 812px.
  */
  .counts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin: 24px 0 8px;
    padding: 0;
    list-style: none;
  }
  .counts li {
    border: 1px solid #3f3f46;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    color: #a1a1aa;
  }
  .counts strong { color: #f97316; font-size: 20px; display: block; }
  .cta {
    display: inline-block;
    margin: 28px 0 8px;
    padding: 13px 26px;
    background: #f97316;
    color: #18181b;
    font-weight: 700;
    text-decoration: none;
    border-radius: 8px;
  }
  .cta:hover { background: #fb923c; }
  .others { margin: 40px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 8px; }
  .others a {
    display: inline-block;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    padding: 5px 12px;
    color: #a1a1aa;
    text-decoration: none;
    font-size: 14px;
  }
  .others a:hover { border-color: #f97316; color: #f97316; }
  footer { margin-top: 56px; padding-top: 24px; border-top: 1px solid #27272a; font-size: 14px; color: #71717a; }
  footer a { color: #f97316; }
`

const LOGO_SVG = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#000"/><rect x="8" y="8" width="16" height="3" rx="1.5" fill="#f97316"/><rect x="8" y="14" width="11" height="3" rx="1.5" fill="#fdba74"/><rect x="8" y="20" width="7" height="3" rx="1.5" fill="#f97316"/></svg>`

function renderPage(page, counts, samples, siblings) {
  const url = `${SITE}/practice/${page.slug}/`
  const title = `${page.keyword} — ${page.titleTail ?? `type real ${page.label} code`} | Typre`

  const intro =
    page.intro ??
    `Typre is a free typing trainer for programmers. Instead of prose, you type real ${page.label} — brackets, operators and indentation included — and it measures WPM, accuracy, raw speed and consistency on every run.`

  // Dưới ~155 ký tự: dài hơn là Google cắt giữa câu trong kết quả tìm kiếm.
  const description = `Practice typing real ${page.label} code: ${counts.total} snippets, 15/30/60 second runs, WPM and accuracy tracking. Free, no account needed.`

  const siblingLinks = siblings
    .map((s) => `<li><a href="/practice/${s.slug}/">${escapeHtml(s.label)}</a></li>`)
    .join('\n        ')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#18181b" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Typre" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- Breadcrumb giúp kết quả tìm kiếm hiện đường dẫn thay vì URL thô. -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Typre", "item": "${SITE}/" },
          { "@type": "ListItem", "position": 2, "name": ${JSON.stringify(page.keyword)}, "item": "${url}" }
        ]
      }
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <style>${STYLES}</style>
  </head>
  <body>
    <div class="bar"></div>
    <div class="wrap">
      <header>
        ${LOGO_SVG}
        <a href="/">Typre</a>
      </header>

      <main>
        <h1>${escapeHtml(page.keyword)}</h1>
        <p>${escapeHtml(intro)}</p>

        <ul class="counts">
          <li><strong>${counts.total}</strong>${escapeHtml(page.label)} snippets</li>
          <li><strong>${counts.short}</strong>for 15 second runs</li>
          <li><strong>${counts.medium}</strong>for 30 second runs</li>
          <li><strong>${counts.long}</strong>for 60 second runs</li>
        </ul>

        <a class="cta" href="/?lang=${page.id}">Start typing ${escapeHtml(page.label)}</a>

        <h2>What slows you down in ${escapeHtml(page.label)}</h2>
        <p>${inlineCode(page.hard)}</p>

        <h2>What the snippets cover</h2>
        <p>${inlineCode(page.covers)}</p>

        <h2>Snippets you will actually type</h2>
        <p>Three of the ${counts.short} short ${escapeHtml(page.label)} snippets, exactly as they appear in the app:</p>
        ${samples.map((code) => `<pre><code>${escapeHtml(code)}</code></pre>`).join('\n        ')}

        <h2>How it works</h2>
        <p>
          Pick 15, 30 or 60 seconds. Snippets are served in shuffled order, so you never
          repeat one before finishing a full round — even across page reloads. Sign in to put
          scores on the leaderboard, race a friend on the same snippet in real time, or paste
          code from your own project. None of it is required: open the page and start typing.
        </p>

        <h2>Other languages</h2>
        <ul class="others">
        ${siblingLinks}
        </ul>
      </main>

      <footer>
        <a href="/">Typre</a> — typing practice for programmers. 14 languages, free, works
        offline.
      </footer>
    </div>
  </body>
</html>
`
}

/**
 * Trang hub /practice/ — một chỗ liệt kê cả 14 trang.
 *
 * Không phải để xếp hạng cho từ khoá nào cụ thể, mà để con bot có một trang duy nhất dẫn
 * tới toàn bộ: bò vào đây là thấy hết, không phải dò từng URL trong sitemap. Người dùng
 * gõ tay `/practice/` cũng không gặp lỗi 404.
 */
function renderHub(pages, countsFor) {
  const url = `${SITE}/practice/`
  const title = 'Typing practice by language — 14 languages | Typre'
  const description =
    'Practice typing real code in 14 languages: JavaScript, TypeScript, Python, C#, Java, Go, Rust, SQL, Bash and more. Free, no account needed.'

  const total = pages.reduce((sum, p) => sum + countsFor(p.id).total, 0)

  const cards = pages
    .map((p) => {
      const counts = countsFor(p.id)
      return `<li><a href="/practice/${p.slug}/"><strong>${escapeHtml(p.label)}</strong>${counts.total} snippets</a></li>`
    })
    .join('\n        ')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#18181b" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Typre" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <style>${STYLES}
      .grid { list-style: none; margin: 28px 0 0; padding: 0; display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); }
      .grid a { display: block; border: 1px solid #3f3f46; border-radius: 8px; padding: 14px 16px; color: #a1a1aa; text-decoration: none; font-size: 14px; }
      .grid a:hover { border-color: #f97316; }
      .grid strong { display: block; color: #fafafa; font-size: 17px; margin-bottom: 2px; }
      .grid a:hover strong { color: #f97316; }
    </style>
  </head>
  <body>
    <div class="bar"></div>
    <div class="wrap">
      <header>
        ${LOGO_SVG}
        <a href="/">Typre</a>
      </header>

      <main>
        <h1>Typing practice by language</h1>
        <p>
          ${total} code snippets across 14 languages. Pick one to see what it covers and what
          makes it awkward to type, or go straight to the app and start a run.
        </p>

        <a class="cta" href="/">Start typing</a>

        <ul class="grid">
        ${cards}
        </ul>
      </main>

      <footer>
        <a href="/">Typre</a> — typing practice for programmers. Free, works offline.
      </footer>
    </div>
  </body>
</html>
`
}

function renderSitemap(pages) {
  const urls = [
    `${SITE}/`,
    `${SITE}/practice/`,
    ...pages.map((p) => `${SITE}/practice/${p.slug}/`),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  SINH TỰ ĐỘNG bởi scripts/generate-seo-pages.mjs — đừng sửa tay.

  Thêm ngôn ngữ vào scripts/seo-pages-content.mjs là sitemap tự có thêm URL. Viết tay thì
  chắc chắn có ngày lệch với số trang thật, mà Search Console chỉ báo lỗi rất muộn.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc, i) => `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${i === 0 ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
}

/**
 * Thay nội dung giữa `<!--seo:name-->` và `<!--/seo:name-->`.
 *
 * NÉM LỖI khi không thấy dấu mốc, thay vì bỏ qua im lặng: ai đó sửa index.html mà xoá
 * mất dấu mốc thì build phải dừng ngay. Bỏ qua im lặng nghĩa là trang chủ lặng lẽ quay
 * về số viết cứng và không ai biết — đúng cái đã xảy ra với "2.170 snippets".
 */
function replaceRegion(html, name, replacement) {
  const open = `<!--seo:${name}-->`
  const close = `<!--/seo:${name}-->`
  const start = html.indexOf(open)
  const end = html.indexOf(close)

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`khong thay vung "${name}" trong index.html (can ${open} ... ${close})`)
  }

  return html.slice(0, start + open.length) + replacement + html.slice(end)
}

/**
 * Ghi lại số liệu thật và danh sách liên kết vào trang chủ đã build.
 *
 * Liên kết là phần quan trọng hơn: trước đây trang chủ không trỏ tới trang /practice/
 * nào, nên Google chỉ tìm ra chúng qua sitemap và chúng không nhận được chút sức mạnh
 * liên kết nào từ trang được trỏ tới nhiều nhất của site.
 */
function patchIndexHtml(snippetCounts) {
  const path = `${DIST}/index.html`
  let html = readFileSync(path, 'utf8')

  const pages = LANGUAGE_PAGES.filter((page) => snippetCounts(page.id).total > 0)
  const total = pages.reduce((sum, page) => sum + snippetCounts(page.id).total, 0)

  /**
   * Rổ ký tự đặc biệt KHÔNG phải một ngôn ngữ, phải tách riêng ở cả hai chỗ: liệt kê
   * chung thì câu thành "…JSON, special characters, and a special-characters drill", còn
   * ghép vào khuôn liên kết thì ra "Practice typing special characters code".
   *
   * Cùng lý do file seo-pages-content.mjs phải cho trang này `titleTail` và `intro`
   * riêng — khuôn chung luôn gãy ở đúng mục này.
   */
  const isDrill = (page) => page.slug === 'special-characters'
  const languages = pages.filter((page) => !isDrill(page))

  // Rổ nhỏ nhất trên toàn bộ ngôn ngữ — câu "ít nhất N bài mỗi mốc" phải đúng với
  // ngôn ngữ nghèo bài nhất, không thì thành quảng cáo sai.
  const perBucket = Math.min(
    ...pages.flatMap((page) => {
      const c = snippetCounts(page.id)
      return [c.short, c.medium, c.long]
    }),
  )

  /**
   * Đếm CẢ rổ ký tự đặc biệt: thẻ title, JSON-LD, README và các bài viết đều nói "14
   * languages". Sửa riêng chỗ này thành 13 là để hai con số khác nhau trên cùng một
   * trang — tệ hơn hẳn việc gọi rổ ký tự là một "ngôn ngữ".
   */
  const stats = `
        <h2>${pages.length} languages, ${total.toLocaleString('en-US')} code snippets</h2>
        <p>
          ${languages.map((page) => page.label).join(', ')}, and a special-characters drill.
          Every language has at least ${perBucket} snippets for each of the 15, 30 and 60
          second runs, served in shuffled order so you never repeat one before finishing a
          full round — even across page reloads.
        </p>
        `

  const linkFor = (page) =>
    isDrill(page)
      ? `          <li><a href="/practice/${page.slug}/">Practice brackets, operators and symbols</a></li>`
      : `          <li><a href="/practice/${page.slug}/">Practice typing ${page.label} code</a></li>`

  const links = `
        <ul>
${pages.map(linkFor).join('\n')}
          <li><a href="/practice/">All ${pages.length} languages in one place</a></li>
        </ul>
        `

  html = replaceRegion(html, 'stats', stats)
  html = replaceRegion(html, 'links', links)

  /**
   * JSON-LD nằm trong thẻ <script> nên không bọc được bằng dấu mốc HTML — dùng token
   * thay thế. Đây là dữ liệu Google đọc để hiểu site, để lệch là quảng cáo sai với
   * chính công cụ mình đang muốn xếp hạng.
   */
  const TOKEN = '__SNIPPET_TOTAL__'
  if (!html.includes(TOKEN)) {
    throw new Error(`khong thay token ${TOKEN} trong index.html (JSON-LD)`)
  }

  html = html.replaceAll(TOKEN, String(total))

  writeFileSync(path, html, 'utf8')
  console.log(`  index.html (${total} bai, ${pages.length + 1} lien ket noi bo)`)
}

async function main() {
  const { snippetCounts, sampleSnippets } = await loadSnippetCounts()

  for (const page of LANGUAGE_PAGES) {
    const counts = snippetCounts(page.id)

    // Trang nào không có bài thì KHÔNG sinh: một trang quảng cáo "0 snippets" tệ hơn là
    // không có trang, và Google coi đó là trang mỏng.
    if (counts.total === 0) {
      console.warn(`bo qua ${page.slug}: khong co bai nao`)
      continue
    }

    const siblings = LANGUAGE_PAGES.filter((p) => p.id !== page.id)
    const dir = `${DIST}/practice/${page.slug}`

    mkdirSync(dir, { recursive: true })
    writeFileSync(
      `${dir}/index.html`,
      renderPage(page, counts, sampleSnippets(page.id, 3), siblings),
      'utf8',
    )

    console.log(`  /practice/${page.slug}/  (${counts.total} bai)`)
  }

  writeFileSync(`${DIST}/practice/index.html`, renderHub(LANGUAGE_PAGES, snippetCounts), 'utf8')
  console.log('  /practice/  (trang hub)')

  patchIndexHtml(snippetCounts)

  const sitemap = renderSitemap(LANGUAGE_PAGES)
  writeFileSync(`${DIST}/sitemap.xml`, sitemap, 'utf8')
  console.log(`  sitemap.xml (${(sitemap.match(/<loc>/g) ?? []).length} URL)`)

  rmSync(TMP_DIR, { recursive: true, force: true })
}

main()
