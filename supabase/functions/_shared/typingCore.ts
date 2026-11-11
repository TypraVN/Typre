/**
 * LUẬT GÕ dùng chung cho trình duyệt và server.
 *
 * Trình duyệt dùng nó để chạy lượt gõ (`src/hooks/useTypingEngine.ts`) và chốt điểm ở màn
 * kết quả; Edge Function `submit-score` dùng nó để CHẠY LẠI bản ghi phím và tự tính điểm
 * thay vì tin con số trình duyệt gửi lên. Một bộ luật duy nhất nên hai bên không bao giờ
 * tính lệch nhau — điểm người chơi thấy đúng bằng điểm lên bảng.
 *
 * File này phải THUẦN: không import gì, không đụng DOM hay Deno. Nó được nạp từ hai môi
 * trường khác nhau (Vite và Deno) và chỉ chạy được ở cả hai khi không phụ thuộc gì.
 */

export type CharStatus = 'pending' | 'correct' | 'incorrect' | 'auto'

/** Phím đặc biệt trong bản ghi. Ký tự thường thì ghi chính nó. */
export const KEY_ENTER = '\n'
export const KEY_TAB = '\t'
export const KEY_BACKSPACE = '\b'

/** Một thao tác trong bản ghi: [mili giây kể từ phím đầu tiên, phím]. */
export type RunAction = [t: number, key: string]

export interface CoreState {
  cursor: number
  statuses: CharStatus[]
  /** Số ký tự đã gõ kể cả sai — cho raw wpm. Tab nhảy qua thụt lề tính đủ số ký tự vượt. */
  typed: number
  /** Strict mode: tổng số lần gõ sai (không để lại ký tự 'incorrect' nào để đếm). */
  strictMisses: number
  /** Strict mode: số lần gõ sai ĐANG NẰM ở chỗ con trỏ, backspace xoá chúng trước. */
  pending: number
}

export type KeyOutcome = 'correct' | 'wrong' | 'none'

export interface KeyStep {
  state: CoreState
  outcome: KeyOutcome
  /** Ký tự đang chờ gõ khi gõ sai — để thống kê phím hay sai. */
  expected?: string
}

export function initialCore(target: string): CoreState {
  return {
    cursor: 0,
    statuses: Array<CharStatus>(target.length).fill('pending'),
    typed: 0,
    strictMisses: 0,
    pending: 0,
  }
}

export function isComplete(state: CoreState, target: string): boolean {
  return state.cursor >= target.length
}

function withStatuses(state: CoreState, updates: Array<[number, CharStatus]>): CharStatus[] {
  const next = [...state.statuses]
  for (const [index, value] of updates) next[index] = value
  return next
}

/** Strict mode gõ sai: tô đỏ ký tự đang chờ, giữ nguyên con trỏ. */
function reject(state: CoreState, expected: string): KeyStep {
  return {
    state: {
      ...state,
      statuses: withStatuses(state, [[state.cursor, 'incorrect']]),
      typed: state.typed + 1,
      strictMisses: state.strictMisses + 1,
      pending: state.pending + 1,
    },
    outcome: 'wrong',
    expected,
  }
}

function typeChar(state: CoreState, char: string, target: string, strict: boolean): KeyStep {
  const expected = target[state.cursor]
  const correct = char === expected
  if (!correct && strict) return reject(state, expected)

  return {
    state: {
      ...state,
      statuses: withStatuses(state, [[state.cursor, correct ? 'correct' : 'incorrect']]),
      typed: state.typed + 1,
      cursor: state.cursor + 1,
      pending: 0,
    },
    outcome: correct ? 'correct' : 'wrong',
    expected: correct ? undefined : expected,
  }
}

/** Enter đúng chỗ xuống dòng thì tự nhảy qua thụt lề của dòng mới ('auto'). */
function typeEnter(state: CoreState, target: string, strict: boolean): KeyStep {
  const expected = target[state.cursor]
  const correct = expected === '\n'
  if (!correct && strict) return reject(state, expected)

  const updates: Array<[number, CharStatus]> = [[state.cursor, correct ? 'correct' : 'incorrect']]
  let cursor = state.cursor + 1
  if (correct) {
    while (cursor < target.length && target[cursor] === ' ') {
      updates.push([cursor, 'auto'])
      cursor += 1
    }
  }

  return {
    state: { ...state, statuses: withStatuses(state, updates), typed: state.typed + 1, cursor, pending: 0 },
    outcome: correct ? 'correct' : 'wrong',
    expected: correct ? undefined : expected,
  }
}

