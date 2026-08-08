import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Avatar } from './Avatar'
import { Logo } from './Logo'
import { getProfileByUsername, type Profile } from '../lib/profiles'
import { fetchUserBests } from '../lib/leaderboard'
import { formatJoinDate } from '../lib/stats'
import type { ScoreRow } from '../lib/leaderboard'
import type { Translation } from '../i18n/translations'

interface PublicProfileViewProps {
  username: string
  onBack: () => void
  t: Translation
}

type LoadState = 'loading' | 'ready' | 'not-found'

export function PublicProfileView({ username, onBack, t }: PublicProfileViewProps) {
  const [state, setState] = useState<LoadState>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bests, setBests] = useState<ScoreRow[]>([])

  useEffect(() => {
    let cancelled = false
    setState('loading')

    getProfileByUsername(username).then(async (p) => {
      if (cancelled) return
      if (!p) {
        setState('not-found')
        return
      }
      setProfile(p)
      // Điểm đọc SAU khi có hồ sơ: người chưa từng gửi điểm vẫn phải xem được trang.
      const rows = await fetchUserBests(p.id)
      if (cancelled) return
      setBests(rows)
      setState('ready')
    })

    return () => {
      cancelled = true
    }
  }, [username])

  const joined = formatJoinDate(profile?.created_at ?? null)
  const topWpm = bests.reduce((max, row) => (row.wpm > max ? row.wpm : max), 0)

  return (
    <div className="min-h-screen bg-white dark:bg-[#1f1f1f] text-zinc-900 dark:text-zinc-100 flex flex-col">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <Logo size="sm" onClick={onBack} title={t.backToApp} />
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1 text-sm rounded border cursor-pointer transition-colors duration-150 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToApp}
        </button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        {state === 'loading' && (
          <div className="font-mono text-sm text-zinc-500">{t.leaderboardLoading}</div>
        )}

        {state === 'not-found' && (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="font-heading text-2xl font-bold">{t.profileNotFound}</div>
            <div className="font-mono text-sm text-zinc-500">@{username}</div>
          </div>
        )}

        {state === 'ready' && profile && (
          <>
            <div className="flex items-center gap-4">
              <Avatar src={profile.avatar_url} name={profile.display_name} size={56} />
              <div className="min-w-0">
                <div className="font-heading text-2xl font-bold truncate">
                  {profile.display_name}
                </div>
                <div className="font-mono text-xs text-zinc-500">
                  @{profile.username}
                  {joined && ` · ${t.joined} ${joined}`}
                </div>
              </div>
              {topWpm > 0 && (
                <div className="ml-auto text-right">
                  <div className="font-mono text-xs text-zinc-500">{t.bestWpmLabel}</div>
                  <div className="font-mono text-3xl font-bold tabular-nums text-orange-500 dark:text-orange-400">
                    {topWpm}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                {t.personalBests}
              </div>

              {bests.length === 0 ? (
                <div className="font-mono text-sm text-zinc-500">{t.noPublicScores}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-mono">
                    <thead>
                      <tr className="text-zinc-500 dark:text-zinc-400">
                        <th className="text-left font-normal py-1.5 pr-4">{t.langFilterLabel}</th>
                        <th className="text-right font-normal py-1.5 px-3">{t.timeFilterLabel}</th>
                        <th className="text-right font-normal py-1.5 px-3">wpm</th>
                        <th className="text-right font-normal py-1.5 px-3">{t.accCol}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bests.map((row) => (
                        <tr
                          key={`${row.language}-${row.time_limit}`}
                          className="border-t border-zinc-200 dark:border-zinc-800"
                        >
                          <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-200">
                            {row.language}
                          </td>
                          <td className="py-2 px-3 text-right text-zinc-500">{row.time_limit}s</td>
                          <td className="py-2 px-3 text-right tabular-nums font-bold text-orange-600 dark:text-orange-400">
                            {row.wpm}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-zinc-500">
                            {row.accuracy}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
