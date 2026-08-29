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
 * Số liệu gộp của MỘT ngày. Cùng lý do với `totals`: `results` chỉ giữ 50 lượt gần nhất
 * nên không thể vẽ được tiến bộ dài hạn từ nó — người gõ chăm chỉ chỉ còn thấy vài ngày.
 *
 * Lưu tổng thay vì lưu trung bình để cộng thêm một lượt mới là phép cộng, không phải
 * tính lại trung bình từ số đã làm tròn.
 */
export interface DailyStat {
  runs: number
  wpmSum: number
  accuracySum: number
  bestWpm: number
}

/** YYYY-MM-DD (giờ máy) → số liệu ngày đó. Ngày không gõ thì KHÔNG có khoá. */
export type DailyLog = Record<string, DailyStat>

/**
 * Trần số ngày lưu lại. Mỗi ngày ~60 byte nên 400 ngày ≈ 24 KB trong localStorage —
 * đủ hơn một năm mà vẫn không đáng kể so với hạn mức 5 MB.
 */
const MAX_DAILY_DAYS = 400

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
  daily: DailyLog
  lastAward: XpAward | null
  addResult: (result: TypingResult) => void
  markStarted: () => void
  clear: () => void
}

/**
 * Lượt gõ có được tính vào biểu đồ tiến bộ không.
 *
 * Bỏ lượt code tự dán vì độ khó do người dùng tự chọn — dán một dòng `console.log` rồi
 * dán tiếp một hàm regex thì đường biểu đồ nhảy loạn mà tốc độ gõ chẳng đổi. Cùng lý do
 * với việc kỷ lục cá nhân không tính lượt custom.
 *
 * Bỏ luôn lượt wpm ≤ 0: mở bài rồi thoát ngay cũng ghi kết quả, và một điểm 0 kéo tụt
 * trung bình cả ngày.
 */
function countsTowardDaily(result: TypingResult): boolean {
  return !result.custom && result.wpm > 0
}

function addToDay(stat: DailyStat | undefined, result: TypingResult): DailyStat {
  const base = stat ?? { runs: 0, wpmSum: 0, accuracySum: 0, bestWpm: 0 }
  return {
    runs: base.runs + 1,
    wpmSum: base.wpmSum + result.wpm,
    accuracySum: base.accuracySum + result.accuracy,
    bestWpm: Math.max(base.bestWpm, result.wpm),
  }
}

/** Cắt bớt ngày cũ nhất khi vượt trần. Khoá dạng YYYY-MM-DD nên sắp xếp chuỗi là đúng thứ tự. */
function trimDaily(daily: DailyLog): DailyLog {
  const keys = Object.keys(daily)
  if (keys.length <= MAX_DAILY_DAYS) return daily

  const keep = keys.sort().slice(-MAX_DAILY_DAYS)
  const trimmed: DailyLog = {}
  for (const key of keep) trimmed[key] = daily[key]
  return trimmed
}

/**
 * Dựng lại `daily` từ `results` cho người đã dùng app TRƯỚC khi có tính năng này.
 *
 * Chỉ khôi phục được tối đa 50 lượt gần nhất — đó là tất cả những gì còn lưu. Không hoàn
 * hảo, nhưng hơn hẳn việc bắt họ nhìn biểu đồ trống rồi chờ vài tuần mới có gì để xem.
 */
export function seedDailyFromResults(results: TypingResult[]): DailyLog {
  const daily: DailyLog = {}

  for (const result of results) {
    if (!countsTowardDaily(result)) continue

    const date = new Date(result.date)
    if (Number.isNaN(date.getTime())) continue

    const key = toDateKey(date)
    daily[key] = addToDay(daily[key], result)
  }

  return trimDaily(daily)
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
      daily: {},
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

          // Gộp vào ngày HÔM NAY chứ không đọc `result.date`: hai giá trị luôn trùng nhau
          // ở đây, và `today` đã tính sẵn ở trên cho phần chuỗi ngày.
          const daily = countsTowardDaily(result)
            ? trimDaily({ ...state.daily, [today]: addToDay(state.daily?.[today], result) })
            : (state.daily ?? {})

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
            daily,
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
        daily: state.daily,
      }),
      /**
       * Người đã dùng app trước khi có `daily` sẽ rehydrate ra một object rỗng. Dựng lại
       * từ 50 lượt còn lưu để họ có biểu đồ ngay, thay vì phải chờ vài tuần.
       *
       * Chỉ chạy khi RỖNG, nên đúng một lần: sau lượt gõ đầu tiên là đã có dữ liệu và
       * lần rehydrate sau bỏ qua. Chạy lại lần nữa sẽ đếm trùng.
       */
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.daily && Object.keys(state.daily).length > 0) return
        state.daily = seedDailyFromResults(Array.isArray(state.results) ? state.results : [])
      },
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
