import { useEffect, useState } from 'react'
import { Crown, X } from 'lucide-react'
import { MISSING_CHESS_TABLES, fetchChessLeaderboard, type ChessRatingRow } from '../lib/chessLeaderboard'
import { Avatar } from './Avatar'
import type { Translation } from '../i18n/translations'

interface ChessLeaderboardDialogProps {
  onClose: () => void
  t: Translation
}

/** Cùng quy ước huy chương với bảng xếp hạng gõ code — top 3 có màu riêng. */
function rankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-500 dark:text-yellow-400'
  if (rank === 2) return 'text-zinc-400 dark:text-zinc-300'
  if (rank === 3) return 'text-amber-600 dark:text-amber-500'
  return 'text-zinc-500'
}

/**
 * Bảng xếp hạng ELO cờ vua — chỉ tính ván ONLINE giữa hai người đã đăng nhập (xem
 * `add-chess-leaderboard.sql`). Cố tình đơn giản hơn hẳn `Leaderboard.tsx` (không lọc
 * ngôn ngữ/thời gian/kỳ hạn): cờ vua không có khái niệm "ngôn ngữ đang luyện" hay
 * "khoảng thời gian" như gõ code, chỉ có một bảng ELO duy nhất.
 */
export function ChessLeaderboardDialog({ onClose, t }: ChessLeaderboardDialogProps) {
  const [rows, setRows] = useState<ChessRatingRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchChessLeaderboard(50).then((result) => {
      if (cancelled) return
      setRows(result.rows)
      setError(result.error)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.chessLeaderboardTitle}
        className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 animate-pop-in"
      >
        <button
          type="button"
          onClick={onClose}
          title={t.close}
          aria-label={t.close}
          className="absolute top-3 right-3 p-1 rounded cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors duration-150"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
          <Crown className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <h2 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {t.chessLeaderboardTitle}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.chessLeaderboardSubtitle}</p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-2 py-2">
          {rows === null && !error && (
            <div className="px-4 py-8 text-center font-mono text-sm text-zinc-500">
              {t.leaderboardLoading}
            </div>
          )}

          {error && (
            <div className="px-4 py-8 text-center font-mono text-sm text-zinc-500">
              {error === MISSING_CHESS_TABLES ? t.chessLeaderboardMigrationMissing : t.leaderboardOffline}
            </div>
          )}

          {!error && rows && rows.length === 0 && (
            <div className="px-4 py-8 text-center font-mono text-sm text-zinc-500">
              {t.chessLeaderboardEmpty}
            </div>
          )}

          {rows?.map((row, i) => (
            <div
              key={row.user_id}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <div className={`w-6 shrink-0 text-right font-mono text-sm font-bold ${rankColor(i + 1)}`}>
                {i + 1}
              </div>
              <Avatar src={row.avatar_url} name={row.display_name} size={28} />
              <div className="flex-1 min-w-0 truncate text-sm text-zinc-800 dark:text-zinc-100">
                {row.display_name}
              </div>
              <div className="shrink-0 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                {row.wins}-{row.losses}-{row.draws}
              </div>
              <div className="shrink-0 w-12 text-right font-mono text-sm font-bold text-orange-600 dark:text-orange-400">
                {row.rating}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
