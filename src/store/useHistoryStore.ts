import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  bestKey,
  levelFromXp,
  nextStreak,
  toDateKey,
  xpForRun,
  type XpBreakdown,
} from '../lib/xp'

export interface TypingResult {
  id: string
  date: string
  language: string
  wpm: number
  cpm: number
  accuracy: number
  mistakeCounts: Record<string, number>
  // Bốn field dưới là THÊM SAU, nên phải optional: các lần gõ đã lưu trước đó trong
  // localStorage không có chúng, đọc ra sẽ là undefined chứ không phải 0.
  timeLimit?: number
  durationSeconds?: number
  rawWpm?: number
  consistency?: number
  /**
   * Gõ hết bài (khác với hết giờ). Phải do engine nói, KHÔNG suy ra từ
   * `durationSeconds < timeLimit`: thời lượng đã làm tròn về giây, gõ xong ở 14,6s bị
   * ghi thành 15 và mất thưởng dù thực tế xong sớm.
   */
  completed?: boolean
}

/**
 * Đếm trọn đời, KHÔNG bị ảnh hưởng bởi việc `results` chỉ giữ 50 lần gần nhất —
 * nếu tính "số lần đã gõ" bằng `results.length` thì gõ tới lần thứ 51 là số liệu đứng im.
 */
interface LifetimeTotals {
  started: number
  completed: number
  typingSeconds: number
}

/**
 * Tiến trình XP. Phải là bộ đếm CỘNG DỒN, không được tính lại bằng cách cộng `results`:
 * `results` chỉ giữ 50 lượt gần nhất nên tới lượt thứ 51 là XP tự tụt xuống.
 */
export interface Progress {
  xp: number
  streakDays: number
  /** YYYY-MM-DD của lượt gõ gần nhất, theo giờ máy. */
  lastRunDate: string | null
  /** Kỷ lục wpm theo cặp (ngôn ngữ × mốc thời gian), khoá do `bestKey()` sinh. */
  bests: Record<string, number>
}

/** Kết quả tính XP của lượt VỪA XONG, để bảng kết quả hiện "+72 XP". */
export interface XpAward {
  breakdown: XpBreakdown
  levelBefore: number
  levelAfter: number
  streakDays: number
  newRecord: boolean
}

interface HistoryState {
  results: TypingResult[]
  totals: LifetimeTotals
  progress: Progress
  lastAward: XpAward | null
  addResult: (result: TypingResult) => void
  markStarted: () => void
  clear: () => void
}

const EMPTY_TOTALS: LifetimeTotals = { started: 0, completed: 0, typingSeconds: 0 }

const EMPTY_PROGRESS: Progress = { xp: 0, streakDays: 0, lastRunDate: null, bests: {} }

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      results: [],
      totals: EMPTY_TOTALS,
      progress: EMPTY_PROGRESS,
      lastAward: null,
      addResult: (result) =>
        set((state) => {
          const today = toDateKey(new Date())
          const streakDays = nextStreak(state.progress.lastRunDate, state.progress.streakDays, today)

          const key = bestKey(result.language, result.timeLimit ?? 0)
          const previousBest = state.progress.bests[key] ?? 0
          const newRecord = result.wpm > previousBest

          const duration = result.durationSeconds ?? 0
          const breakdown = xpForRun({
            wpm: result.wpm,
            accuracy: result.accuracy,
            durationSeconds: duration,
            // Lượt cũ trong localStorage không có `completed` thì đoán bằng thời lượng.
            finishedEarly: result.completed ?? (duration > 0 && duration < (result.timeLimit ?? 0)),
            newRecord,
            streakDays,
          })

          const xp = state.progress.xp + breakdown.total

          return {
            results: [result, ...state.results].slice(0, 50),
            totals: {
              ...state.totals,
              completed: state.totals.completed + 1,
              typingSeconds: state.totals.typingSeconds + duration,
            },
            progress: {
              xp,
              streakDays,
              lastRunDate: today,
              bests: newRecord
                ? { ...state.progress.bests, [key]: result.wpm }
                : state.progress.bests,
            },
            lastAward: {
              breakdown,
              levelBefore: levelFromXp(state.progress.xp).level,
              levelAfter: levelFromXp(xp).level,
              streakDays,
              newRecord,
            },
          }
        }),
      markStarted: () =>
        set((state) => ({ totals: { ...state.totals, started: state.totals.started + 1 } })),
      // Chỉ xoá danh sách chi tiết; số đếm trọn đời giữ nguyên (giống Monkeytype:
      // xoá lịch sử không có nghĩa là chưa từng gõ).
      clear: () => set({ results: [] }),
    }),
    {
      name: 'codetyping-history',
      /**
       * `lastAward` chỉ có nghĩa với lượt vừa gõ xong nên KHÔNG lưu xuống đĩa — lưu thì
       * mở app lần sau lại thấy "+72 XP" của hôm qua.
       *
       * Cố ý KHÔNG bump `version`: bản lưu cũ chỉ có `results` + `totals`, mà merge mặc
       * định của zustand là merge nông nên `progress` tự lấy giá trị khởi tạo. Bump
       * version mà quên `migrate` thì zustand VỨT sạch state đã lưu.
       */
      partialize: (state) => ({
        results: state.results,
        totals: state.totals,
        progress: state.progress,
      }),
    },
  ),
)

export function getTopMistakes(results: TypingResult[], limit = 5): Array<[string, number]> {
  const totals: Record<string, number> = {}
  for (const r of results) {
    for (const [ch, count] of Object.entries(r.mistakeCounts)) {
      totals[ch] = (totals[ch] ?? 0) + count
    }
  }
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}
