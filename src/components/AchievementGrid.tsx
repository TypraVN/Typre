import { Lock } from 'lucide-react'
import { ACHIEVEMENTS } from '../lib/achievements'
import type { Translation } from '../i18n/translations'

interface AchievementGridProps {
  unlocked: Record<string, string>
  t: Translation
}

/**
 * Toàn bộ danh sách thành tích, kèm cả cái CHƯA mở.
 *
 * Cố ý hiện luôn mục chưa mở (mờ + ổ khoá) chứ không ẩn: ẩn đi thì người dùng không biết
 * còn gì để nhắm tới, và danh sách thành tích mất hẳn tác dụng làm mục tiêu.
 */
/**
 * Giá trị trong `unlocked` phải là chuỗi ISO ngày mở khoá.
 *
 * Kiểm kiểu chứ không chỉ kiểm `!== undefined`: dữ liệu này nằm trong localStorage của
 * người dùng từ nhiều phiên bản trước, và bên dưới có `.slice()` — gặp giá trị không phải
 * chuỗi là ném lỗi giữa lúc render. Hộp thoại nằm trong `Suspense` KHÔNG có error
 * boundary, nên một lỗi ở đây làm React gỡ sạch cây và người dùng nhận trang trắng.
 */
function unlockedAt(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

export function AchievementGrid({ unlocked, t }: AchievementGridProps) {
  const earned = ACHIEVEMENTS.filter((a) => unlockedAt(unlocked?.[a.id]) !== null).length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          {t.achievements}
        </span>
        <span className="font-mono text-xs text-zinc-500 tabular-nums">
          {earned} / {ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {ACHIEVEMENTS.map((a) => {
          const at = unlockedAt(unlocked?.[a.id])
          const open = at !== null

          return (
            <div
              key={a.id}
              title={at ? `${a.detail} · ${at.slice(0, 10)}` : a.detail}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded border font-mono text-xs ${
                open
                  ? 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600'
              }`}
            >
              {!open && <Lock className="w-3 h-3 shrink-0" />}
              <span className="truncate">{a.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
