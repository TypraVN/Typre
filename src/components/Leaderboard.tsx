import { useEffect, useState } from 'react'
import { Crown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  fetchLeaderboardPage,
  fetchMyRank,
  PAGE_SIZE,
  type ScoreRow,
} from '../lib/leaderboard'
import { isLeaderboardEnabled } from '../lib/supabase'
import { Avatar } from './Avatar'
import type { AppUser } from '../lib/auth'
import type { SnippetLanguage } from '../data/types'
import type { Translation } from '../i18n/translations'

interface LeaderboardProps {
  languages: SnippetLanguage[]
  timeLimits: readonly number[]
  currentUser: AppUser | null
  /** Ngôn ngữ/thời gian đang luyện — mở bảng đúng ở đó để vừa gửi điểm là thấy ngay. */
  defaultLanguage: SnippetLanguage
  defaultTimeLimit: number
  t: Translation
}

const FILTER_BTN =
  'w-full px-3 py-1.5 text-sm text-left rounded cursor-pointer transition-colors duration-150 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
const FILTER_BTN_ACTIVE =
  'w-full px-3 py-1.5 text-sm text-left rounded cursor-pointer transition-colors duration-150 bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium'

/** Màu huy chương cho 3 hạng đầu, còn lại dùng màu chữ thường. */
function rankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-500 dark:text-yellow-400'
  if (rank === 2) return 'text-zinc-400 dark:text-zinc-300'
  if (rank === 3) return 'text-amber-600 dark:text-amber-500'
  return 'text-zinc-500'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function Leaderboard({
  languages,
  timeLimits,
  currentUser,
  defaultLanguage,
  defaultTimeLimit,
  t,
}: LeaderboardProps) {
  const [language, setLanguage] = useState<SnippetLanguage>(defaultLanguage)
  const [timeLimit, setTimeLimit] = useState<number>(defaultTimeLimit)
  const [page, setPage] = useState(0)

  const [rows, setRows] = useState<ScoreRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myRank, setMyRank] = useState<{ rank: number | null; wpm: number | null }>({
    rank: null,
    wpm: null,
  })

  // Đổi filter thì về trang 1, nếu không sẽ ở trang 3 của bảng chỉ có 1 trang.
  useEffect(() => {
    setPage(0)
  }, [language, timeLimit])

  useEffect(() => {
    if (!isLeaderboardEnabled) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchLeaderboardPage(language, timeLimit, page).then((res) => {
      if (cancelled) return
      setRows(res.rows)
      setTotal(res.total)
      setError(res.error)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [language, timeLimit, page])

  useEffect(() => {
    if (!isLeaderboardEnabled || !currentUser) {
      setMyRank({ rank: null, wpm: null })
      return
    }
    let cancelled = false
    fetchMyRank(language, timeLimit, currentUser.id).then((res) => {
      if (!cancelled) setMyRank(res)
    })
    return () => {
      cancelled = true
    }
  }, [language, timeLimit, currentUser])

  if (!isLeaderboardEnabled) {
    return (
      <div className="max-w-md text-center font-mono text-sm text-zinc-500 border border-zinc-300 dark:border-zinc-700 rounded-lg p-6">
        {t.leaderboardOffline}
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-6">
      {/* Sidebar filter */}
      <aside className="sm:w-40 shrink-0 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="px-3 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
            {t.langFilterLabel}
          </div>
          {languages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={lang === language ? FILTER_BTN_ACTIVE : FILTER_BTN}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <div className="px-3 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
            {t.timeFilterLabel}
          </div>
          {timeLimits.map((tl) => (
            <button
              key={tl}
              type="button"
              onClick={() => setTimeLimit(tl)}
              className={timeLimit === tl ? FILTER_BTN_ACTIVE : FILTER_BTN}
            >
              time {tl}
            </button>
          ))}
        </div>
      </aside>

      {/* Bảng */}
      <div className="flex-1 min-w-0 font-mono text-sm">
        <div className="flex items-center justify-between mb-2 text-xs text-zinc-500">
          <span>
            {total} {total === 1 ? t.playerCountOne : t.playerCount}
            {myRank.rank !== null && (
              <span className="ml-3 text-orange-600 dark:text-orange-400">
                {t.yourRank}: #{myRank.rank} · {myRank.wpm} wpm
              </span>
            )}
            {currentUser && myRank.rank === null && (
              <span className="ml-3">
                {t.yourRank}: {t.unranked}
              </span>
            )}
          </span>

          {totalPages > 1 && (
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                title={t.prevPage}
                className="p-1 rounded cursor-pointer transition-colors duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="tabular-nums px-1">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                title={t.nextPage}
                className="p-1 rounded cursor-pointer transition-colors duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </span>
          )}
        </div>

        {loading && <div className="text-center text-zinc-500 py-10">{t.leaderboardLoading}</div>}

        {!loading && error && (
          <div className="text-center text-red-500 dark:text-red-400 py-10">{error}</div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="text-center text-zinc-500 py-10">{t.leaderboardEmpty}</div>
        )}

        {!loading && !error && rows.length > 0 && (
          <table key={`${language}-${timeLimit}-${page}`} className="w-full animate-fade-in">
            <thead>
              <tr className="text-zinc-500 text-xs">
                <th className="py-2 pr-3 text-left font-normal w-10">#</th>
                <th className="py-2 pr-3 text-left font-normal">{t.nameCol}</th>
                <th className="py-2 pr-3 text-right font-normal">wpm</th>
                <th className="py-2 pr-3 text-right font-normal">{t.accCol}</th>
                <th className="py-2 pr-3 text-right font-normal hidden md:table-cell">raw</th>
                <th className="py-2 pr-3 text-right font-normal hidden md:table-cell">
                  consistency
                </th>
                <th className="py-2 text-right font-normal hidden sm:table-cell">{t.dateCol}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rank = page * PAGE_SIZE + i + 1
                // So theo user_id, không theo tên — tên có thể trùng giữa các tài khoản.
                const isMe = currentUser !== null && row.user_id === currentUser.id

                return (
                  <tr
                    key={row.id}
                    className={`border-t border-zinc-200 dark:border-zinc-800 ${
                      isMe
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        : 'text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    <td className={`py-2 pr-3 tabular-nums ${isMe ? '' : rankColor(rank)}`}>
                      {rank === 1 ? (
                        <span className="inline-flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" />1
                        </span>
                      ) : (
                        rank
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <span className="flex items-center gap-2">
                        <Avatar src={row.avatar_url} name={row.display_name} size={20} />
                        <span className="truncate max-w-[10rem]">{row.display_name}</span>
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums font-bold">{row.wpm}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{row.accuracy}%</td>
                    <td className="py-2 pr-3 text-right tabular-nums hidden md:table-cell">
                      {row.raw_wpm ?? '—'}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums hidden md:table-cell">
                      {row.consistency !== null ? `${row.consistency}%` : '—'}
                    </td>
                    <td className="py-2 text-right text-xs text-zinc-500 hidden sm:table-cell">
                      {formatDate(row.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
