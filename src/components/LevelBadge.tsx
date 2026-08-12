import { levelFromXp } from '../lib/xp'
import type { Translation } from '../i18n/translations'

interface LevelBadgeProps {
  xp: number
  onClick: () => void
  t: Translation
}

/**
 * Huy hiệu cấp độ ở header: số cấp + thanh tiến trình mảnh.
 *
 * Chiều rộng thanh CỐ ĐỊNH (`w-16`), không co theo nội dung: cấp lên 2 chữ số hay XP đổi
 * thì header không được nhảy — cùng lý do khung code phải cao cố định.
 */
export function LevelBadge({ xp, onClick, t }: LevelBadgeProps) {
  const { level, into, needed, percent } = levelFromXp(xp)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-1 rounded border cursor-pointer transition-colors duration-150 border-zinc-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-400"
      title={`${into} / ${needed} ${t.xpLabel} ${t.xpToNextLevel} · ${xp} ${t.xpLabel} total`}
    >
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {t.levelShort}
      </span>
      <span className="font-mono text-sm font-bold tabular-nums text-orange-600 dark:text-orange-400">
        {level}
      </span>

      <span className="w-16 h-1 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
        <span
          className="block h-full rounded-full bg-orange-500 transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </span>
    </button>
  )
}
