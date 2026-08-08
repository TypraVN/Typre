import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface HistoryState {
  results: TypingResult[]
  totals: LifetimeTotals
  addResult: (result: TypingResult) => void
  markStarted: () => void
  clear: () => void
}

const EMPTY_TOTALS: LifetimeTotals = { started: 0, completed: 0, typingSeconds: 0 }

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      results: [],
      totals: EMPTY_TOTALS,
      addResult: (result) =>
        set((state) => ({
          results: [result, ...state.results].slice(0, 50),
          totals: {
            ...state.totals,
            completed: state.totals.completed + 1,
            typingSeconds: state.totals.typingSeconds + (result.durationSeconds ?? 0),
          },
        })),
      markStarted: () =>
        set((state) => ({ totals: { ...state.totals, started: state.totals.started + 1 } })),
      // Chỉ xoá danh sách chi tiết; số đếm trọn đời giữ nguyên (giống Monkeytype:
      // xoá lịch sử không có nghĩa là chưa từng gõ).
      clear: () => set({ results: [] }),
    }),
    { name: 'codetyping-history' },
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
