import { Flame } from 'lucide-react'
import { Modal } from './Modal'
import { AchievementGrid } from './AchievementGrid'
import { levelFromXp } from '../lib/xp'
import type { Progress } from '../store/useHistoryStore'
import type { Translation } from '../i18n/translations'

interface ProgressDialogProps {
  progress: Progress
  onClose: () => void
  t: Translation
}

/**
 * Cấp độ + thành tích, mở bằng cách bấm huy hiệu ở header.
 *
 * Cần một chỗ xem KHÔNG YÊU CẦU ĐĂNG NHẬP: XP và thành tích đều tính ở máy nên người
 * chưa đăng nhập vẫn có, mà "User stats" lại nằm trong menu tài khoản. Không có màn này
 * thì họ thấy huy hiệu tăng cấp mà không cách nào xem mình đã mở được những gì.
 */
export function ProgressDialog({ progress, onClose, t }: ProgressDialogProps) {
  const { level, into, needed, percent } = levelFromXp(progress.xp)

  return (
    <Modal label={t.levelLabel} closeLabel={t.close} onClose={onClose} widthClass="max-w-lg">
      <div className="px-6 py-5 flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              {t.levelLabel}
            </div>
            <div className="font-mono text-4xl font-bold tabular-nums text-orange-600 dark:text-orange-400">
              {level}
            </div>
          </div>

          <div className="text-right font-mono text-xs text-zinc-500 dark:text-zinc-400">
            <div className="tabular-nums">
              {into} / {needed} {t.xpLabel}
            </div>
            <div>{t.xpToNextLevel}</div>
            <div className="mt-1 tabular-nums">
              {progress.xp} {t.xpLabel} total
            </div>
          </div>
        </div>

        <span className="h-1.5 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
          <span
            className="block h-full rounded-full bg-orange-500 transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </span>

        {progress.streakDays > 0 && (
          <div className="flex items-center gap-1.5 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            <Flame className="w-4 h-4 text-orange-500" />
            {progress.streakDays} {t.dayStreak}
          </div>
        )}

        <AchievementGrid unlocked={progress.unlocked ?? {}} t={t} />

        <div className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
          {t.xpLocalNote}
        </div>
      </div>
    </Modal>
  )
}
