import { useCallback, useEffect, useState } from 'react'
import type { ShortcutItem } from '../data/shortcuts'
import { shuffle } from '../lib/shuffle'

interface KeyLike {
  key: string
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
  preventDefault: () => void
}

type Feedback = 'idle' | 'correct' | 'wrong'

const MODIFIER_TOKENS = ['Ctrl', 'Alt', 'Shift', 'Meta']
const MODIFIER_KEY_NAMES = ['Control', 'Alt', 'Shift', 'Meta']
const ARROW_ALIASES: Record<string, string> = {
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
}

function matchesKey(pressed: string, token: string | undefined): boolean {
  if (!token) return false
  const expected = ARROW_ALIASES[token] ?? token
  if (expected.length === 1) return pressed.toLowerCase() === expected.toLowerCase()
  return pressed === expected
}

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
      if (feedback !== 'idle') return

      if (chord) {
        if (MODIFIER_KEY_NAMES.includes(e.key)) return

        const mainToken = current.keys.find((k) => !MODIFIER_TOKENS.includes(k))
        const mainMatches = matchesKey(e.key, mainToken)
        const modsMatch =
          e.ctrlKey === current.keys.includes('Ctrl') &&
          e.altKey === current.keys.includes('Alt') &&
          e.shiftKey === current.keys.includes('Shift') &&
          e.metaKey === current.keys.includes('Meta')

        if (mainMatches && modsMatch) {
          setScore((s) => ({ ...s, correct: s.correct + 1 }))
          setFeedback('correct')
        } else {
          setScore((s) => ({ ...s, wrong: s.wrong + 1 }))
          setFeedback('wrong')
        }
        return
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return

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
    [current, progress, feedback, chord],
  )

  return { current, progress, feedback, score, chord, handleKeyDown, skip: next }
}
