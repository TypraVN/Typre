import type { TypingResult } from '../store/useHistoryStore'

/**
 * "Luyện điểm yếu": chọn bài có mật độ cao những ký tự người dùng HAY GÕ SAI.
 *
 * Dữ liệu đã có sẵn — mỗi lượt gõ đều lưu `mistakeCounts` — nhưng trước giờ không dùng
 * vào việc gì. Với người gõ code thì điểm yếu rất cụ thể: `{}`, `=>`, `::`, `&&`, `?.`
 * chứ không phải chữ cái, nên nhắm đúng vào chúng hiệu quả hơn gõ bài ngẫu nhiên.
 *
 * Cố ý CHỈ đọc `results` (50 lượt gần nhất) thay vì tổng trọn đời: điểm yếu phải là
 * điểm yếu HIỆN TẠI. Sửa được tật cũ rồi thì nó tự mờ đi và nhường chỗ cho tật mới.
 */

/** Cộng dồn số lần gõ sai theo từng ký tự trên các lượt gần đây. */
export function aggregateMistakes(results: TypingResult[]): Record<string, number> {
  const totals: Record<string, number> = {}

  for (const result of results) {
    for (const [char, count] of Object.entries(result.mistakeCounts)) {
      totals[char] = (totals[char] ?? 0) + count
    }
  }

  return totals
}

/**
 * Bao nhiêu ký tự yếu thì lấy. Lấy quá nhiều thì gần như bài nào cũng "trúng" và việc
 * nhắm mất tác dụng; quá ít thì cứ quay đúng vài bài.
 */
export const WEAK_CHAR_LIMIT = 8

/** Ký tự sai nhiều nhất, nhiều → ít. Bỏ ký tự chỉ sai 1 lần: nhiễu, không phải tật. */
export function topWeakChars(results: TypingResult[], limit = WEAK_CHAR_LIMIT): string[] {
  return Object.entries(aggregateMistakes(results))
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([char]) => char)
}

/**
 * Điểm của một bài với bộ ký tự yếu: đếm số lần các ký tự đó xuất hiện, có nhân trọng
 * số theo mức độ hay sai, rồi CHIA CHO ĐỘ DÀI bài.
 *
 * Phải chia độ dài, không thì bài dài luôn thắng chỉ vì nó dài — mà mục tiêu là mật độ
 * ký tự yếu cao, tức gặp chúng nhiều lần trên mỗi phút gõ.
 */
export function scoreSnippet(code: string, weights: Record<string, number>): number {
  if (code.length === 0) return 0

  let hits = 0
  for (const char of code) {
    hits += weights[char] ?? 0
  }

  return hits / code.length
}

/** Trọng số từ danh sách ký tự yếu: ký tự đứng đầu nặng nhất. */
export function weightsFor(weakChars: string[]): Record<string, number> {
  const weights: Record<string, number> = {}

  weakChars.forEach((char, index) => {
    weights[char] = weakChars.length - index
  })

  return weights
}
