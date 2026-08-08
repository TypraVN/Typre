import { useCallback, useEffect, useState } from 'react'
import { Check, Plus, Search, UserMinus, X as XIcon } from 'lucide-react'
import { Modal } from './Modal'
import { Avatar } from './Avatar'
import {
  acceptFriendRequest,
  listFriends,
  removeFriendship,
  sendFriendRequest,
  type FriendEntry,
  type FriendLists,
} from '../lib/friends'
import { searchProfiles, type Profile } from '../lib/profiles'
import type { AppUser } from '../lib/auth'
import type { Translation } from '../i18n/translations'

interface FriendsDialogProps {
  user: AppUser
  onClose: () => void
  t: Translation
}

const EMPTY_LISTS: FriendLists = { friends: [], incoming: [], outgoing: [], error: null }

const ICON_BTN =
  'p-1.5 rounded border text-sm transition-colors duration-150 enabled:cursor-pointer border-zinc-300 dark:border-zinc-600 enabled:hover:border-orange-500 dark:enabled:hover:border-orange-400 disabled:opacity-40'

function PersonRow({
  profile,
  children,
}: {
  profile: Profile
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
      <Avatar src={profile.avatar_url} name={profile.display_name} size={28} />
      <div className="min-w-0 flex-1">
        <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
          {profile.display_name}
        </div>
        {profile.username && (
          <div className="font-mono text-[11px] text-zinc-500 truncate">@{profile.username}</div>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">{children}</div>
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null
  return (
    <div className="flex flex-col">
      <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mt-4 mb-1">
        {title} ({count})
      </div>
      {children}
    </div>
  )
}

export function FriendsDialog({ user, onClose, t }: FriendsDialogProps) {
  const [lists, setLists] = useState<FriendLists>(EMPTY_LISTS)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const next = await listFriends(user.id)
    setLists(next)
    setError(next.error)
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setError(null)
    setResults(await searchProfiles(query, user.id))
    setSearching(false)
  }

  /** Mọi hành động đều kết thúc bằng đọc lại danh sách — trạng thái luôn khớp server. */
  const act = async (id: string, fn: () => Promise<{ error: string | null }>) => {
    setBusyId(id)
    setError(null)
    const { error: err } = await fn()
    if (err) setError(err === 'exists' ? t.friendAlreadyLinked : err)
    await refresh()
    setBusyId(null)
  }

  const invite = (target: Profile) =>
    act(target.id, async () => {
      const { error: err } = await sendFriendRequest(user.id, target.id)
      return { error: err }
    })

  const total = lists.friends.length + lists.incoming.length + lists.outgoing.length

  return (
    <Modal label={t.menuFriends} closeLabel={t.close} onClose={onClose} widthClass="max-w-xl">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between gap-3 pr-8">
          <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {t.menuFriends}
          </h2>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm cursor-pointer transition-colors duration-150 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:border-orange-500 dark:hover:border-orange-400"
          >
            <Plus className="w-4 h-4" />
            {t.addFriend}
          </button>
        </div>

        {adding && (
          <form onSubmit={runSearch} className="mt-4 flex flex-col gap-2 animate-fade-in">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPeoplePlaceholder}
                aria-label={t.searchPeoplePlaceholder}
                autoFocus
                className="flex-1 px-3 py-2 rounded border font-mono text-sm border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-400"
              />
              <button
                type="submit"
                disabled={query.trim().length < 2 || searching}
                className="px-3 py-2 rounded border text-sm shrink-0 transition-colors duration-150 enabled:cursor-pointer border-zinc-300 dark:border-zinc-600 enabled:hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {results !== null && results.length === 0 && !searching && (
              <div className="font-mono text-xs text-zinc-500">{t.noPeopleFound}</div>
            )}

            {results?.map((p) => (
              <PersonRow key={p.id} profile={p}>
                <button
                  type="button"
                  onClick={() => invite(p)}
                  disabled={busyId === p.id}
                  title={t.sendRequest}
                  aria-label={t.sendRequest}
                  className={ICON_BTN}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </PersonRow>
            ))}
          </form>
        )}

        {loading ? (
          <div className="mt-6 font-mono text-sm text-zinc-500">{t.leaderboardLoading}</div>
        ) : (
          <>
            <Section title={t.friendRequests} count={lists.incoming.length}>
              {lists.incoming.map((entry: FriendEntry) => (
                <PersonRow key={entry.friendshipId} profile={entry.profile}>
                  <button
                    type="button"
                    onClick={() => act(entry.friendshipId, () => acceptFriendRequest(entry.friendshipId))}
                    disabled={busyId === entry.friendshipId}
                    title={t.acceptRequest}
                    aria-label={t.acceptRequest}
                    className={ICON_BTN}
                  >
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => act(entry.friendshipId, () => removeFriendship(entry.friendshipId))}
                    disabled={busyId === entry.friendshipId}
                    title={t.declineRequest}
                    aria-label={t.declineRequest}
                    className={ICON_BTN}
                  >
                    <XIcon className="w-4 h-4 text-red-500" />
                  </button>
                </PersonRow>
              ))}
            </Section>

            <Section title={t.menuFriends} count={lists.friends.length}>
              {lists.friends.map((entry) => (
                <PersonRow key={entry.friendshipId} profile={entry.profile}>
                  <button
                    type="button"
                    onClick={() => act(entry.friendshipId, () => removeFriendship(entry.friendshipId))}
                    disabled={busyId === entry.friendshipId}
                    title={t.removeFriend}
                    aria-label={t.removeFriend}
                    className={ICON_BTN}
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </PersonRow>
              ))}
            </Section>

            <Section title={t.sentRequests} count={lists.outgoing.length}>
              {lists.outgoing.map((entry) => (
                <PersonRow key={entry.friendshipId} profile={entry.profile}>
                  <span className="font-mono text-[11px] text-zinc-500">{t.pendingLabel}</span>
                  <button
                    type="button"
                    onClick={() => act(entry.friendshipId, () => removeFriendship(entry.friendshipId))}
                    disabled={busyId === entry.friendshipId}
                    title={t.cancelRequest}
                    aria-label={t.cancelRequest}
                    className={ICON_BTN}
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </PersonRow>
              ))}
            </Section>

            {total === 0 && (
              <div className="mt-8 text-center font-mono text-sm text-zinc-500">
                {t.noFriendsYet}
              </div>
            )}
          </>
        )}

        {error && (
          <div className="mt-4 font-mono text-xs text-red-500 dark:text-red-400">{error}</div>
        )}
      </div>
    </Modal>
  )
}
