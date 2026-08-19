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
import { newlyUnlocked } from '../lib/achievements'

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
  /**
   * Lượt gõ code người dùng tự dán. Không tính vào kỷ lục cá nhân: độ khó do họ tự
   * chọn nên so với bài trong kho là vô nghĩa. XP vẫn tính — XP chỉ ở máy họ.
   */
  custom?: boolean
}

/**
 * Đếm trọn đời, KHÔNG bị ảnh hưởng bởi việc `results` chỉ giữ 50 lần gần nhất —
 * nếu tính "số lần đã gõ" bằng `results.length` thì gõ tới lần thứ 51 là số liệu đứng im.
 */
export interface LifetimeTotals {
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
  /**
   * Thành tích đã mở khoá: id → ngày mở (ISO). Lưu ngày chứ không lưu `true` để sau này
   * hiện được "mở khoá hôm nào" mà không phải đổi cấu trúc.
   *
   * Một khi đã mở thì KHÔNG bao giờ mất, kể cả điều kiện không còn đúng — thành tích là
   * ghi nhận việc đã làm được, không phải trạng thái hiện tại.
   */
  unlocked: Record<string, string>
}

/** Kết quả tính XP của lượt VỪA XONG, để bảng kết quả hiện "+72 XP". */
export interface XpAward {
  breakdown: XpBreakdown
  levelBefore: number
  levelAfter: number
  streakDays: number
  /**
   * Chuỗi ngày vừa DÀI RA ở lượt này, không phải chỉ đang có chuỗi.
   *
   * Cần tách khỏi `streakDays` vì gõ lượt thứ hai trong cùng một ngày thì `streakDays`
   * vẫn là 3 — ăn mừng lại là sai, và ăn mừng mỗi lượt thì lần thứ ba đã thành phiền.
   */
  streakGrew: boolean
  newRecord: boolean
  /** Id các thành tích vừa mở khoá ở lượt này, để bảng kết quả hiện ra. */
  unlockedNow: string[]
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

const EMPTY_PROGRESS: Progress = {
  xp: 0,
  streakDays: 0,
  lastRunDate: null,
  bests: {},
  unlocked: {},
}

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
          /**
           * Lượt ĐẦU TIÊN của một cặp (ngôn ngữ × mốc) chỉ đặt mốc chuẩn, KHÔNG được
           * tính là phá kỷ lục: 14 ngôn ngữ × 3 mốc = 42 lần +50 gần như miễn phí, đủ
           * lên ~cấp 11 chỉ bằng cách thử qua mỗi loại một lượt.
           */
          const beatsRecord = previousBest > 0 && result.wpm > previousBest
          const newRecord = !result.custom && beatsRecord
          // Vẫn phải LƯU mốc chuẩn của lượt đầu, không thì lần sau vẫn là "lần đầu".
          const raisesBest = !result.custom && result.wpm > previousBest

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

          const results = [result, ...state.results].slice(0, 50)
          const totals = {
            ...state.totals,
            completed: state.totals.completed + 1,
            typingSeconds: state.totals.typingSeconds + duration,
          }
          const progress: Progress = {
            xp,
            streakDays,
            lastRunDate: today,
            bests: raisesBest
              ? { ...state.progress.bests, [key]: result.wpm }
              : state.progress.bests,
            // Bản lưu cũ không có `unlocked` → mặc định rỗng, đừng để undefined lọt xuống.
            unlocked: state.progress.unlocked ?? {},
          }

          // Xét thành tích SAU khi đã cập nhật totals/progress: điều kiện kiểu "10 lượt"
          // phải thấy được lượt vừa xong, không thì luôn chậm một nhịp.
          const unlockedNow = newlyUnlocked(
            { totals, progress, results, lastRun: result },
            progress.unlocked,
          )

          for (const id of unlockedNow) {
            progress.unlocked[id] = new Date().toISOString()
          }

          return {
            results,
            totals,
            progress,
            lastAward: {
              breakdown,
              levelBefore: levelFromXp(state.progress.xp).level,
              levelAfter: levelFromXp(xp).level,
              streakDays,
              // Từ ngày 2 trở đi mới ăn mừng: ngày 1 chưa phải "chuỗi", và khoản XP
              // +streak đã hiện trong bảng chia nhỏ rồi.
              streakGrew: streakDays > 1 && streakDays > state.progress.streakDays,
              newRecord,
              unlockedNow,
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
