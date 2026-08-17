import { useEffect, useState } from 'react'
import { Search, X as XIcon } from 'lucide-react'
import { searchPlayers, type PlayerSearchHit } from '../lib/profiles'
import { levelFromXp } from '../lib/xp'
import { Avatar } from './Avatar'
import type { Translation } from '../i18n/translations'

/** Chờ người dùng ngừng gõ rồi mới hỏi database — gõ 8 chữ không nên là 8 lượt query. */
const DEBOUNCE_MS = 300

const MIN_CHARS = 2

/**
 * Một dòng kết quả. Bấm được CHỈ KHI người đó đã đặt username, vì hồ sơ công khai nằm ở
 * `#/u/<username>` — không có username thì không có gì để mở.
 *
 * Người chưa đặt vẫn hiện ra thay vì bị lọc bỏ: username là tuỳ chọn nằm sâu trong Account
 * settings nên phần lớn người dùng chưa có, lọc bỏ là ô tìm kiếm luôn trống rỗng.
 */
function PlayerRow({ hit, t }: { hit: PlayerSearchHit; t: Translation }) {
  const level = levelFromXp(hit.xp).level

  const body = (
    <>
      <Avatar src={hit.avatar_url} name={hit.display_name} size={24} />

      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-xs text-zinc-700 dark:text-zinc-200">
          {hit.display_name}
        </span>
        <span className="block truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
          {hit.username ? `@${hit.username}` : t.findPlayerNoProfile}
        </span>
      </span>

      <span className="shrink-0 font-mono text-[11px] text-orange-600 dark:text-orange-400">
        {t.levelShort}
        {level}
      </span>
    </>
  )

  const layout = 'flex items-center gap-2 px-2 py-1.5 rounded-lg'

  if (!hit.username) {
    return <div className={layout}>{body}</div>
  }

  // Thẻ `a` với hash thật, không phải onClick: link hồ sơ phải copy và gửi cho người khác
  // được, và bot cũng chỉ đi theo href.
  return (
    <a
      href={`#/u/${hit.username}`}
      className={`${layout} hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors duration-150`}
    >
      {body}
    </a>
  )
}

interface PlayerSearchProps {
  t: Translation
}

/**
 * Tra một người chơi cụ thể theo tên.
 *
 * Vì sao cần: bảng xếp hạng chỉ hiện những người đứng đầu, nên muốn xem hồ sơ của một
 * người nhất định thì không có đường nào — trừ khi biết trước username để gõ tay
 * `#/u/<username>`.
 *
 * Dùng được khi CHƯA đăng nhập: hồ sơ công khai vốn đã mở cho khách, bắt đăng nhập chỉ
 * để tra tên là chặn vô cớ.
 */
export function PlayerSearch({ t }: PlayerSearchProps) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PlayerSearchHit[] | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const q = query.trim()

    if (q.length < MIN_CHARS) {
      setHits(null)
      setSearching(false)
      return
    }

    setSearching(true)

    /**
     * Bỏ kết quả của lượt gõ đã cũ.
     *
     * Không có cờ này thì một truy vấn chậm trả về SAU truy vấn mới hơn sẽ ghi đè kết
     * quả đúng — người dùng gõ tiếp mà danh sách nhảy về của chữ trước.
     */
    let current = true

    const timer = setTimeout(async () => {
      const found = await searchPlayers(q)
      if (!current) return

      setHits(found)
      setSearching(false)
    }, DEBOUNCE_MS)

    return () => {
      current = false
      clearTimeout(timer)
    }
  }, [query])

  const showEmpty = hits !== null && hits.length === 0 && !searching

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.findPlayerPlaceholder}
          aria-label={t.findPlayerPlaceholder}
          className="w-full pl-8 pr-8 py-1.5 rounded-lg font-mono text-xs bg-zinc-100 dark:bg-zinc-800/70 border border-transparent focus:border-orange-500 dark:focus:border-orange-400 outline-none text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={t.close}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-orange-500 transition-colors duration-150"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {searching && (
        <div className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
          {t.leaderboardLoading}
        </div>
      )}

      {showEmpty && (
        <div className="font-mono text-xs text-zinc-400 dark:text-zinc-500">{t.findPlayerNone}</div>
      )}

      {hits && hits.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {hits.map((hit) => (
            <li key={hit.id}>
              <PlayerRow hit={hit} t={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
