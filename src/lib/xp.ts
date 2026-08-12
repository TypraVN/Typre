/**
 * XP và cấp độ.
 *
 * Tách riêng khỏi store và UI để công thức là hàm thuần: đổi cách tính chỉ sửa ở đây,
 * và kiểm được bằng cách gọi thẳng với số liệu cụ thể.
 *
 * Nguyên tắc: thưởng theo KHỐI LƯỢNG GÕ ĐÚNG, không thưởng theo tốc độ thô. Gõ chậm mà
 * chắc vẫn lên cấp; gõ nhanh mà sai thì base tự nhỏ đi vì base đếm ký tự đúng.
 */

/** Nhân theo độ chính xác. Chỉ có thưởng, không có phạt — phạt đã nằm trong base. */
export function accuracyMultiplier(accuracy: number): number {
  if (accuracy >= 100) return 1.5
  if (accuracy >= 95) return 1.2
  return 1
}

/** Thưởng chuỗi ngày: 10 XP mỗi ngày, chặn trần ở 10 ngày để không phình vô hạn. */
export const STREAK_CAP = 10

export interface XpInput {
  wpm: number
  accuracy: number
  /** Thời lượng THẬT của lượt gõ (giây), ngắn hơn mốc nếu gõ xong sớm. */
  durationSeconds: number
  /** Gõ hết bài trước khi hết giờ. */
  finishedEarly: boolean
  /** Lượt này phá kỷ lục cá nhân của cặp (ngôn ngữ × mốc thời gian). */
  newRecord: boolean
  /** Chuỗi ngày gõ liên tục TÍNH CẢ hôm nay. */
  streakDays: number
}

export interface XpBreakdown {
  base: number
  accuracyBonus: number
  finishBonus: number
  recordBonus: number
  streakBonus: number
  total: number
}

export const FINISH_BONUS = 25
export const RECORD_BONUS = 50

/**
 * `base` = số TỪ gõ đúng = wpm × số phút. Dùng wpm × thời lượng thay vì đếm ký tự để
 * không phải sửa engine: wpm đã là (ký tự đúng / 5) / phút, nhân lại ra đúng số từ.
 *
 * Lượt không hợp lệ (wpm ngoài 1-300 hoặc accuracy < 50) trả 0 — cùng ngưỡng với điều
 * kiện lên bảng xếp hạng, để không có đường kiếm XP bằng cách gõ bừa.
 */
export function xpForRun(input: XpInput): XpBreakdown {
  const empty: XpBreakdown = {
    base: 0,
    accuracyBonus: 0,
    finishBonus: 0,
    recordBonus: 0,
    streakBonus: 0,
    total: 0,
  }

  const eligible =
    input.wpm > 0 && input.wpm <= 300 && input.accuracy >= 50 && input.durationSeconds > 0

  if (!eligible) return empty

  const base = Math.round((input.wpm * input.durationSeconds) / 60)
  const withMultiplier = Math.round(base * accuracyMultiplier(input.accuracy))

  const accuracyBonus = withMultiplier - base
  const finishBonus = input.finishedEarly ? FINISH_BONUS : 0
  const recordBonus = input.newRecord ? RECORD_BONUS : 0
  const streakBonus = 10 * Math.min(Math.max(input.streakDays, 0), STREAK_CAP)

  return {
    base,
    accuracyBonus,
    finishBonus,
    recordBonus,
    streakBonus,
    total: base + accuracyBonus + finishBonus + recordBonus + streakBonus,
  }
}

/** XP cần để đi từ `level` lên `level + 1`. Mốc sau nặng hơn mốc trước. */
export function xpToNext(level: number): number {
  return 100 + 25 * (Math.max(level, 1) - 1)
}

/** Tổng XP tích luỹ cần để ĐẠT `level`. Level 1 = 0 XP. */
export function xpForLevel(level: number): number {
  const steps = Math.max(level, 1) - 1
  return 100 * steps + 12.5 * steps * (steps - 1)
}

export interface LevelInfo {
  level: number
  /** XP đã có trong cấp hiện tại. */
  into: number
  /** XP cần để lên cấp kế tiếp. */
  needed: number
  /** 0-100, để vẽ thanh tiến trình. */
  percent: number
}

/**
 * Giải trực tiếp bằng công thức nghiệm bậc hai thay vì lặp tăng dần: XP có thể lên tới
 * hàng trăm nghìn sau vài trăm lượt gõ, và hàm này chạy ở mỗi lần render.
 *
 * total(n) = 12.5n² + 87.5n với n = level - 1  →  n = (-87.5 + sqrt(87.5² + 50·xp)) / 25
 */
export function levelFromXp(xp: number): LevelInfo {
  const safeXp = Number.isFinite(xp) && xp > 0 ? xp : 0
  const n = Math.floor((-87.5 + Math.sqrt(87.5 * 87.5 + 50 * safeXp)) / 25)
  const level = n + 1

  const into = safeXp - xpForLevel(level)
  const needed = xpToNext(level)

  return {
    level,
    into,
    needed,
    percent: Math.min(100, Math.max(0, Math.round((into / needed) * 100))),
  }
}

/** Khoá kỷ lục cá nhân: mỗi cặp (ngôn ngữ × mốc thời gian) là một kỷ lục riêng. */
export function bestKey(language: string, timeLimit: number): string {
  return `${language}|${timeLimit}`
}

/**
 * Chuỗi ngày mới sau một lượt gõ hôm nay. `lastRunDate` dạng YYYY-MM-DD theo giờ MÁY
 * (không dùng UTC: người dùng nghĩ theo ngày của họ, gõ lúc 1h sáng vẫn là "hôm nay").
 */
export function nextStreak(lastRunDate: string | null, streakDays: number, today: string): number {
  if (lastRunDate === today) return Math.max(streakDays, 1)

  const yesterday = new Date(today + 'T00:00:00')
  yesterday.setDate(yesterday.getDate() - 1)

  return lastRunDate === toDateKey(yesterday) ? streakDays + 1 : 1
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
