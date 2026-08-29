import { useMemo, useState } from 'react'
import { dailySeries, type DailyPoint } from '../lib/stats'
import type { DailyLog } from '../store/useHistoryStore'
import { useUiThemeStore } from '../store/useUiThemeStore'
import type { Translation } from '../i18n/translations'

interface ProgressChartProps {
  daily: DailyLog
  t: Translation
}

const WIDTH = 600
const HEIGHT = 150
const PAD_TOP = 12
const PAD_BOTTOM = 22
const PAD_LEFT = 24
const PAD_RIGHT = 8
const LINE_COLOR = '#fb923c'

const RANGES = [7, 30, 90] as const
type Range = (typeof RANGES)[number]

/** Mốc thời gian nào cần bao nhiêu ngày CÓ dữ liệu thì đường mới đáng vẽ. */
const MIN_DAYS_WITH_DATA = 2

/** "12 Aug" — đủ để định vị, không chiếm chỗ như ngày đầy đủ. */
function formatDay(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00')
  if (Number.isNaN(date.getTime())) return dateKey
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/**
 * Cắt chuỗi ngày thành các đoạn LIỀN NHAU có dữ liệu.
 *
 * Ngày nghỉ phải làm đứt đường chứ không được nối thẳng qua: nối qua một tuần không gõ
 * sẽ vẽ ra một đoạn dốc trông như tiến bộ dần, trong khi thực tế chẳng có lần gõ nào.
 */
function toSegments(points: DailyPoint[]): Array<Array<{ point: DailyPoint; index: number }>> {
  const segments: Array<Array<{ point: DailyPoint; index: number }>> = []
  let current: Array<{ point: DailyPoint; index: number }> = []

  points.forEach((point, index) => {
    if (point.runs > 0) {
      current.push({ point, index })
      return
    }
    if (current.length > 0) {
      segments.push(current)
      current = []
    }
  })

  if (current.length > 0) segments.push(current)
  return segments
}

export function ProgressChart({ daily, t }: ProgressChartProps) {
  const [range, setRange] = useState<Range>(30)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const isDark = useUiThemeStore((s) => s.mode === 'dark')

  const surface = isDark ? '#18181b' : '#ffffff'
  const gridColor = isDark ? '#3f3f46' : '#e4e4e7'
  const axisTextColor = '#71717a'

  const points = useMemo(() => dailySeries(daily, range), [daily, range])

  const withData = points.filter((p) => p.runs > 0)

  // Xét trên TOÀN BỘ nhật ký, không chỉ khoảng đang xem: người gõ 2 ngày cách đây 4 tháng
  // vẫn nên thấy nút đổi mốc để tự tìm ra dữ liệu của mình, thay vì gặp màn hình trống.
  const totalDaysWithData = Object.values(daily ?? {}).filter((d) => d.runs > 0).length

  if (totalDaysWithData < MIN_DAYS_WITH_DATA) {
    return (
      <div className="flex flex-col gap-2">
        <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          {t.progressTitle}
        </div>
        <div className="font-mono text-sm text-zinc-500">{t.progressEmpty}</div>
      </div>
    )
  }

  const maxWpm = Math.max(...withData.map((p) => p.avgWpm), 1)
  const niceMax = Math.max(10, Math.ceil(maxWpm / 10) * 10)
  const ticks = [0, niceMax / 2, niceMax]

  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

  const xAt = (i: number) =>
    PAD_LEFT + (points.length === 1 ? innerWidth / 2 : (i / (points.length - 1)) * innerWidth)
  const yAt = (value: number) => PAD_TOP + (1 - value / niceMax) * innerHeight

  const segments = toSegments(points)
  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  // Ít điểm thì chấm từng ngày cho dễ đọc; 90 ngày mà chấm hết thì thành một dải đặc.
  const showAllDots = withData.length <= 14

  const handleMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    points.forEach((_, i) => {
      const dist = Math.abs(xAt(i) - relX)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setHoverIndex(closest)
  }

  return (
    <div className="flex flex-col gap-2 font-mono">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs uppercase tracking-wider text-zinc-500">{t.progressTitle}</div>
        <div className="flex gap-1">
          {RANGES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRange(value)
                setHoverIndex(null)
              }}
              aria-pressed={range === value}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                range === value
                  ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {value === 7 ? t.progressRange7 : value === 30 ? t.progressRange30 : t.progressRange90}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-40">
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke={gridColor}
              strokeWidth={1}
            />
          ))}

          {ticks.map((tick) => (
            <text key={tick} x={0} y={yAt(tick)} dy={3} fontSize={9} fill={axisTextColor}>
              {tick}
            </text>
          ))}

          {segments.map((segment) => {
            const key = segment[0].point.dateKey

            // Một ngày đứng lẻ giữa hai ngày nghỉ không tạo được đoạn thẳng nào — vẽ chấm,
            // không thì nó biến mất khỏi biểu đồ.
            if (segment.length === 1) {
              const { point, index } = segment[0]
              return (
                <circle key={key} cx={xAt(index)} cy={yAt(point.avgWpm)} r={2.5} fill={LINE_COLOR} />
              )
            }

            const d = segment
              .map(({ point, index }, i) => `${i === 0 ? 'M' : 'L'} ${xAt(index)},${yAt(point.avgWpm)}`)
              .join(' ')

            return (
              <path
                key={key}
                d={d}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )
          })}

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

          {points.map((point, i) => {
            if (point.runs === 0) return null
            const isHovered = hoverIndex === i
            if (!showAllDots && !isHovered) return null
            return (
              <g key={point.dateKey}>
                <circle cx={xAt(i)} cy={yAt(point.avgWpm)} r={5} fill={surface} />
                <circle cx={xAt(i)} cy={yAt(point.avgWpm)} r={3} fill={LINE_COLOR} />
              </g>
            )
          })}

          <text x={PAD_LEFT} y={HEIGHT - 6} fontSize={9} fill={axisTextColor}>
            {formatDay(points[0].dateKey)}
          </text>
          <text
            x={WIDTH - PAD_RIGHT}
            y={HEIGHT - 6}
            fontSize={9}
            fill={axisTextColor}
            textAnchor="end"
          >
            {formatDay(points[points.length - 1].dateKey)}
          </text>

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
            <div className="text-zinc-500">{formatDay(hovered.dateKey)}</div>
            {hovered.runs === 0 ? (
              <div className="text-zinc-400 dark:text-zinc-500">{t.progressRestDay}</div>
            ) : (
              <>
                <div className="text-orange-500 dark:text-orange-400 font-bold">
                  {hovered.avgWpm} wpm
                </div>
                <div className="text-zinc-500">
                  {t.progressBestLabel} {hovered.bestWpm} · {hovered.avgAccuracy}%
                </div>
                <div className="text-zinc-500">
                  {hovered.runs} {t.progressRunsLabel}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{t.progressCustomNote}</div>
    </div>
  )
}
