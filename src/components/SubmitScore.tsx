import { lazy, Suspense, useState } from 'react'
import { submitScore, scoreIneligibleReason } from '../lib/leaderboard'
import { isLeaderboardEnabled } from '../lib/supabase'
import { clearPendingScore, savePendingScore } from '../lib/pendingScore'
import type { AppUser } from '../lib/auth'
import type { SnippetLanguage } from '../data/types'
import type { Translation } from '../i18n/translations'

const SignInDialog = lazy(() =>
  import('./SignInDialog').then((m) => ({ default: m.SignInDialog })),
)

interface SubmitScoreProps {
  user: AppUser | null
  language: SnippetLanguage
  timeLimit: number
  wpm: number
  cpm: number
  rawWpm: number
  consistency: number
  accuracy: number
  t: Translation
}

type SubmitState = 'idle' | 'sending' | 'done' | 'failed'

export function SubmitScore({
  user,
  language,
  timeLimit,
  wpm,
  cpm,
  rawWpm,
  consistency,
  accuracy,
  t,
}: SubmitScoreProps) {
  const [state, setState] = useState<SubmitState>('idle')
  const [signInOpen, setSignInOpen] = useState(false)

  if (!isLeaderboardEnabled) return null

  const ineligible = scoreIneligibleReason(wpm, accuracy)
  if (ineligible) {
    return (
      <div className="font-mono text-xs text-zinc-500">
        {ineligible === 'low-accuracy' ? t.notEligible : t.wpmOutOfRange}
      </div>
    )
  }

  if (!user) {
    // Giữ điểm lại NGAY khi mở hộp thoại: đăng nhập bằng OAuth làm trang tải lại nên
    // sau đó không còn cơ hội đọc lại kết quả đang hiện trên màn hình.
    const openSignIn = () => {
      savePendingScore({ language, timeLimit, wpm, cpm, rawWpm, consistency, accuracy })
      setSignInOpen(true)
    }

    // Đổi ý, không đăng nhập nữa thì bỏ luôn điểm đang giữ — không thì lần đăng nhập
    // nào đó sau này sẽ tự gửi một điểm mà người dùng không còn nhớ.
    const closeSignIn = () => {
      clearPendingScore()
      setSignInOpen(false)
    }

    return (
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={openSignIn}
          className="px-3 py-1 text-sm rounded cursor-pointer transition-colors duration-150 bg-white dark:bg-zinc-900 border border-orange-500/60 dark:border-orange-400/60 text-orange-600 dark:text-orange-400 hover:border-orange-500 dark:hover:border-orange-400"
        >
          {t.signInToSubmit}
        </button>
        <div className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
          {t.scoreKeptForLater}
        </div>

        {signInOpen && (
          <Suspense fallback={null}>
            <SignInDialog onClose={closeSignIn} t={t} />
          </Suspense>
        )}
      </div>
    )
  }

  if (state === 'done') {
    return <div className="font-mono text-xs text-green-600 dark:text-green-400">{t.submitted}</div>
  }

  const handleSubmit = async () => {
    setState('sending')
    const { error } = await submitScore({
      user,
      language,
      timeLimit,
      wpm,
      cpm,
      rawWpm,
      consistency,
      accuracy,
    })
    setState(error ? 'failed' : 'done')
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={state === 'sending'}
        className="px-3 py-1 text-sm rounded cursor-pointer transition-colors duration-150 bg-white dark:bg-zinc-900 border border-orange-500/60 dark:border-orange-400/60 text-orange-600 dark:text-orange-400 hover:border-orange-500 dark:hover:border-orange-400 disabled:opacity-50"
      >
        {state === 'sending' ? t.submitting : t.submitScore}
      </button>
      {state === 'failed' && (
        <div className="font-mono text-xs text-red-500 dark:text-red-400">{t.submitFailed}</div>
      )}
    </div>
  )
}
