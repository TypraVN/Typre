import { Flame, Trophy } from 'lucide-react'
import type { XpAward } from '../store/useHistoryStore'
import type { Translation } from '../i18n/translations'

interface XpAwardCardProps {
  award: XpAward
  t: Translation
}

/**
 * Phần XP trong bảng kết quả: tổng XP kiếm được + chia nhỏ từng khoản.
 *
 * Chỉ hiện khoản nào KHÁC 0 — liệt kê "finished +0" chỉ làm rối và khiến người dùng
 * tưởng mình bị trừ. Lượt không hợp lệ (tổng 0) thì không render gì cả.
 */
export function XpAwardCard({ award, t }: XpAwardCardProps) {
  // `newRecord` không đọc ở đây: khoản +50 đã hiện trong bảng chia nhỏ bên dưới rồi.
  const { breakdown, levelBefore, levelAfter, streakDays } = award

  if (breakdown.total <= 0) return null

  const parts: Array<[string, number]> = [
    [t.xpBase, breakdown.base],
    [t.xpAccuracy, breakdown.accuracyBonus],
    [t.xpFinish, breakdown.finishBonus],
    [t.xpRecord, breakdown.recordBonus],
    [t.xpStreak, breakdown.streakBonus],
  ]

  const leveledUp = levelAfter > levelBefore

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex items-baseline gap-1.5 font-mono">
        <span className="text-2xl font-bold tabular-nums text-orange-600 dark:text-orange-400">
          +{breakdown.total}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {t.xpLabel} {t.xpEarned}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {parts
          .filter(([, value]) => value !== 0)
          .map(([label, value]) => (
            <span key={label}>
              {label} {value > 0 ? '+' : ''}
              {value}
            </span>
          ))}
      </div>

      {leveledUp && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-orange-500/40 bg-orange-500/10 font-mono text-sm text-orange-600 dark:text-orange-400 animate-pop-in">
          <Trophy className="w-4 h-4" />
          {t.levelUp} — {t.levelShort} {levelAfter}
        </div>
      )}

      {streakDays > 1 && (
        <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
          <Flame className="w-3.5 h-3.5" />
          {streakDays} {t.dayStreak}
        </div>
      )}
    </div>
  )
}
