import { useState } from 'react'
import type { TypingResult } from '../store/useHistoryStore'
import { useUiThemeStore } from '../store/useUiThemeStore'

interface WpmChartProps {
  results: TypingResult[]
  title: string
  attemptLabel: string
}

const WIDTH = 300
const HEIGHT = 90
const PAD_TOP = 10
const PAD_BOTTOM = 18
const PAD_X = 8
const LINE_COLOR = '#fb923c'

export function WpmChart({ results, title, attemptLabel }: WpmChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const isDark = useUiThemeStore((s) => s.mode === 'dark')
  const surface = isDark ? '#18181b' : '#ffffff'
  const gridColor = isDark ? '#3f3f46' : '#e4e4e7'
  const axisTextColor = '#71717a'

  const chronological = results.slice(0, 20).reverse()
  if (chronological.length < 2) return null

  const wpmValues = chronological.map((r) => r.wpm)
  const maxWpm = Math.max(...wpmValues, 1)
  const niceMax = Math.max(10, Math.ceil(maxWpm / 10) * 10)
  const ticks = [0, niceMax / 2, niceMax]

  const innerWidth = WIDTH - PAD_X * 2
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

  const xAt = (i: number) =>
    PAD_X + (chronological.length === 1 ? innerWidth / 2 : (i / (chronological.length - 1)) * innerWidth)
  const yAt = (value: number) => PAD_TOP + (1 - value / niceMax) * innerHeight

  const linePath = chronological.map((r, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)},${yAt(r.wpm)}`).join(' ')

  const hovered = hoverIndex !== null ? chronological[hoverIndex] : null

  const handleMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    chronological.forEach((_, i) => {
      const dist = Math.abs(xAt(i) - relX)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setHoverIndex(closest)
  }

  return (
    <div className="w-full max-w-xs font-mono">
      <div className="text-xs text-zinc-500 mb-1">{title}</div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-24 overflow-visible"
        >
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke={gridColor}
              strokeWidth={1}
            />
          ))}

          {ticks.map((tick) => (
            <text key={tick} x={0} y={yAt(tick)} dy={3} fontSize={8} fill={axisTextColor}>
              {tick}
            </text>
          ))}

          <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hoverIndex !== null && (
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={PAD_TOP}
              y2={HEIGHT - PAD_BOTTOM}
              stroke={axisTextColor}
              strokeWidth={1}
            />
          )}

          {chronological.map((r, i) => {
            const isLast = i === chronological.length - 1
            const isHovered = hoverIndex === i
            if (!isLast && !isHovered) return null
            return (
              <g key={r.id}>
                <circle cx={xAt(i)} cy={yAt(r.wpm)} r={6} fill={surface} />
                <circle cx={xAt(i)} cy={yAt(r.wpm)} r={4} fill={LINE_COLOR} />
              </g>
            )
          })}

          <rect
            x={0}
            y={0}
            width={WIDTH}
            height={HEIGHT}
            fill="transparent"
            onPointerMove={handleMove}
            onPointerLeave={() => setHoverIndex(null)}
          />
        </svg>

        {hovered && (
          <div className="absolute top-0 right-0 text-right text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 pointer-events-none">
            <div className="text-orange-500 dark:text-orange-400 font-bold">{hovered.wpm} wpm</div>
            <div className="text-zinc-500">
              {attemptLabel} {hoverIndex! + 1}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
