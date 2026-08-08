import type { TypingResult } from '../store/useHistoryStore'

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
