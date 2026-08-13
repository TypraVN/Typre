import { Crown } from 'lucide-react'
import type { Racer } from '../lib/race'
import type { Translation } from '../i18n/translations'

interface RaceLanesProps {
  racers: Racer[]
  myKey: string
  connected: boolean
  t: Translation
}

/** Vạch đua của một người. Chiều cao cố định để phòng đông không đẩy khung gõ nhảy. */
function Lane({ racer, isMe }: { racer: Racer; isMe: boolean }) {
  return (
    <div className="flex items-center gap-2 h-6">
      <span
        className={`w-28 shrink-0 truncate font-mono text-xs ${
          isMe
            ? 'text-orange-600 dark:text-orange-400 font-bold'
            : 'text-zinc-500 dark:text-zinc-400'
        }`}
      >
        {racer.name}
      </span>

      <span className="relative flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <span
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-200 ease-out ${
            racer.completed
              ? 'bg-green-500'
              : racer.done
                ? 'bg-zinc-500 dark:bg-zinc-600'
                : isMe
                  ? 'bg-orange-500'
                  : 'bg-zinc-400 dark:bg-zinc-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, racer.percent))}%` }}
        />
      </span>

      {/* Ba trạng thái khác nhau, không gộp: về đích có thứ hạng, hết giờ giữa bài thì
          chốt wpm, còn đang gõ thì wpm chạy. */}
      <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
        {racer.completed && racer.place > 0 ? (
          <span className="flex items-center justify-end gap-1 text-green-600 dark:text-green-400">
            {racer.place === 1 && <Crown className="w-3 h-3" />}#{racer.place}
          </span>
        ) : (
          `${racer.wpm} wpm`
        )}
      </span>
    </div>
  )
}

/**
 * Danh sách vạch đua.
 *
 * Sắp theo tiến độ giảm dần nhưng người ĐÃ VỀ ĐÍCH luôn ở trên, theo thứ tự về đích:
 * xếp thuần theo phần trăm thì ai cũng 100% khi xong và thứ tự nhảy loạn.
 */
export function RaceLanes({ racers, myKey, connected, t }: RaceLanesProps) {
  const sorted = [...racers].sort((a, b) => {
    // Người về đích luôn ở trên, theo thứ tự về đích. Xếp thuần theo phần trăm thì ai
    // cũng 100% khi xong và thứ tự nhảy loạn.
    if (a.completed !== b.completed) return a.completed ? -1 : 1
    if (a.completed && b.completed) return a.place - b.place
    return b.percent - a.percent
  })

  return (
    <div className="w-full max-w-xl flex flex-col gap-1.5">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
        <span className="text-orange-600 dark:text-orange-500 font-bold">{t.raceLabel}</span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {connected
            ? `${racers.length} ${racers.length === 1 ? t.playerCountOne : t.playerCount}`
            : t.raceConnecting}
        </span>
      </div>

      {sorted.map((racer) => (
        <Lane key={racer.key} racer={racer} isMe={racer.key === myKey} />
      ))}

      {/* Một mình trong phòng là chuyện bình thường lúc mới tạo link — nói rõ phải làm
          gì tiếp thay vì để màn hình trống trải. */}
      {connected && racers.length <= 1 && (
        <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {t.raceWaiting}
        </div>
      )}
    </div>
  )
}
