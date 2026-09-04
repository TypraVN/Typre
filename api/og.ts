import type { ImageResponse as ImageResponseCtor } from '@vercel/og'

/**
 * Ảnh preview khi link thách đấu (`/c/...`) được share ra ngoài — Twitter/X, LinkedIn,
 * Discord, Slack đều gọi URL này để lấy `og:image` (xem `middleware.ts`). Query đến từ
 * URL nên phải validate: WPM/mốc thời gian ép về số hợp lệ, tên ngôn ngữ lọc ký tự lạ,
 * để ai đó không tự chế query rồi ép ảnh vẽ ra chữ tùy ý.
 *
 * Chạy trên Node.js Function (mặc định), KHÔNG phải Edge — xem lý do ở cách nạp
 * `@vercel/og` bên dưới, và vì đặt hàm này ở Edge từng làm `middleware.ts` (cùng dự án,
 * cũng Edge) bị Vercel gộp chung bundle rồi vỡ với lỗi "referencing unsupported modules"
 * dù middleware không hề import file này — chỉ ghi URL của nó vào một chuỗi HTML.
 *
 * `@vercel/og` bản Node.js (`dist/index.node.js`) là ES module THUẦN, không có bản
 * CommonJS. File này biên dịch ra CommonJS (bắt buộc — xem `tsconfig.json` gốc:
 * thư mục cô lập của function lúc chạy trên Vercel không có `package.json` khai
 * `"type": "module"` nào cả, nên một file `.js` dùng cú pháp `import`/`export` sẽ vỡ ngay
 * từ dòng đầu). `require()` một gói ES module thuần từ CommonJS thì vỡ với
 * ERR_REQUIRE_ESM — nhưng `import()` ĐỘNG thì gọi được, đây là interop chính thức của
 * Node. Vấn đề là TypeScript biên dịch sang CommonJS sẽ tự hạ cấp `await import(...)`
 * thành `Promise.resolve().then(() => require(...))` — vẫn dùng `require`, vẫn vỡ y hệt.
 * `dynamicImport` bên dưới gói lời gọi trong `Function(...)` để trốn khỏi con mắt tĩnh
 * của trình biên dịch: chuỗi bên trong chỉ được đọc lúc CHẠY nên không có gì để hạ cấp,
 * và Node thực thi đúng `import()` thật.
 *
 * Nhưng như vậy thì Vercel cũng không còn "thấy" `@vercel/og` để đóng gói nó vào bundle
 * triển khai (bộ dò dependency của Vercel chỉ đọc được specifier viết cố định trong mã đã
 * biên dịch). Khối `if (false)` dưới đây tồn tại ĐÚNG một việc: có mặt bằng chữ để Vercel
 * đóng gói `@vercel/og`, nhưng không bao giờ thật sự chạy.
 */
if (false as boolean) {
  void import('@vercel/og')
}

const dynamicImport = (specifier: string): Promise<{ ImageResponse: typeof ImageResponseCtor }> =>
  new Function('specifier', 'return import(specifier)')(specifier)

const TIME_LIMITS = new Set(['15', '30', '60'])

interface Node {
  type: string
  props: {
    style?: Record<string, string | number>
    children?: Node[] | string
  }
}

/** `@vercel/og` chạy trên Satori, chỉ cần cây object hình dạng React element — không cần React thật. */
function el(type: string, style: Record<string, string | number>, children: Node[] | string): Node {
  return { type, props: { style, children } }
}

export default async function handler(request: Request) {
  const { ImageResponse } = await dynamicImport('@vercel/og')
  const { searchParams } = new URL(request.url)

  const wpm = Math.max(0, Math.min(999, Math.round(Number(searchParams.get('wpm')) || 0)))
  const timeParam = searchParams.get('time') ?? '30'
  const time = TIME_LIMITS.has(timeParam) ? timeParam : '30'
  const language = (searchParams.get('lang') ?? 'code').toLowerCase().replace(/[^a-z0-9+#]/g, '').slice(0, 20) || 'code'

  const tree = el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#18181b',
      fontFamily: 'monospace',
    },
    [
      el('div', { display: 'flex', alignItems: 'baseline', gap: 20 }, [
        el('span', { fontSize: 180, fontWeight: 700, color: '#f97316', lineHeight: 1 }, String(wpm)),
        el('span', { fontSize: 44, color: '#a1a1aa' }, 'wpm'),
      ]),
      el('div', { display: 'flex', gap: 16, fontSize: 36, color: '#a1a1aa', marginTop: 20 }, [
        el('span', {}, language),
        el('span', {}, '·'),
        el('span', {}, `${time}s run`),
      ]),
      el(
        'div',
        { display: 'flex', fontSize: 30, color: '#52525b', marginTop: 56 },
        'typre.dev — typing practice for programmers',
      ),
    ],
  )

  return new ImageResponse(tree as never, { width: 1200, height: 630 })
}
