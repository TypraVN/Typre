import { AchievementGrid } from './AchievementGrid'
import { Avatar } from './Avatar'
import { Modal } from './Modal'
import { WpmChart } from './WpmChart'
import { useHistoryStore, type TypingResult } from '../store/useHistoryStore'
import { computeBests, formatDuration, formatJoinDate, summarize } from '../lib/stats'
import type { AppUser } from '../lib/auth'
import type { SnippetLanguage } from '../data/types'
import type { Translation } from '../i18n/translations'

interface UserStatsDialogProps {
  user: AppUser
  languages: readonly SnippetLanguage[]
  timeLimits: readonly number[]
  onClose: () => void
  t: Translation
}

/**
 * Giá trị mặc định dùng chung, KHÔNG tạo mới mỗi lần render.
 *
 * Bắt buộc phải ở tầng module: viết `?? {}` ngay trong selector của zustand là tạo tham
 * chiếu mới mỗi lần gọi và gây vòng lặp render vô tận (xem ghi chú trong component).
 */
const NO_RESULTS: TypingResult[] = []
const NO_UNLOCKED: Record<string, string> = {}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="font-mono text-2xl tabular-nums text-zinc-900 dark:text-zinc-100">{value}</div>
    </div>
  )
}

export function UserStatsDialog({
  user,
  languages,
  timeLimits,
  onClose,
  t,
}: UserStatsDialogProps) {
  /**
   * Selector CHỈ được trả về thứ đang nằm sẵn trong store, không được tạo giá trị mới.
   *
   * Đây chính là nguyên nhân lỗi "Maximum update depth exceeded" (React #185): zustand so
   * kết quả selector bằng `Object.is`, nên `s.progress.unlocked ?? {}` sinh một `{}` MỚI
   * mỗi lần gọi khi `unlocked` chưa có → không bao giờ bằng lần trước → render lại → lại
   * sinh `{}` mới → vòng lặp vô tận, React ném lỗi ở lần thứ 50.
   *
   * Chỉ hỏng với người có `progress` lưu từ phiên bản TRƯỚC khi có thành tích: máy sạch
   * luôn có `unlocked: {}` sẵn nên không bao giờ tái hiện được.
   *
   * Giá trị mặc định phải là hằng ở tầng module để tham chiếu không đổi giữa các lần
   * render.
   */
  const rawResults = useHistoryStore((s) => s.results)
  const totals = useHistoryStore((s) => s.totals)
  const rawUnlocked = useHistoryStore((s) => s.progress?.unlocked)

  const results = Array.isArray(rawResults) ? rawResults : NO_RESULTS
  const unlocked = rawUnlocked ?? NO_UNLOCKED

  const started = Number(totals?.started) || 0
  const completed = Number(totals?.completed) || 0
  const typingSeconds = Number(totals?.typingSeconds) || 0

  const summary = summarize(results)
  const bests = computeBests(results)
  const joined = formatJoinDate(user.createdAt)

  // Chỉ hiện ngôn ngữ đã từng gõ — bảng 10 dòng toàn dấu "—" thì vô ích.
  const rows = languages.filter((lang) => bests[lang])

  return (
    <Modal label={t.menuUserStats} closeLabel={t.close} onClose={onClose} widthClass="max-w-3xl">
      <div className="px-6 py-5 flex flex-col gap-6">
          {/* Thẻ đầu: ai + đã gõ bao nhiêu, giống hàng trên cùng trang stats Monkeytype. */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-3 sm:pr-6 sm:border-r border-zinc-200 dark:border-zinc-700">
              <Avatar src={user.avatarUrl} name={user.displayName} size={48} />
              <div>
                <div className="font-heading text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {user.displayName}
                </div>
                {joined && (
                  <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {t.joined} {joined}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-3">
              <Tile label={t.testsStarted} value={String(started)} />
              <Tile label={t.testsCompleted} value={String(completed)} />
              <Tile label={t.timeTyping} value={formatDuration(typingSeconds)} />
            </div>
          </div>

          {/* Số đếm trên là trọn đời; các số dưới tính trên 50 lần gần nhất — phải nói rõ
              chứ không thì hai chỗ lệch nhau trông như sai. */}
          <div className="flex flex-col gap-2">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              {t.recentSummary} <span className="normal-case">({summary.sampleCount})</span>
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              <Tile label={t.bestWpmLabel} value={summary.bestWpm ? String(summary.bestWpm) : '—'} />
              <Tile label={t.avgWpmLabel} value={summary.avgWpm ? String(summary.avgWpm) : '—'} />
              <Tile
                label={t.avgAccuracyLabel}
                value={summary.avgAccuracy ? `${summary.avgAccuracy}%` : '—'}
              />
            </div>
          </div>

          <AchievementGrid unlocked={unlocked} t={t} />

          <div className="flex flex-col gap-2">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              {t.personalBests}
            </div>

            {rows.length === 0 ? (
              <div className="font-mono text-sm text-zinc-500">{t.noBestsYet}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="text-zinc-500 dark:text-zinc-400">
                      <th className="text-left font-normal py-1.5 pr-4">{t.langFilterLabel}</th>
                      {timeLimits.map((tl) => (
                        <th key={tl} className="text-right font-normal py-1.5 px-3">
                          {tl}s
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((lang) => (
                      <tr key={lang} className="border-t border-zinc-200 dark:border-zinc-800">
                        <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-200">{lang}</td>
                        {timeLimits.map((tl) => {
                          const best = bests[lang]?.[tl]
                          return (
                            <td key={tl} className="py-2 px-3 text-right tabular-nums">
                              {best ? (
                                <>
                                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                                    {best.wpm}
                                  </span>
                                  <span className="text-zinc-400 dark:text-zinc-500 text-xs">
                                    {' '}
                                    {best.accuracy}%
                                  </span>
                                </>
                              ) : (
                                <span className="text-zinc-300 dark:text-zinc-600">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <WpmChart results={results} title={t.wpmChartTitle} attemptLabel={t.attemptLabel} />

          <div className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
            {t.statsLocalNote}
          </div>
      </div>
    </Modal>
  )
}
