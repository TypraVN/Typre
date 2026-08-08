import { useEffect, useRef } from 'react'
import { useShortcutEngine } from '../hooks/useShortcutEngine'
import type { ShortcutItem } from '../data/shortcuts'
import type { Translation } from '../i18n/translations'

interface ShortcutTrainerProps {
  shortcuts: ShortcutItem[]
  t: Translation
}

export function ShortcutTrainer({ shortcuts, t }: ShortcutTrainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { current, progress, feedback, score, chord, handleKeyDown } = useShortcutEngine(shortcuts)

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`flex flex-col items-center gap-4 outline-none border rounded-lg p-8 w-full max-w-md transition-colors duration-200 ${
        feedback === 'correct'
          ? 'border-green-500'
          : feedback === 'wrong'
            ? 'border-red-500'
            : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-400'
      }`}
    >
      <div key={current.id} className="text-zinc-700 dark:text-zinc-300 animate-fade-in">
        {current.description}
      </div>

      <div className="flex items-center gap-2">
        {current.keys.map((key, i) => {
          let cls =
            'px-3 py-1.5 rounded border font-mono text-sm min-w-[2.5rem] text-center transition-colors duration-150'
          if (chord) {
            cls +=
              feedback === 'correct'
                ? ' border-green-500 text-green-600 dark:text-green-400'
                : feedback === 'wrong'
                  ? ' border-red-500 text-red-600 dark:text-red-400'
                  : ' border-zinc-400 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
          } else if (i < progress) {
            cls += ' border-green-500 text-green-600 dark:text-green-400 bg-green-500/10'
          } else if (i === progress) {
            cls +=
              feedback === 'wrong'
                ? ' border-red-500 text-red-600 dark:text-red-400'
                : ' border-orange-500 dark:border-orange-400 text-orange-500 dark:text-orange-400'
          } else {
            cls += ' border-zinc-300 dark:border-zinc-700 text-zinc-500'
          }

          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-zinc-500">{chord ? '+' : '→'}</span>}
              <kbd className={cls}>{key}</kbd>
            </div>
          )
        })}
      </div>

      <div className="font-mono text-xs text-zinc-500">
        {t.correct}: {score.correct} · {t.wrong}: {score.wrong}
      </div>
    </div>
  )
}
