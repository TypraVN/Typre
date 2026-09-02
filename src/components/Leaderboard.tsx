import { useEffect, useMemo, useState } from 'react'
import { Crown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  fetchLeaderboardPage,
  fetchMyRank,
  MISSING_PERIOD_VIEW,
  PAGE_SIZE,
  PERIODS,
  type Period,
  type ScoreRow,
} from '../lib/leaderboard'
import { isLeaderboardEnabled } from '../lib/supabase'
import { Avatar } from './Avatar'
import { PlayerSearch } from './PlayerSearch'
import { levelFromXp } from '../lib/xp'
import { fetchXpFor } from '../lib/xpSync'
import { listFriends } from '../lib/friends'
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

/**
 * Ngôn ngữ xếp lưới 2 cột chứ không phải một cột dọc: 14 mục một cột cao hơn 540px,
 * đứng đầu cột lọc là đẩy hết các nhóm sau xuống dưới mép màn hình. Padding ngang hẹp
 * hơn các nút khác (px-2) để "javascript"/"typescript" không bị xuống dòng trong ô hẹp.
 */
const FILTER_BTN =
  'w-full px-2 py-1.5 text-sm text-left rounded cursor-pointer transition-colors duration-150 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
const FILTER_BTN_ACTIVE =
  'w-full px-2 py-1.5 text-sm text-left rounded cursor-pointer transition-colors duration-150 bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium'

/**
 * Thời gian cố ý làm dạng "segmented control" nằm ngang, KHÁC hẳn danh sách dọc của
 * ngôn ngữ: hai nhóm cạnh nhau cùng một kiểu nút thì đọc như một danh sách dài liền
 * mạch và người dùng tưởng "time 60" cũng là một ngôn ngữ.
 */
const TIME_BTN =
  'flex-1 py-1 text-sm text-center rounded-md cursor-pointer transition-colors duration-150 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
const TIME_BTN_ACTIVE =
  'flex-1 py-1 text-sm text-center rounded-md cursor-pointer transition-colors duration-150 bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 font-medium shadow-sm'

const GROUP_LABEL =
  'px-3 text-[11px] font-mono font-bold text-orange-600 dark:text-orange-500 uppercase tracking-widest'

const PERIOD_BTN =
  'w-full px-2 py-1 text-sm text-left rounded-md cursor-pointer transition-colors duration-150 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
