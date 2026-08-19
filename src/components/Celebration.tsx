import { Flame, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'

/** Số tia bắn ra. Nhiều hơn không đẹp hơn, chỉ tốn phần tử DOM. */
const SPARK_COUNT = 12

/**
 * Toạ độ đích của từng tia, tính SẴN ở tầng module.
 *
 * Cố ý không random: mỗi lần render lại sẽ ra hướng khác, và React StrictMode render hai
 * lần nên tia sẽ nhảy chỗ ngay khi vừa xuất hiện. Rải đều theo góc trông cũng gọn hơn.
 * Bán kính so le để không thành một vòng tròn cứng nhắc.
 */
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const angle = (i / SPARK_COUNT) * Math.PI * 2
  const radius = i % 2 === 0 ? 58 : 38

  return {
    dx: `${Math.round(Math.cos(angle) * radius)}px`,
    dy: `${Math.round(Math.sin(angle) * radius)}px`,
    delay: `${(i % 4) * 40}ms`,
  }
})

/**
 * Tia bắn ra từ tâm + quầng sáng loe ra.
 *
 * `pointer-events-none` và `absolute`: hiệu ứng không được che nút bấm bên dưới, và
 * không được làm bảng kết quả cao thêm rồi đẩy nội dung nhảy chỗ.
 */
function Burst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      <span className="absolute w-16 h-16 rounded-full border border-orange-500/60 animate-glow-ring" />

      {SPARKS.map((s, i) => (
        <span
          key={i}
          style={{ '--dx': s.dx, '--dy': s.dy, animationDelay: s.delay } as React.CSSProperties}
          className="absolute w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400 animate-spark"
        />
      ))}
    </div>
  )
}

function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex items-center justify-center py-1">
      <Burst />
      {children}
    </div>
  )
}

interface CelebrationProps {
  leveledUp: boolean
  level: number
  streakGrew: boolean
  streakDays: number
  t: {
    levelUp: string
    levelShort: string
    dayStreak: string
  }
}

/**
 * Ăn mừng khi lên cấp hoặc nối dài chuỗi ngày.
 *
 * Hai sự kiện này là thứ duy nhất trong app đáng dừng lại một nhịp: XP thì lượt nào cũng
 * có, còn lên cấp và giữ chuỗi mới là cái người ta quay lại vì nó.
 *
 * Có thể xảy ra CÙNG LÚC (gõ lượt đầu trong ngày và vừa đủ XP lên cấp) nên hiện cả hai,
 * cấp độ trước — đó là phần thưởng lớn hơn.
 */
export function Celebration({ leveledUp, level, streakGrew, streakDays, t }: CelebrationProps) {
  if (!leveledUp && !streakGrew) return null

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {leveledUp && (
        <Banner>
          <div className="animate-level-pop flex items-center gap-2 px-4 py-1.5 rounded-lg border border-orange-500/50 bg-orange-500/15 font-mono text-orange-600 dark:text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.25)]">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wider">{t.levelUp}</span>
            <span className="text-lg font-bold tabular-nums">
              {t.levelShort}
              {level}
            </span>
          </div>
        </Banner>
      )}

      {streakGrew && (
        <Banner>
          <div className="flex items-center gap-2 px-3 py-1 font-mono text-orange-600 dark:text-orange-400">
            <Flame className="w-5 h-5 animate-flame" />
            <span className="text-base font-bold tabular-nums">{streakDays}</span>
            <span className="text-sm">{t.dayStreak}</span>
          </div>
        </Banner>
      )}
    </div>
  )
}
