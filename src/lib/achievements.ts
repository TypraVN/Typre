import type { LifetimeTotals, Progress, TypingResult } from '../store/useHistoryStore'

/**
 * Thành tích: cho XP một cái ĐÍCH thay vì chỉ là con số tăng dần.
 *
 * Tính hoàn toàn ở máy, không cần đăng nhập — cùng quy tắc với XP.
 *
 * Mỗi thành tích là một hàm `earned(snapshot)` thuần, nên thêm mục mới chỉ là thêm một
 * phần tử vào mảng; không phải sửa store hay UI.
 */

export interface AchievementSnapshot {
  totals: LifetimeTotals
  progress: Progress
  /** 50 lượt gần nhất — đủ cho mọi điều kiện hiện có. */
  results: TypingResult[]
  /** Lượt vừa gõ xong, để bắt các mốc "một lượt đạt được". */
  lastRun: TypingResult
}

export interface Achievement {
  id: string
  /** Nhãn ngắn hiện trên huy hiệu. */
  label: string
  /** Câu điều kiện, hiện ở tooltip và ở danh sách. */
  detail: string
  earned: (snapshot: AchievementSnapshot) => boolean
}

/** Số ngôn ngữ khác nhau đã từng lập kỷ lục — suy từ khoá `language|timeLimit`. */
function languagesTouched(progress: Progress): number {
  const langs = new Set(Object.keys(progress.bests).map((key) => key.split('|')[0]))
  return langs.size
}

function bestWpm(progress: Progress): number {
  const values = Object.values(progress.bests)
  return values.length === 0 ? 0 : Math.max(...values)
}

/**
 * Thứ tự trong mảng = thứ tự hiển thị. Cố ý xếp từ dễ tới khó để danh sách đọc như một
 * lộ trình, không phải một đống hỗn độn.
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-run',
    label: 'first run',
    detail: 'Finish your first run',
    earned: ({ totals }) => totals.completed >= 1,
  },
  {
    id: 'runs-10',
    label: '10 runs',
    detail: 'Finish 10 runs',
    earned: ({ totals }) => totals.completed >= 10,
  },
  {
    id: 'runs-100',
    label: '100 runs',
    detail: 'Finish 100 runs',
    earned: ({ totals }) => totals.completed >= 100,
  },
  {
    id: 'flawless',
    label: 'flawless',
    detail: 'Finish a run at 100% accuracy',
    earned: ({ lastRun }) => lastRun.accuracy >= 100 && lastRun.wpm > 0,
  },
  {
    id: 'finisher',
    label: 'finisher',
    detail: 'Type a whole snippet before the clock runs out',
    earned: ({ lastRun }) => lastRun.completed === true,
  },
  {
    id: 'wpm-40',
    label: '40 wpm',
    detail: 'Reach 40 wpm on any run',
    earned: ({ progress }) => bestWpm(progress) >= 40,
  },
  {
    id: 'wpm-60',
    label: '60 wpm',
    detail: 'Reach 60 wpm on any run',
    earned: ({ progress }) => bestWpm(progress) >= 60,
  },
  {
    id: 'wpm-100',
    label: '100 wpm',
    detail: 'Reach 100 wpm on any run',
    earned: ({ progress }) => bestWpm(progress) >= 100,
  },
  {
    id: 'steady',
    label: 'steady hands',
    detail: 'Finish a run with consistency 90% or higher',
    earned: ({ lastRun }) => (lastRun.consistency ?? 0) >= 90,
  },
  {
    id: 'streak-3',
    label: '3 day streak',
    detail: 'Type on three days in a row',
    earned: ({ progress }) => progress.streakDays >= 3,
  },
  {
    id: 'streak-7',
    label: '7 day streak',
    detail: 'Type on seven days in a row',
    earned: ({ progress }) => progress.streakDays >= 7,
  },
  {
    id: 'polyglot-5',
    label: '5 languages',
    detail: 'Set a personal best in five different languages',
    earned: ({ progress }) => languagesTouched(progress) >= 5,
  },
  {
    id: 'polyglot-all',
    label: 'all 14 languages',
    detail: 'Set a personal best in every language',
    earned: ({ progress }) => languagesTouched(progress) >= 14,
  },
  {
    id: 'marathon',
    label: 'one hour in',
    detail: 'Spend an hour of total typing time',
    earned: ({ totals }) => totals.typingSeconds >= 3600,
  },
  {
    id: 'level-10',
    label: 'level 10',
    detail: 'Reach level 10',
    earned: ({ progress }) => progress.xp >= 1800,
  },
  {
    id: 'long-haul',
    label: 'long haul',
    detail: 'Finish a 60 second run at 60 wpm or more',
    earned: ({ lastRun }) => (lastRun.timeLimit ?? 0) >= 60 && lastRun.wpm >= 60,
  },
]

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

/**
 * Id các thành tích VỪA mở khoá ở lượt này — chỉ những cái chưa có trong `unlocked`.
 *
 * Không tính lại toàn bộ danh sách rồi so sánh với lần trước: điều kiện kiểu "một lượt
 * đạt 100%" chỉ đúng ngay lúc đó, tính lại sau sẽ ra false và thành tích tự mất.
 */
export function newlyUnlocked(
  snapshot: AchievementSnapshot,
  unlocked: Record<string, string>,
): string[] {
  return ACHIEVEMENTS.filter((a) => unlocked[a.id] === undefined && a.earned(snapshot)).map(
    (a) => a.id,
  )
}
