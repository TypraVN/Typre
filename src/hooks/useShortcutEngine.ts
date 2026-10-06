import { useCallback, useEffect, useState } from 'react'
import type { ShortcutItem } from '../data/shortcuts'
import { shuffle } from '../lib/shuffle'
import { chordMatches, isShortcutCombo, MODIFIER_TOKENS } from '../lib/shortcutCombo'

interface KeyLike {
  key: string
  code?: string
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
  getModifierState?: (key: 'AltGraph') => boolean
  preventDefault: () => void
}

type Feedback = 'idle' | 'correct' | 'wrong'

/**
 * Tên `e.key` của phím bổ trợ khi nhấn RIÊNG — luôn bỏ qua, không tính đúng/sai.
 *
 * `AltGraph` là phím AltGr của bàn phím châu Âu: nhấn nó để gõ `$` (Bắc Âu) hay `{`
 * (Đức) sẽ bắn ra một keydown `AltGraph` trước ký tự — y hệt chuyện `Shift` trước `!`.
 */
const MODIFIER_KEY_NAMES = ['Control', 'Alt', 'Shift', 'Meta', 'AltGraph']

function isChordShortcut(keys: string[]): boolean {
  return keys.some((k) => MODIFIER_TOKENS.includes(k))
}

export function useShortcutEngine(shortcuts: ShortcutItem[]) {
  /**
   * Thứ tự đã trộn + vị trí đang đứng, thay vì rút dần khỏi một "túi" dùng chung:
   * đi hết bộ phím tắt rồi mới hỏi lại.
   *
   * **Không** rút mục mới bên trong hàm updater của setState — React có thể gọi
   * updater nhiều lần (StrictMode gọi 2 lần), mỗi lượt sẽ ngốn 2 mục và làm lọt mục,
   * dẫn tới hỏi trùng ngay trong vòng đầu. State thuần thế này thì gọi lại bao nhiêu
   * lần cũng ra cùng kết quả.
   */
  const [order, setOrder] = useState<ShortcutItem[]>(() => shuffle(shortcuts))
  const [index, setIndex] = useState(0)
  const current = order[index] ?? shortcuts[0]
  const [progress, setProgress] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [score, setScore] = useState({ correct: 0, wrong: 0 })

  const chord = isChordShortcut(current.keys)

  const next = useCallback(() => {
    if (index + 1 < order.length) {
      setIndex(index + 1)
    } else {
      // Hết vòng: trộn lại. Chỗ duy nhất còn có thể trùng là mục cuối vòng trước gặp
      // mục đầu vòng sau — nếu trùng thì đẩy nó xuống cuối.
      const reshuffled = shuffle(shortcuts)
      if (reshuffled.length > 1 && reshuffled[0].id === current.id) {
        reshuffled.push(reshuffled.shift() as ShortcutItem)
      }
      setOrder(reshuffled)
      setIndex(0)
    }
    setProgress(0)
    setFeedback('idle')
  }, [index, order.length, shortcuts, current.id])

  // Đổi bộ phím tắt (VS Code ↔ Vim) thì thứ tự cũ không còn đúng danh sách nữa.
  useEffect(() => {
    setOrder(shuffle(shortcuts))
    setIndex(0)
  }, [shortcuts])

  useEffect(() => {
    if (feedback === 'correct') {
      const t = window.setTimeout(next, 500)
      return () => window.clearTimeout(t)
    }
    if (feedback === 'wrong') {
      const t = window.setTimeout(() => {
        setFeedback('idle')
        setProgress(0)
      }, 400)
      return () => window.clearTimeout(t)
    }
  }, [feedback, next])

  const handleKeyDown = useCallback(
    (e: KeyLike) => {
      e.preventDefault()

      /*
        Esc = bỏ qua phím tắt này, bằng bàn phím.

        Nút "skip" thôi là chưa đủ: bộ luyện chặn mọi phím kể cả Tab, nên người chỉ dùng
        bàn phím không bao giờ di chuyển tới được nút đó. Không bộ phím tắt nào dùng Esc,
        và Esc toàn trang (làm lại bài) chỉ bật ở chế độ gõ code — không đụng nhau.

        Đặt TRƯỚC chốt `feedback`: đang hiện xanh/đỏ mà bấm Esc vẫn phải sang bài kế.
      */
      if (e.key === 'Escape') {
        next()
        return
      }

      if (feedback !== 'idle') return

      if (chord) {
        if (MODIFIER_KEY_NAMES.includes(e.key)) return

        // Ký hiệu trên bàn phím châu Âu cần nới luật so khớp — xem `chordMatches`.
        if (chordMatches(e, current.keys)) {
          setScore((s) => ({ ...s, correct: s.correct + 1 }))
          setFeedback('correct')
        } else {
          setScore((s) => ({ ...s, wrong: s.wrong + 1 }))
          setFeedback('wrong')
        }
        return
      }

      // AltGr (châu Âu) báo thành Ctrl+Alt — vẫn là đang gõ ký tự, xem `isShortcutCombo`.
      if (isShortcutCombo(e)) return

      /*
        Phím chết (`Dead`): trên bàn phím Đức, Pháp, Bắc Âu... `^` không ra ngay mà chờ
        phím kế tiếp để ghép (`^` + dấu cách → `^`). Lần nhấn đầu chỉ báo `Dead`; ký tự
        thật tới ở keydown SAU. Đem `Dead` đi so là tính sai trước khi ký tự kịp tới.
      */
      if (e.key === 'Dead') return

      /*
        Bỏ qua lần nhấn RIÊNG của phím bổ trợ.

        Gõ `!` là hai sự kiện keydown: `Shift` trước, rồi `!`. Không chặn cái đầu thì nó
        bị đem so với ký tự đang chờ, không khớp, và tính là gõ SAI — tiến độ reset ngay
        trước khi ký tự thật kịp tới. Mọi phím tắt Vim có ký tự cần Shift (`:wq`, `:q!`,
        `di"`, `^`, `$`, `%`, `*`, `>>`) đều KHÔNG THỂ gõ xong, người dùng kẹt vĩnh viễn
        ở đó. Đúng lỗi một người dùng báo về ngày 2026-10-05.

        Nhánh tổ hợp phía trên đã chặn từ đầu; nhánh chuỗi này thiếu.
      */
      if (MODIFIER_KEY_NAMES.includes(e.key)) return

      const expected = current.keys[progress]
      if (e.key === expected) {
        const nextProgress = progress + 1
        if (nextProgress === current.keys.length) {
          setScore((s) => ({ ...s, correct: s.correct + 1 }))
          setFeedback('correct')
        } else {
          setProgress(nextProgress)
        }
      } else {
        setScore((s) => ({ ...s, wrong: s.wrong + 1 }))
        setFeedback('wrong')
      }
    },
    [current, progress, feedback, chord, next],
  )

  return { current, progress, feedback, score, chord, handleKeyDown, skip: next }
}
