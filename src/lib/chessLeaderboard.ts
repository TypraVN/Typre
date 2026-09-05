import { getSupabase } from './supabase'

export interface ChessPlayerInput {
  id: string
  name: string
  avatarUrl: string | null
}

export interface SubmitChessResultInput {
  /**
   * Định danh MỘT ván đấu, giống nhau ở CẢ HAI người chơi — xem `useChessRoom`
   * (`sendGameStart`/`onGameStart`) để biết cách hai máy đồng thuận cùng một giá trị.
   * Đây là khoá chặn cộng điểm hai lần ở phía SQL (`record_chess_result`).
   */
  gameId: string
  white: ChessPlayerInput
  black: ChessPlayerInput
  winner: 'w' | 'b' | 'draw'
  /** Mã lý do ổn định (không dịch), để lưu — xem `resultReasonCode` trong ChessMode.tsx. */
  reason: string
}

/**
 * Ghi kết quả một ván đấu online qua RPC `record_chess_result` — không insert thẳng
 * bảng nào, vì client không có quyền (xem chú thích trong add-chess-leaderboard.sql).
 */
export async function submitChessResult(
  input: SubmitChessResultInput,
): Promise<{ error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.rpc('record_chess_result', {
    p_game_id: input.gameId,
    p_white_id: input.white.id,
    p_black_id: input.black.id,
    p_white_name: input.white.name,
    p_black_name: input.black.name,
    p_white_avatar: input.white.avatarUrl,
    p_black_avatar: input.black.avatarUrl,
    p_winner: input.winner,
    p_reason: input.reason,
  })

  return { error: error ? error.message : null }
}

export interface ChessRatingRow {
  user_id: string
  display_name: string
  avatar_url: string | null
  rating: number
  games: number
  wins: number
  losses: number
  draws: number
}

/**
 * Chưa chạy `add-chess-leaderboard.sql` thì bảng `chess_ratings` không tồn tại —
 * PostgREST trả `PGRST205` (mã thực tế nhận được), Postgres trả `42P01` nếu lọt xuống
 * tầng SQL. Cùng danh sách mã với `leaderboard.ts` — xem ghi chú ở đó.
 */
const MISSING_TABLE_CODES = ['PGRST205', '42P01']

export const MISSING_CHESS_TABLES = 'missing-chess-tables'

/** Bảng xếp hạng cờ vua: đọc thẳng `chess_ratings`, đã là 1 dòng/người sẵn. */
export async function fetchChessLeaderboard(
  limit = 50,
): Promise<{ rows: ChessRatingRow[]; error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { rows: [], error: 'not-configured' }

  const { data, error } = await supabase
    .from('chess_ratings')
    .select('*')
    .order('rating', { ascending: false })
    .limit(limit)

  if (error && MISSING_TABLE_CODES.includes((error as { code?: string }).code ?? '')) {
    return { rows: [], error: MISSING_CHESS_TABLES }
  }

  return { rows: (data as ChessRatingRow[]) ?? [], error: error ? error.message : null }
}
