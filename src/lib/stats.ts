import type { DailyLog, TypingResult } from '../store/useHistoryStore'
import { toDateKey } from './xp'

export interface BestEntry {
  wpm: number
  accuracy: number
}

/** ngôn ngữ → mốc thời gian → kỷ lục. Thiếu key = chưa từng gõ ở ô đó. */
export type BestsTable = Record<string, Record<number, BestEntry>>

export interface StatsSummary {
  /** Số lần gõ đã lưu chi tiết (tối đa 50) — khác với tổng trọn đời. */
  sampleCount: number
  avgWpm: number
  bestWpm: number
  avgAccuracy: number
}

export function summarize(results: TypingResult[]): StatsSummary {
  if (results.length === 0) return { sampleCount: 0, avgWpm: 0, bestWpm: 0, avgAccuracy: 0 }

  let wpmSum = 0
  let accSum = 0
  let best = 0
  for (const r of results) {
    wpmSum += r.wpm
    accSum += r.accuracy
    if (r.wpm > best) best = r.wpm
  }

  return {
    sampleCount: results.length,
    avgWpm: Math.round(wpmSum / results.length),
    bestWpm: best,
    avgAccuracy: Math.round(accSum / results.length),
  }
}

/**
 * Kỷ lục theo ngôn ngữ × mốc thời gian. Bỏ qua các lần gõ cũ không có `timeLimit`
 * (lưu trước khi thêm field đó) — không đoán mốc cho chúng, thà để ô trống.
 * Cùng wpm thì giữ bản có accuracy cao hơn.
 */
export function computeBests(results: TypingResult[]): BestsTable {
  const table: BestsTable = {}

  for (const r of results) {
    if (typeof r.timeLimit !== 'number') continue

    const byTime = (table[r.language] ??= {})
    const current = byTime[r.timeLimit]

    if (!current || r.wpm > current.wpm || (r.wpm === current.wpm && r.accuracy > current.accuracy)) {
      byTime[r.timeLimit] = { wpm: r.wpm, accuracy: r.accuracy }
    }
  }

  return table
}

/** Một ngày trên biểu đồ tiến bộ. `runs === 0` là ngày nghỉ, không có số liệu. */
export interface DailyPoint {
  dateKey: string
  runs: number
  avgWpm: number
  bestWpm: number
  avgAccuracy: number
}

/**
 * Chuỗi `days` ngày liên tiếp KẾT THÚC ở hôm nay, kể cả ngày không gõ.
 *
 * Phải trả về cả ngày trống chứ không chỉ ngày có dữ liệu: bỏ qua ngày nghỉ sẽ nén trục
 * thời gian lại, làm "gõ 5 ngày liền" và "gõ 5 ngày rải trong hai tháng" trông y hệt nhau.
 * Ngày trống để `runs: 0` để biểu đồ NGẮT đường ở đó — vẽ xuống 0 thì trông như tụt tốc độ.
 */
export function dailySeries(daily: DailyLog, days: number, today: Date = new Date()): DailyPoint[] {
  const points: DailyPoint[] = []

  for (let offset = days - 1; offset >= 0; offset--) {
    // Dựng từ y/m/d thay vì trừ mili-giây: ngày đổi giờ mùa hè dài 23 hoặc 25 tiếng,
    // trừ 86400000 sẽ nhảy sai một ngày.
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const dateKey = toDateKey(date)
    const stat = daily?.[dateKey]

    points.push(
      stat && stat.runs > 0
        ? {
            dateKey,
            runs: stat.runs,
            avgWpm: Math.round(stat.wpmSum / stat.runs),
            bestWpm: stat.bestWpm,
            avgAccuracy: Math.round(stat.accuracySum / stat.runs),
          }
        : { dateKey, runs: 0, avgWpm: 0, bestWpm: 0, avgAccuracy: 0 },
    )
  }

  return points
}

/** Giây → "hh:mm:ss" (giống ô "time typing" của Monkeytype). */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return [hh, mm, ss].map((n) => n.toString().padStart(2, '0')).join(':')
}

/** "04 Aug 2026" — ngày tham gia, không cần giờ. */
export function formatJoinDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
