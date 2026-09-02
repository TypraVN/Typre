import { formatClock } from '../lib/chess/clock'
import type { Color } from '../lib/chess/types'

interface ChessClockProps {
  whiteMs: number
  blackMs: number
  /** Bên đang bị trừ giờ. `null` khi đồng hồ dừng. */
  running: Color | null
  /** Cầm quân đen thì đảo chỗ hai đồng hồ cho khớp với bàn đã lật. */
  flipped: boolean
}

/** Dưới một phút thì đổi màu — người chơi cần thấy bằng đuôi mắt, không phải đọc số. */
const LOW_MS = 60_000

export function ChessClock({ whiteMs, blackMs, running, flipped }: ChessClockProps) {
  const top = flipped ? 'w' : 'b'
  const bottom = flipped ? 'b' : 'w'

  const value = (color: Color) => (color === 'w' ? whiteMs : blackMs)

  return (
    <div className="flex flex-col gap-1 font-mono">
      <Face color={top} ms={value(top)} active={running === top} />
      <Face color={bottom} ms={value(bottom)} active={running === bottom} />
    </div>
  )
}

function Face({ color, ms, active }: { color: Color; ms: number; active: boolean }) {
  const low = ms < LOW_MS
  const out = ms <= 0

  return (
    <div
      className={[
        'flex items-baseline justify-between gap-3 px-3 py-1.5 rounded border tabular-nums',
        active
          ? 'border-orange-500 dark:border-orange-400'
          : 'border-zinc-300 dark:border-zinc-700',
        out
          ? 'text-red-600 dark:text-red-400'
          : low
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-zinc-700 dark:text-zinc-200',
      ].join(' ')}
    >
      <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {color === 'w' ? 'white' : 'black'}
      </span>
      <span className={low ? 'text-xl font-bold' : 'text-xl'}>{formatClock(ms)}</span>
    </div>
  )
}
