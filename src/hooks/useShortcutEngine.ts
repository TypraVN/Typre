import { useCallback, useEffect, useState } from 'react'
import type { ShortcutItem } from '../data/shortcuts'

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

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

function pickRandomExcept(list: ShortcutItem[], excludeId: string): ShortcutItem {
  const pool = list.length > 1 ? list.filter((s) => s.id !== excludeId) : list
  return pickRandom(pool)
}

export function useShortcutEngine(shortcuts: ShortcutItem[]) {
  const [current, setCurrent] = useState<ShortcutItem>(() => pickRandom(shortcuts))
  const [progress, setProgress] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [score, setScore] = useState({ correct: 0, wrong: 0 })

  const chord = isChordShortcut(current.keys)

  const next = useCallback(() => {
    setCurrent((prev) => pickRandomExcept(shortcuts, prev.id))
    setProgress(0)
    setFeedback('idle')
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
