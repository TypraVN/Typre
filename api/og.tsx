import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

const TIME_LIMITS = new Set(['15', '30', '60'])

/**
 * Ảnh preview khi link thách đấu (`/c/...`) được share ra ngoài — Twitter/X, LinkedIn,
 * Discord, Slack đều gọi URL này để lấy `og:image` (xem `middleware.ts`). Query đến từ
 * URL nên phải validate: WPM/mốc thời gian ép về số hợp lệ, tên ngôn ngữ lọc ký tự lạ,
 * để ai đó không tự chế query rồi ép ảnh vẽ ra chữ tùy ý.
 */
export default function handler(request: Request) {
  const { searchParams } = new URL(request.url)

  const wpm = Math.max(0, Math.min(999, Math.round(Number(searchParams.get('wpm')) || 0)))
  const timeParam = searchParams.get('time') ?? '30'
  const time = TIME_LIMITS.has(timeParam) ? timeParam : '30'
  const language = (searchParams.get('lang') ?? 'code').toLowerCase().replace(/[^a-z0-9+#]/g, '').slice(0, 20) || 'code'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#18181b',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
          <span style={{ fontSize: 180, fontWeight: 700, color: '#f97316', lineHeight: 1 }}>{wpm}</span>
          <span style={{ fontSize: 44, color: '#a1a1aa' }}>wpm</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 36, color: '#a1a1aa', marginTop: 20 }}>
          <span>{language}</span>
          <span>·</span>
          <span>{time}s run</span>
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#52525b', marginTop: 56 }}>
          typre.dev — typing practice for programmers
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