/** Tab nhảy qua cả dải dấu cách; không có dấu cách nào để nhảy thì là gõ sai. */
function typeTab(state: CoreState, target: string, strict: boolean): KeyStep {
  let runEnd = state.cursor
  while (runEnd < target.length && target[runEnd] === ' ') runEnd += 1

  if (runEnd > state.cursor) {
    const updates: Array<[number, CharStatus]> = []
    for (let i = state.cursor; i < runEnd; i += 1) updates.push([i, 'correct'])
    return {
      state: {
        ...state,
        statuses: withStatuses(state, updates),
        typed: state.typed + (runEnd - state.cursor),
        cursor: runEnd,
        pending: 0,
      },
      outcome: 'correct',
    }
  }

  const expected = target[state.cursor]
  if (strict) return reject(state, expected)

  return {
    state: {
      ...state,
      statuses: withStatuses(state, [[state.cursor, 'incorrect']]),
      typed: state.typed + 1,
      cursor: state.cursor + 1,
      pending: 0,
    },
    outcome: 'wrong',
    expected,
  }
}

/**
 * Strict mode: backspace xoá các lần gõ sai đang nằm ở con trỏ trước, xoá hết mới bỏ
 * dấu đỏ; không còn lần nào mới lùi con trỏ. Bàn phím điện thoại đang ghép chữ giữ mọi
 * ký tự sai trong ô nhập — lùi sớm là ô nhập và bài lệch nhau một ký tự.
 */
function typeBackspace(state: CoreState): KeyStep {
  if (state.pending > 0) {
    const pending = state.pending - 1
    const statuses = pending === 0 ? withStatuses(state, [[state.cursor, 'pending']]) : state.statuses
    return { state: { ...state, pending, statuses }, outcome: 'none' }
  }

  if (state.cursor === 0) return { state, outcome: 'none' }

  const cursor = state.cursor - 1
  return { state: { ...state, cursor, statuses: withStatuses(state, [[cursor, 'pending']]) }, outcome: 'none' }
}

/** Áp MỘT phím. Gõ xong bài rồi thì mọi phím đều vô hiệu. */
export function applyKey(state: CoreState, key: string, target: string, strict: boolean): KeyStep {
  if (isComplete(state, target)) return { state, outcome: 'none' }

  if (key === KEY_BACKSPACE) return typeBackspace(state)
  if (key === KEY_ENTER) return typeEnter(state, target, strict)
  if (key === KEY_TAB) return typeTab(state, target, strict)
  return typeChar(state, key, target, strict)
}

/**
 * Độ đều tay từ tốc độ của từng giây: 100% = tốc độ y nhau suốt bài. Dùng hệ số biến
 * thiên (độ lệch chuẩn / trung bình) như Monkeytype. Cần ≥ 2 mẫu mới có ý nghĩa.
 */
export function consistencyOf(samples: number[]): number {
  if (samples.length < 2) return 100

  const mean = samples.reduce((a, b) => a + b, 0) / samples.length
  if (mean <= 0) return 0

  const variance = samples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / samples.length
  const cv = Math.sqrt(variance) / mean
  return Math.max(0, Math.min(100, (1 - cv) * 100))
}

export interface RunStats {
  wpm: number
  cpm: number
  rawWpm: number
  accuracy: number
  consistency: number
  elapsedMs: number
}

/**
 * Điểm của một lượt từ trạng thái cuối, thời gian đã gõ và bản ghi phím.
 *
 * wpm/cpm tính trên ký tự gõ ĐÚNG (5 ký tự = 1 từ); raw tính trên mọi ký tự đã gõ.
 * Strict mode: ký tự đỏ dưới con trỏ ĐÃ nằm trong `strictMisses` — cộng cả hai là đếm đôi.
 */
