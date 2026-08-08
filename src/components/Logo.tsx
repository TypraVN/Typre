interface LogoProps {
  size?: 'sm' | 'lg'
  showTagline?: boolean
  tagline?: string
  onClick?: () => void
  title?: string
}

const BAR_HEIGHTS_SM = [8, 14, 10]
const BAR_HEIGHTS_LG = [14, 24, 18]

export function Logo({
  size = 'lg',
  showTagline = false,
  tagline = 'luyện gõ code, đa ngôn ngữ',
  onClick,
  title,
}: LogoProps) {
  const isLg = size === 'lg'
  const box = isLg ? 52 : 30
  const barWidth = isLg ? 5 : 3
  const gap = isLg ? 4 : 3
  const heights = isLg ? BAR_HEIGHTS_LG : BAR_HEIGHTS_SM
  const wordmarkSize = isLg ? 'text-4xl' : 'text-lg'

  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        <div
          className="rounded-[10px] bg-black flex items-center justify-center"
          style={{ width: box, height: box, gap }}
        >
          {heights.map((h, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: barWidth,
                height: h,
                backgroundColor: i === 1 ? '#fdba74' : '#f97316',
              }}
            />
          ))}
        </div>
        <span
          className={`font-heading font-bold text-zinc-900 dark:text-zinc-100 ${wordmarkSize}`}
          style={{ letterSpacing: '-0.01em' }}
        >
          Typre
        </span>
      </div>
      {showTagline && (
        <span className="font-mono text-xs text-zinc-500" style={{ letterSpacing: '0.02em' }}>
          {tagline}
        </span>
      )}
    </div>
  )

  if (!onClick) return content

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded-lg cursor-pointer transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:focus-visible:ring-orange-400"
    >
      {content}
    </button>
  )
}
