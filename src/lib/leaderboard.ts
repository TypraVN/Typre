import { getSupabase } from './supabase'
import type { SnippetLanguage } from '../data/types'
import type { AppUser } from './auth'

export interface ScoreRow {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  language: SnippetLanguage
  time_limit: number
  wpm: number
  cpm: number
  // Nullable: điểm gửi trước khi thêm 2 cột này sẽ là null → UI hiện "—".
  raw_wpm: number | null
  consistency: number | null
  accuracy: number
  created_at: string
}

export interface SubmitScoreInput {
  user: AppUser
  language: SnippetLanguage
  timeLimit: number
  wpm: number
  cpm: number
  rawWpm: number
  consistency: number
  accuracy: number
}

// Khớp với ràng buộc trong supabase/schema.sql — chặn sớm ở client để đỡ gọi mạng vô ích.
const MIN_ACCURACY = 50
const MAX_WPM = 300

export type IneligibleReason = 'low-accuracy' | 'wpm-out-of-range' | null

/** Trả về lý do KHÔNG đủ điều kiện, hoặc null nếu hợp lệ. */
export function scoreIneligibleReason(wpm: number, accuracy: number): IneligibleReason {
  if (accuracy < MIN_ACCURACY) return 'low-accuracy'
  if (wpm <= 0 || wpm > MAX_WPM) return 'wpm-out-of-range'
  return null
}

export function isScoreEligible(wpm: number, accuracy: number): boolean {
  return scoreIneligibleReason(wpm, accuracy) === null
}

export async function submitScore(input: SubmitScoreInput): Promise<{ error: string | null }> {
  if (!isScoreEligible(input.wpm, input.accuracy)) return { error: 'not-eligible' }

  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.from('scores').insert({
    user_id: input.user.id,
    display_name: input.user.displayName,
    avatar_url: input.user.avatarUrl,
    language: input.language,
    time_limit: input.timeLimit,
    wpm: input.wpm,
    cpm: input.cpm,
    raw_wpm: input.rawWpm,
    consistency: input.consistency,
    accuracy: input.accuracy,
  })

  return { error: error ? error.message : null }
}

export const PAGE_SIZE = 10

export interface LeaderboardPage {
  rows: ScoreRow[]
  /** Tổng số NGƯỜI trong bảng (không phải tổng số lần gõ) — dùng để tính số trang. */
  total: number
  error: string | null
}

/**
 * Khoảng thời gian của bảng xếp hạng. Mỗi khoảng là một view riêng đã gộp sẵn 1
 * dòng/người TRONG khoảng đó — xem `supabase/add-leaderboard-periods.sql` để biết vì
 * sao không thể lọc thời gian trên view toàn thời gian.
 */
export const PERIODS = ['all', 'week', 'today'] as const

export type Period = (typeof PERIODS)[number]

const PERIOD_VIEW: Record<Period, string> = {
  all: 'leaderboard',
  week: 'leaderboard_week',
  today: 'leaderboard_today',
}

/**
 * Chưa chạy SQL tạo view tuần/ngày thì báo lỗi "không có bảng". Hai mã vì hai tầng
 * khác nhau: PostgREST trả `PGRST205` (không thấy trong schema cache — đây là mã thực
 * tế nhận được), còn Postgres trả `42P01` nếu lọt xuống tới tầng SQL.
 */
const MISSING_TABLE_CODES = ['PGRST205', '42P01']

export const MISSING_PERIOD_VIEW = 'missing-period-view'

/**
 * Đọc từ view đã gộp (mỗi người 1 dòng, điểm cao nhất) thay vì bảng `scores` thô —
 * nếu đọc bảng thô thì 1 người gõ nhiều lần sẽ chiếm hết các hạng đầu.
 */
export async function fetchLeaderboardPage(
  language: SnippetLanguage,
  timeLimit: number,
  page = 0,
  period: Period = 'all',
  /**
   * Chỉ lấy những người này (bảng bạn bè). `undefined` = cả thiên hạ.
   *
   * Mảng RỖNG khác `undefined`: rỗng nghĩa là "đã lọc và không có ai", phải trả bảng
   * trống chứ không được rơi về bảng toàn cầu — không thì người chưa có bạn nào bấm
   * "friends" lại thấy nguyên bảng chung và tưởng lọc không hoạt động.
   */
  userIds?: string[],
): Promise<LeaderboardPage> {
  const supabase = await getSupabase()
  if (!supabase) return { rows: [], total: 0, error: 'not-configured' }

  if (userIds !== undefined && userIds.length === 0) {
    return { rows: [], total: 0, error: null }
  }

  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from(PERIOD_VIEW[period])
    .select('*', { count: 'exact' })
    .eq('language', language)
    .eq('time_limit', timeLimit)

  if (userIds !== undefined) query = query.in('user_id', userIds)

  const { data, error, count } = await query
    .order('wpm', { ascending: false })
    .order('created_at', { ascending: true })
    .range(from, to)

  // View tuần/ngày là migration THÊM SAU: ai chưa chạy SQL sẽ nhận 42P01. Báo rõ
  // thay vì để UI hiện "bảng trống" — trống và thiếu-migration là hai chuyện khác nhau.
  if (error && MISSING_TABLE_CODES.includes((error as { code?: string }).code ?? '')) {
    return { rows: [], total: 0, error: MISSING_PERIOD_VIEW }
  }

  return {
    rows: (data as ScoreRow[]) ?? [],
    total: count ?? 0,
    error: error ? error.message : null,
  }
}

/**
 * Toàn bộ kỷ lục của một người (mỗi ngôn ngữ × mốc thời gian một dòng) — dùng cho
 * trang profile công khai. Đọc từ view `leaderboard` nên đã sẵn là bản tốt nhất.
 */
export async function fetchUserBests(userId: string): Promise<ScoreRow[]> {
  const supabase = await getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', userId)
    .order('wpm', { ascending: false })

  return (data as ScoreRow[]) ?? []
}

/** Thứ hạng của chính mình trong toàn bảng (không chỉ trang đang xem). */
export async function fetchMyRank(
  language: SnippetLanguage,
  timeLimit: number,
  userId: string,
  period: Period = 'all',
  /** Cùng ý nghĩa như ở `fetchLeaderboardPage`: giới hạn trong nhóm bạn bè. */
  userIds?: string[],
): Promise<{ rank: number | null; wpm: number | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { rank: null, wpm: null }

  const view = PERIOD_VIEW[period]

  const { data: mine } = await supabase
    .from(view)
    .select('wpm')
    .eq('language', language)
    .eq('time_limit', timeLimit)
    .eq('user_id', userId)
    .maybeSingle()

  if (!mine) return { rank: null, wpm: null }

  // Số người có wpm cao hơn mình + 1 = hạng của mình.
  let ahead = supabase
    .from(view)
    .select('*', { count: 'exact', head: true })
    .eq('language', language)
    .eq('time_limit', timeLimit)
    .gt('wpm', (mine as { wpm: number }).wpm)

  if (userIds !== undefined) ahead = ahead.in('user_id', userIds)

  const { count } = await ahead

  return { rank: (count ?? 0) + 1, wpm: (mine as { wpm: number }).wpm }
}