export function statsOf(
  state: CoreState,
  elapsedMs: number,
  strict: boolean,
  actions: RunAction[],
  target: string,
): RunStats {
  let correctCount = 0
  let incorrectCount = 0
  for (const s of state.statuses) {
    if (s === 'correct') correctCount += 1
    else if (s === 'incorrect') incorrectCount += 1
  }
  const attempted = correctCount + (strict ? state.strictMisses : incorrectCount)

  const minutes = elapsedMs / 60000
  const cpm = minutes > 0 ? correctCount / minutes : 0
  const raw = minutes > 0 ? state.typed / 5 / minutes : 0
  const accuracy = attempted > 0 ? (correctCount / attempted) * 100 : 100

  return {
    wpm: Math.round(cpm / 5),
    cpm: Math.round(cpm),
    rawWpm: Math.round(raw),
    accuracy: Math.round(accuracy),
    consistency: Math.round(consistencyOf(perSecondTyped(actions, elapsedMs, target, strict))),
    elapsedMs,
  }
}

/**
 * Số ký tự gõ được trong từng giây TRỌN VẸN của lượt. Chạy lại bản ghi để biết mỗi phím
 * gõ mấy ký tự (Tab nhảy thụt lề tính cả dải).
 */
function perSecondTyped(actions: RunAction[], elapsedMs: number, target: string, strict: boolean): number[] {
  const seconds = Math.floor(elapsedMs / 1000)
  if (seconds < 1) return []

  const buckets = Array<number>(seconds).fill(0)
  let state = initialCore(target)
  for (const [t, key] of actions) {
    if (t > elapsedMs) break
    const before = state.typed
    state = applyKey(state, key, target, strict).state
    const bucket = Math.floor(t / 1000)
    if (bucket < seconds) buckets[bucket] += state.typed - before
  }
  return buckets
}

export interface ScoredRun {
  stats: RunStats
  completed: boolean
  state: CoreState
}

/**
 * Chạy lại cả lượt từ bản ghi.
 *
 * Phím tới SAU mốc thời gian bị bỏ: đồng hồ là luật, gõ thêm sau giờ không tính. Gõ hết bài
 * thì lượt kết thúc đúng lúc phím cuối; hết giờ thì thời gian đã gõ đúng bằng mốc.
 */
export function scoreRun(target: string, actions: RunAction[], strict: boolean, timeLimitMs: number): ScoredRun {
  let state = initialCore(target)
  let finishedAt: number | null = null

  for (const [t, key] of actions) {
    if (t > timeLimitMs) break
    state = applyKey(state, key, target, strict).state
    if (isComplete(state, target)) {
      finishedAt = t
      break
    }
  }

  const elapsedMs = finishedAt ?? timeLimitMs
  return { stats: statsOf(state, elapsedMs, strict, actions, target), completed: finishedAt !== null, state }
}

// ── Điều kiện lên bảng xếp hạng ───────────────────────────────────────────────

export const MIN_ACCURACY = 75
export const MAX_WPM = 300

export type TimingVerdict = 'robotic' | 'bursts' | null

/**
 * Nhịp gõ có giống người không. Chỉ xét khi đủ mẫu — vài phím thì chẳng nói lên gì.
 *
 *   - `robotic`: khoảng cách giữa các phím đều tăm tắp. Người gõ luôn lúc nhanh lúc chậm
 *     (hệ số biến thiên thường 0,4–0,8); script gõ đều thì gần 0.
 *   - `bursts`: quá nhiều phím tới cùng lúc. Một hai cặp phím đè nhau khi gõ nhanh là
 *     bình thường; cả mảng ký tự cùng một mili giây là dán code hoặc bàn phím điện thoại
 *     tự chèn cả từ (gợi ý, tự sửa) — không phải tốc độ gõ của người.
 *
 * Ngưỡng cố ý rộng: chặn nhầm người thật tệ hơn để lọt một lượt khả nghi.
 */
export function judgeTiming(actions: RunAction[], elapsedMs: number): TimingVerdict {
  const times = actions.filter(([t]) => t <= elapsedMs).map(([t]) => t)
  if (times.length < 21) return null

  const gaps: number[] = []
  for (let i = 1; i < times.length; i += 1) gaps.push(times[i] - times[i - 1])

  const instant = gaps.filter((g) => g < 8).length
  if (instant / gaps.length > 0.2) return 'bursts'

  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length
  if (mean <= 0) return 'bursts'
  const sd = Math.sqrt(gaps.reduce((s, g) => s + (g - mean) ** 2, 0) / gaps.length)
  if (sd / mean < 0.15) return 'robotic'

  return null
}