const PERIOD_BTN_ACTIVE =
  'w-full px-2 py-1 text-sm text-left rounded-md cursor-pointer transition-colors duration-150 bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 font-medium shadow-sm'

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
  const [period, setPeriod] = useState<Period>('all')
  const [page, setPage] = useState(0)

  /** 'friends' = chỉ mình + bạn bè đã kết nối. Chỉ có nghĩa khi đã đăng nhập. */
  const [scope, setScope] = useState<'all' | 'friends'>('all')
  /**
   * `null` = chưa đọc xong danh sách bạn. Phân biệt với `[]` (đã đọc, không có ai) để
   * không gọi truy vấn với danh sách rỗng rồi hiện "bảng trống" trong lúc còn đang tải.
   */
  const [friendIds, setFriendIds] = useState<string[] | null>(null)

  const [rows, setRows] = useState<ScoreRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myRank, setMyRank] = useState<{ rank: number | null; wpm: number | null }>({
    rank: null,
    wpm: null,
  })
  /**
   * XP của những người đang hiện trên trang, tra riêng theo `user_id`.
   *
   * Cố ý KHÔNG join `profiles` vào view xếp hạng: join thì phải tạo lại cả 3 view mỗi
   * lần thêm cột, còn cách này chỉ cần thêm cột `xp` là xong. Một truy vấn phụ cho 10
   * dòng là rẻ.
   */
  const [xpByUser, setXpByUser] = useState<Record<string, number>>({})

  // Đổi filter thì về trang 1, nếu không sẽ ở trang 3 của bảng chỉ có 1 trang.
  useEffect(() => {
    setPage(0)
  }, [language, timeLimit, period, scope])

  /**
   * Đọc danh sách bạn MỘT LẦN khi chuyển sang phạm vi bạn bè, không đọc lại mỗi lần đổi
   * ngôn ngữ/mốc — danh sách bạn không phụ thuộc mấy thứ đó.
   *
   * Gồm cả CHÍNH MÌNH: bảng bạn bè mà không có mình thì không biết mình đứng đâu.
   */
  useEffect(() => {
    if (scope !== 'friends' || !currentUser) {
      setFriendIds(null)
      return
    }

    let cancelled = false
    listFriends(currentUser.id).then((lists) => {
      if (cancelled) return
      setFriendIds([currentUser.id, ...lists.friends.map((f) => f.profile.id)])
    })

    return () => {
      cancelled = true
    }
  }, [scope, currentUser])

  /**
   * Ghi nhớ để dùng làm phụ thuộc của effect được.
   *
   * Không có `useMemo` thì đây là mảng MỚI mỗi lần vẽ, nên phải khai `scope` và
   * `friendIds` thay cho nó trong mảng phụ thuộc — đúng về hành vi nhưng lint không nhìn
   * ra và cảnh báo. Cảnh báo giả làm lu mờ cảnh báo thật, nên thà sửa cho phụ thuộc
   * thành thật.
   */
  const scopeIds = useMemo(
    () => (scope === 'friends' ? (friendIds ?? undefined) : undefined),
    [scope, friendIds],
  )
  const waitingForFriends = scope === 'friends' && friendIds === null

  useEffect(() => {
    if (!isLeaderboardEnabled) return
    // Chờ đọc xong danh sách bạn: gọi luôn với `undefined` sẽ nháy bảng toàn cầu một
    // nhịp rồi mới đổi sang bảng bạn bè.
    if (waitingForFriends) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchLeaderboardPage(language, timeLimit, page, period, scopeIds).then((res) => {
      if (cancelled) return
      setRows(res.rows)
      setTotal(res.total)
      setError(res.error)
      setLoading(false)

      // Tra XP sau khi đã có danh sách: chỉ cần XP của đúng 10 người đang hiện.
      const ids = [...new Set(res.rows.map((row) => row.user_id))]
      fetchXpFor(ids).then((map) => {
        if (!cancelled) setXpByUser(map)
      })
    })

    return () => {
      cancelled = true
    }
  }, [language, timeLimit, page, period, scopeIds, waitingForFriends])

  useEffect(() => {
    if (!isLeaderboardEnabled || !currentUser) {
      setMyRank({ rank: null, wpm: null })
      return
    }
    let cancelled = false
    fetchMyRank(language, timeLimit, currentUser.id, period, scopeIds).then((res) => {
      if (!cancelled) setMyRank(res)
    })
    return () => {
      cancelled = true
    }
  }, [language, timeLimit, currentUser, period, scopeIds])

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
      <aside className="sm:w-48 shrink-0 flex flex-col gap-4">
        {/* Tra người chơi đứng ĐẦU cột lọc, không phải cuối: bảng xếp hạng chỉ hiện những
            người top, nên với hầu hết người dùng thì tra tên là việc duy nhất họ làm được
            ở đây. Không bắt đăng nhập — hồ sơ công khai vốn đã mở cho khách. */}
        <div className="flex flex-col gap-2">
          <div className={GROUP_LABEL}>{t.findPlayerLabel}</div>
          <PlayerSearch t={t} />
        </div>

        {/* Ngôn ngữ đứng đầu các bộ lọc: đây là thứ người dùng đổi nhiều nhất, và mỗi
            ngôn ngữ là một bảng khác hẳn. Lưới 2 cột để nhóm dài nhất vẫn không đẩy
            "khoảng thời gian" và "mốc" xuống dưới mép màn hình. */}
        <div className="flex flex-col gap-1 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className={`${GROUP_LABEL} mb-1`}>{t.langFilterLabel}</div>
          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
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
        </div>

        {/* Chỉ hiện khi đã đăng nhập: chưa đăng nhập thì không có danh sách bạn nào để
            lọc, hiện nút bấm vào không có tác dụng chỉ làm người dùng bối rối. */}
        {currentUser && (
          <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className={GROUP_LABEL}>{t.scopeFilterLabel}</div>
            <div className="flex flex-col gap-0.5 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70">
              {(['all', 'friends'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={s === scope ? PERIOD_BTN_ACTIVE : PERIOD_BTN}
                >
                  {s === 'all' ? t.scopeEveryone : t.scopeFriends}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Khoảng thời gian đổi ý nghĩa của cả bảng, không chỉ lọc bớt. Dạng khay dọc —
            khác cả danh sách trần của ngôn ngữ và khay ngang của mốc. */}
        <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className={GROUP_LABEL}>{t.periodFilterLabel}</div>
          <div className="flex flex-col gap-0.5 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={p === period ? PERIOD_BTN_ACTIVE : PERIOD_BTN}
              >
                {p === 'all' ? t.periodAll : p === 'week' ? t.periodWeek : t.periodToday}
              </button>
            ))}
          </div>
        </div>

        {/* Mốc thời gian: mỗi mốc là một bảng xếp hạng riêng, đổi nó là đổi cả nội dung.
            Khay ngang vì chỉ có 3 lựa chọn ngắn. */}
        <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className={GROUP_LABEL}>{t.timeFilterLabel}</div>
          <div className="flex gap-0.5 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70">
            {timeLimits.map((tl) => (
              <button
                key={tl}
                type="button"
                onClick={() => setTimeLimit(tl)}
                className={timeLimit === tl ? TIME_BTN_ACTIVE : TIME_BTN}
              >
                {tl}s
              </button>
            ))}
          </div>
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
          <div className="text-center text-red-500 dark:text-red-400 py-10">
            {error === MISSING_PERIOD_VIEW ? t.periodViewMissing : error}
          </div>
        )}

        {/* Bảng bạn bè trống có HAI lý do khác nhau: chưa kết bạn với ai, hoặc có bạn
            nhưng chưa ai gõ ngôn ngữ/mốc này. Nói rõ cái nào để người dùng biết phải
            làm gì tiếp. */}
        {!loading && !error && rows.length === 0 && (
          <div className="text-center text-zinc-500 py-10">
            {scope === 'friends' && friendIds !== null && friendIds.length <= 1
              ? t.scopeNoFriends
              : t.leaderboardEmpty}
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <table
            key={`${period}-${language}-${timeLimit}-${page}`}
            className="w-full animate-fade-in"
          >
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

                        {/* Chỉ hiện khi CÓ xp: chưa chạy SQL đồng bộ thì mọi người là 0,
                            hiện "lv 1" cho cả bảng chỉ làm rối chứ không cho biết gì. */}
                        {(xpByUser[row.user_id] ?? 0) > 0 && (
                          <span
                            title={`${xpByUser[row.user_id]} ${t.xpLabel}`}
                            className="shrink-0 px-1 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[11px]"
                          >
                            {t.levelShort} {levelFromXp(xpByUser[row.user_id]).level}
                          </span>
                        )}
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
