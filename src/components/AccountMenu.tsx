import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Globe, LineChart, LogOut, Settings, Users } from 'lucide-react'
import { signOut, type AppUser } from '../lib/auth'
import { Avatar } from './Avatar'
import type { Translation } from '../i18n/translations'

export type AccountMenuAction = 'stats' | 'friends' | 'profile' | 'settings'

interface AccountMenuProps {
  user: AppUser
  t: Translation
  /** Gọi khi chọn một mục đã làm xong. Mục chưa làm thì bị khoá, không gọi tới đây. */
  onAction?: (action: AccountMenuAction) => void
}

interface MenuItem {
  action: AccountMenuAction
  labelKey: keyof Translation
  Icon: typeof LineChart
  /** false = đã có trong menu nhưng chưa build xong phần nội dung. */
  ready: boolean
}

const ITEMS: MenuItem[] = [
  { action: 'stats', labelKey: 'menuUserStats', Icon: LineChart, ready: true },
  { action: 'friends', labelKey: 'menuFriends', Icon: Users, ready: true },
  { action: 'profile', labelKey: 'menuPublicProfile', Icon: Globe, ready: true },
  { action: 'settings', labelKey: 'menuAccountSettings', Icon: Settings, ready: true },
]

const ITEM_CLASS =
  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors duration-150 enabled:cursor-pointer enabled:hover:bg-zinc-100 dark:enabled:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed'

export function AccountMenu({ user, t, onAction }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // Chỉ chứa các mục bấm được — điều hướng bằng mũi tên phải bỏ qua mục bị khoá.
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const openedByKeyboardRef = useRef(false)

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  // Bấm ra ngoài thì đóng. Dùng mousedown (không phải click) để đóng ngay khi nhấn,
  // giống mọi menu khác trong app.
  useEffect(() => {
    if (!open) return

    const onMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  // Mở bằng bàn phím thì con trỏ phải nằm sẵn ở mục đầu, không thì phải Tab tiếp.
  // Mở bằng CHUỘT thì KHÔNG focus vào mục nào: mục bấm được đầu tiên hiện là "Sign out",
  // focus sẵn vào đó thì một cái Enter theo phản xạ là đăng xuất mất.
  useEffect(() => {
    if (!open || !openedByKeyboardRef.current) return
    itemRefs.current.find((el) => el && !el.disabled)?.focus()
  }, [open])

  const focusStep = (from: number, step: number) => {
    const items = itemRefs.current
    const len = items.length
    for (let i = 1; i <= len; i++) {
      // Cộng thêm `len` trước khi lấy dư để bước lùi không ra số âm.
      const el = items[(((from + step * i) % len) + len) % len]
      if (el && !el.disabled) {
        el.focus()
        return
      }
    }
  }

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    const items = itemRefs.current
    const current = items.findIndex((el) => el === document.activeElement)

    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusStep(current < 0 ? -1 : current, 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusStep(current < 0 ? 0 : current, -1)
    } else if (e.key === 'Tab') {
      // Tab ra khỏi menu = đóng, nhưng để trình duyệt chuyển focus như bình thường.
      setOpen(false)
    }
  }

  const handleSelect = (item: MenuItem) => {
    close()
    onAction?.(item.action)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={(e) => {
          // detail === 0 = click sinh ra từ Enter/Space chứ không phải chuột thật;
          // bấm bằng bàn phím thì vẫn nên đưa con trỏ vào trong menu.
          openedByKeyboardRef.current = e.detail === 0
          setOpen((v) => !v)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            openedByKeyboardRef.current = true
            setOpen(true)
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.accountMenu}
        className="flex items-center gap-2 px-2 py-1 rounded border cursor-pointer transition-colors duration-150 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
      >
        <Avatar src={user.avatarUrl} name={user.displayName} size={24} />
        <span className="font-mono text-xs text-zinc-500 max-w-[8rem] truncate">
          {user.displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t.accountMenu}
          onKeyDown={onPanelKeyDown}
          className="absolute right-0 mt-2 w-52 z-50 py-1 rounded-lg border shadow-xl overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 animate-fade-in"
        >
          {ITEMS.map((item, i) => (
            <button
              key={item.action}
              type="button"
              role="menuitem"
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              disabled={!item.ready}
              onClick={() => handleSelect(item)}
              title={item.ready ? undefined : t.comingSoon}
              className={`${ITEM_CLASS} text-zinc-700 dark:text-zinc-200`}
            >
              <item.Icon className="w-4 h-4 shrink-0 text-zinc-400" />
              <span className="flex-1">{t[item.labelKey]}</span>
              {!item.ready && (
                <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                  {t.comingSoon}
                </span>
              )}
            </button>
          ))}

          <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-700" />

          <button
            type="button"
            role="menuitem"
            ref={(el) => {
              itemRefs.current[ITEMS.length] = el
            }}
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className={`${ITEM_CLASS} text-zinc-700 dark:text-zinc-200`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-zinc-400" />
            <span className="flex-1">{t.signOut}</span>
          </button>
        </div>
      )}
    </div>
  )
}
