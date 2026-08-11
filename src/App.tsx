import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, TriangleAlert, Sun, Moon, Swords } from 'lucide-react'
import { Toast, ToastStack } from './components/Toast'
import { useTypingEngine } from './hooks/useTypingEngine'
import { CodeEditorDisplay } from './components/CodeEditorDisplay'
import { ShortcutTrainer } from './components/ShortcutTrainer'
import { Logo } from './components/Logo'
import { WpmChart } from './components/WpmChart'
// Bảng xếp hạng nằm ở chunk riêng: chỉ tải khi thật sự mở tab Xếp hạng.
const Leaderboard = lazy(() =>
  import('./components/Leaderboard').then((m) => ({ default: m.Leaderboard })),
)
import { SubmitScore } from './components/SubmitScore'
// Chỉ cần khi người dùng vào từ link đặt lại mật khẩu — không nhét vào bundle đầu.
const NewPasswordDialog = lazy(() =>
  import('./components/NewPasswordDialog').then((m) => ({ default: m.NewPasswordDialog })),
)
import { AuthButton } from './components/AuthButton'
import { useAuth } from './hooks/useAuth'
import { readAuthErrorFromUrl } from './lib/auth'
import {
  buildChallengeUrl,
  clearChallengeHash,
  readChallengeFromHash,
  type Challenge,
} from './lib/challenge'
import { usePendingScoreSubmit } from './hooks/usePendingScoreSubmit'
import { getRandomSnippet, getSnippetById } from './data/snippets'
import type { SnippetLanguage } from './data/types'
import type { TypingStats } from './types/typing'
import { vscodeShortcuts, vimShortcuts } from './data/shortcuts'
import { useHistoryStore } from './store/useHistoryStore'
import { useThemeStore } from './store/useThemeStore'
import { useSoundStore } from './store/useSoundStore'
import { useUiThemeStore } from './store/useUiThemeStore'
import { usePreferencesStore } from './store/usePreferencesStore'
import { translations } from './i18n/translations'
import { CODE_THEMES, THEME_LABELS, type CodeLanguage } from './lib/highlighter'

const LANGUAGES: SnippetLanguage[] = [
  'javascript',
  'typescript',
  'csharp',
  'python',
  'java',
  'go',
  'sql',
  'bash',
  'cpp',
  'rust',
  'html',
  'css',
  'json',
  'text',
]
const TIME_LIMITS = [15, 30, 60] as const
const DEFAULT_TIME_LIMIT = TIME_LIMITS[1]

const SHIKI_LANG: Record<SnippetLanguage, CodeLanguage> = {
  javascript: 'javascript',
  typescript: 'typescript',
  csharp: 'csharp',
  python: 'python',
  java: 'java',
  go: 'go',
  sql: 'sql',
  bash: 'bash',
  cpp: 'cpp',
  rust: 'rust',
  html: 'html',
  css: 'css',
  json: 'json',
  text: 'javascript',
}

const TAB_BTN_BASE =
  'px-3 py-1 text-sm rounded border cursor-pointer transition-colors duration-150'
const TAB_BTN = `${TAB_BTN_BASE} border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500`
const TAB_BTN_ACTIVE = `${TAB_BTN_BASE} border-orange-500 dark:border-orange-400 text-orange-500 dark:text-orange-400`
const ACTION_BTN =
  'px-3 py-1 text-sm rounded cursor-pointer transition-colors duration-150 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-400'
const ACTION_BTN_ON_CARD =
  'px-3 py-1 text-sm rounded cursor-pointer transition-colors duration-150 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-400'

/** Nhãn phím dùng trong dòng gợi ý phím tắt. */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
      {children}
    </kbd>
  )
}

function displayChar(ch: string): string {
  if (ch === ' ') return '␣'
  if (ch === '\n') return '⏎'
  return ch
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function countdownColor(remaining: number): string {
  if (remaining <= 5) return 'text-red-500 animate-pulse'
  return 'text-orange-500 dark:text-orange-400'
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const recordedRef = useRef(false)

  const mode = usePreferencesStore((s) => s.mode)
  const setMode = usePreferencesStore((s) => s.setMode)
  const shortcutSet = usePreferencesStore((s) => s.shortcutSet)
  const setShortcutSet = usePreferencesStore((s) => s.setShortcutSet)
  const language = usePreferencesStore((s) => s.language)
  const setLanguage = usePreferencesStore((s) => s.setLanguage)
  const storedTimeLimit = usePreferencesStore((s) => s.timeLimit)
  const setTimeLimit = usePreferencesStore((s) => s.setTimeLimit)

  // Mốc đã lưu có thể không còn trong danh sách (đổi mốc giữa các phiên bản, hoặc
  // localStorage bị sửa tay). Không chặn thì không nút nào sáng mà đồng hồ vẫn chạy
  // theo mốc "mồ côi" đó — trông như hỏng.
  const timeLimit = (TIME_LIMITS as readonly number[]).includes(storedTimeLimit)
    ? storedTimeLimit
    : DEFAULT_TIME_LIMIT

  /**
   * Lời thách đấu đọc MỘT LẦN lúc mount. Giữ nguyên trong suốt lượt để bảng Kết quả
   * biết mà so điểm; bấm "next snippet" là bỏ (xem `goNext`).
   */
  const [challenge, setChallenge] = useState(() => {
    const found = readChallengeFromHash()
    if (!found) return null
    // Link cũ trỏ bài đã bị xoá khỏi dataset thì bỏ qua, đừng để app trắng bài.
    return getSnippetById(found.snippetId) ? found : null
  })

  const [snippet, setSnippet] = useState(() => {
    const fromChallenge = challenge && getSnippetById(challenge.snippetId)
    if (fromChallenge) return fromChallenge

    const prefs = usePreferencesStore.getState()
    return getRandomSnippet(prefs.language, undefined, prefs.timeLimit)
  })
  const [frozenStats, setFrozenStats] = useState<TypingStats | null>(null)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const { charStatuses, cursor, status, stats, mistakeCounts, handleKeyDown, reset } =
    useTypingEngine(snippet.code)

  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const t = translations

  const soundEnabled = useSoundStore((s) => s.enabled)
  const toggleSound = useSoundStore((s) => s.toggle)

  const uiMode = useUiThemeStore((s) => s.mode)
  const toggleUiMode = useUiThemeStore((s) => s.toggle)

  const { user, loading: authLoading, recovery, clearRecovery } = useAuth()
  const { notice: pendingNotice, dismissNotice } = usePendingScoreSubmit(user)
  // Đọc MỘT LẦN lúc mount: hàm này dọn luôn URL nên gọi trong render sẽ mất thông báo
  // ở lần render thứ hai.
  const [authError, setAuthError] = useState<string | null>(readAuthErrorFromUrl)

  const results = useHistoryStore((s) => s.results)
  const addResult = useHistoryStore((s) => s.addResult)
  const markStarted = useHistoryStore((s) => s.markStarted)

  const remaining = Math.max(0, timeLimit - stats.elapsedSeconds)
  const sessionOver = status === 'finished' || remaining === 0
  const displayStats = frozenStats ?? stats
  const sessionTopMistakes = Object.entries(mistakeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const pickNext = (lang: SnippetLanguage) => {
    setLanguage(lang)
    setSnippet(getRandomSnippet(lang, snippet.id, timeLimit))
  }

  /**
   * Đổi mốc thời gian là phải đổi luôn bài, vì mỗi mốc rút từ một rổ độ dài khác nhau:
   * giữ bài 1 dòng ở mốc 60s thì gõ 8 giây đã xong lượt, còn giữ bài 13 dòng ở mốc 15s
   * thì không ai gõ kịp.
   */
  const chooseTimeLimit = (tl: number) => {
    setTimeLimit(tl)
    setSnippet(getRandomSnippet(language, snippet.id, tl))
  }

  /**
   * Copy link mở đúng bài này, đúng mốc này, kèm điểm vừa đạt làm mốc cần vượt.
   * `navigator.clipboard` chỉ chạy trên https hoặc localhost — chỗ khác thì báo lỗi
   * chứ không im lặng, để người dùng biết mà copy tay.
   */
  const copyChallengeLink = async () => {
    const url = buildChallengeUrl({
      language: snippet.language,
      timeLimit,
      snippetId: snippet.id,
      target: displayStats.wpm,
    })

    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 2500)
    } catch {
      window.prompt(t.challengeCopyFailed, url)
    }
  }

  /** Gõ lại đúng bài đang mở. */
  const restartSame = () => {
    reset()
    setFrozenStats(null)
    recordedRef.current = false
    containerRef.current?.focus()
  }

  /** Sang bài mới cùng ngôn ngữ. Bỏ luôn lời thách đấu vì đã sang bài khác. */
  const goNext = () => {
    setChallenge(null)
    pickNext(language)
    containerRef.current?.focus()
  }

  // Bấm logo = về màn gõ code với bài mới, xoá kết quả đang hiện (không xoá lịch sử/cài đặt).
  const goHome = () => {
    setMode('code')
    reset()
    setFrozenStats(null)
    recordedRef.current = false
    setSnippet(getRandomSnippet(language, snippet.id, timeLimit))
    containerRef.current?.focus()
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', uiMode === 'dark')
  }, [uiMode])

  /**
   * Nhận lời thách đấu: ép ngôn ngữ + mốc thời gian cho khớp, nạp đúng bài, rồi DỌN
   * HASH — không dọn thì reload hay bấm "next snippet" xong tải lại là quay về bài cũ,
   * trông như app kẹt ở một bài.
   */
  const applyChallenge = (next: Challenge) => {
    const target = getSnippetById(next.snippetId)
    if (!target) return

    setChallenge(next)
    setSnippet(target)
    setLanguage(next.language)
    setTimeLimit(next.timeLimit)
    setFrozenStats(null)
    recordedRef.current = false
    clearChallengeHash()
  }

  useEffect(() => {
    if (challenge) applyChallenge(challenge)

    /**
     * Người đang mở sẵn app mà bấm link thách đấu thì trình duyệt CHỈ đổi hash, không
     * tải lại trang — đọc lúc mount thôi là không bao giờ thấy lời thách đó.
     */
    const onHashChange = () => {
      const next = readChallengeFromHash()
      if (next) applyChallenge(next)
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
    // Chỉ gắn một lần; `applyChallenge` chỉ dùng setter nên không cần vào deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Focus lại khung gõ khi nó VỪA hiện ra. Gọi focus() ngay trong hàm reset không
  // ăn: lúc bấm "reset" từ bảng kết quả, khung gõ chưa mount nên ref còn null.
  useEffect(() => {
    if (mode === 'code' && !sessionOver) containerRef.current?.focus()
  }, [mode, sessionOver])

  // Ghi lại mốc đã sửa, không thì localStorage giữ mãi giá trị mồ côi.
  useEffect(() => {
    if (timeLimit !== storedTimeLimit) setTimeLimit(timeLimit)
  }, [timeLimit, storedTimeLimit, setTimeLimit])

  useEffect(() => {
    recordedRef.current = false
    setFrozenStats(null)
    // Lượt mới bắt đầu lại từ bài này; các bài nối thêm của lượt trước không còn tính.
    containerRef.current?.focus()
  }, [snippet, timeLimit])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => setCapsLockOn(e.getModifierState('CapsLock'))
    window.addEventListener('keydown', handler)
    window.addEventListener('keyup', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('keyup', handler)
    }
  }, [])

  // Phím tắt để không phải rời tay khỏi bàn phím giữa các lượt gõ.
  // Chỉ bắt khi KHÔNG đang gõ dở: Esc lúc đang gõ (làm lại), còn Enter/Tab chỉ
  // hoạt động sau khi xong — lúc đó engine đã ngừng nhận input nên không tranh phím.
  useEffect(() => {
    if (mode !== 'code') return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // Có hộp thoại/menu đang mở thì phím thuộc về nó. Không chặn ở đây thì Escape
      // đóng hộp thoại đăng nhập (hay menu tài khoản) sẽ ĐỒNG THỜI reset bài, xoá mất
      // màn Kết quả — cả hai đều nghe trên window nên không thể trông vào thứ tự listener.
      if (document.querySelector('[role="dialog"][aria-modal="true"], [role="menu"]')) return

      // Đang gõ trong ô input (vd ô email ở màn đăng nhập) thì không can thiệp.
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return

      if (e.key === 'Escape') {
        e.preventDefault()
        restartSame()
        return
      }

      if (!sessionOver) return

      if (e.key === 'Enter') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'Tab') {
        e.preventDefault()
        restartSame()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, sessionOver, language, snippet.id])

  // Đếm "tests started" theo lần CHUYỂN sang trạng thái đang gõ, không phải theo
  // snippet/timeLimit — reset rồi gõ lại cùng một bài vẫn là một lần thử mới.
  const prevStatusRef = useRef(status)
  useEffect(() => {
    if (prevStatusRef.current !== 'typing' && status === 'typing') markStarted()
    prevStatusRef.current = status
  }, [status, markStarted])

  useEffect(() => {
    if (sessionOver && !recordedRef.current) {
      recordedRef.current = true
      setFrozenStats(stats)
      addResult({
        id: `${Date.now()}`,
        date: new Date().toISOString(),
        language: snippet.language,
        wpm: stats.wpm,
        cpm: stats.cpm,
        accuracy: stats.accuracy,
        mistakeCounts,
        timeLimit,
        // Gõ xong sớm thì thời lượng thật ngắn hơn mốc đã chọn.
        durationSeconds: Math.min(stats.elapsedSeconds, timeLimit),
        rawWpm: stats.rawWpm,
        consistency: stats.consistency,
      })
    }
  }, [sessionOver])

  return (
    <div className="min-h-screen bg-white dark:bg-[#1f1f1f] text-zinc-900 dark:text-zinc-100 flex flex-col">
      <header className="flex flex-col gap-2 px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between flex-wrap gap-y-2">
          <Logo size="sm" onClick={goHome} title={t.homeTooltip} />

          <div className="flex items-center flex-wrap justify-end gap-2">
            <div className="flex gap-2">
              {(['code', 'shortcuts', 'leaderboard'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={mode === m ? TAB_BTN_ACTIVE : TAB_BTN}
                >
                  {m === 'code' ? t.modeCode : m === 'shortcuts' ? t.modeShortcuts : t.modeLeaderboard}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleUiMode}
              className="p-1.5 rounded border cursor-pointer transition-colors duration-150 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
            >
              {uiMode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className={`p-1.5 rounded border cursor-pointer transition-colors duration-150 ${
                soundEnabled
                  ? 'border-orange-500 dark:border-orange-400 text-orange-500 dark:text-orange-400'
                  : 'border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <AuthButton
              user={user}
              loading={authLoading}
              languages={LANGUAGES}
              timeLimits={TIME_LIMITS}
              t={t}
            />
          </div>
        </div>

        {mode === 'code' && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex flex-wrap justify-center gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => pickNext(lang)}
                  className={lang === language ? TAB_BTN_ACTIVE : TAB_BTN}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-zinc-300 dark:bg-zinc-700" />

            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as (typeof CODE_THEMES)[number])}
              className="px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
            >
              {CODE_THEMES.map((ct) => (
                <option key={ct} value={ct}>
                  {THEME_LABELS[ct]}
                </option>
              ))}
            </select>

            <div className="hidden sm:block w-px h-6 bg-zinc-300 dark:bg-zinc-700" />

            <div className="flex flex-wrap justify-center gap-2">
              {TIME_LIMITS.map((tl) => (
                <button
                  key={tl}
                  type="button"
                  onClick={() => chooseTimeLimit(tl)}
                  className={timeLimit === tl ? TAB_BTN_ACTIVE : TAB_BTN}
                >
                  {tl}s
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Luôn chiếm sẵn chiều cao dù chưa bật Caps Lock: nếu chỉ render khi bật thì
          banner sẽ đẩy layout (nhảy khung), còn nếu dùng `fixed` với toạ độ cứng thì
          lại đè lên đồng hồ mỗi khi layout đổi. */}
      {/* Hàng này luôn chiếm sẵn chiều cao dù chưa bật Caps Lock, để lúc bật/tắt không
          đẩy khung gõ nhảy lên xuống. `items-end` đẩy badge xuống sát đáy hàng cho
          tách khỏi header. */}
      <div className="h-16 flex items-end justify-center shrink-0">
        {capsLockOn && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm font-mono animate-fade-in">
            <TriangleAlert className="w-4 h-4" />
            {t.capsLockWarning}
          </div>
        )}
      </div>

      <main
        key={mode}
        className="flex-1 flex flex-col items-center justify-center gap-6 px-6 pb-6 animate-fade-in-up"
      >
      {mode === 'code' && (
        <>
          {!sessionOver && (
            <>
              <div
                className={`font-mono text-2xl font-bold tabular-nums transition-colors duration-300 ${countdownColor(remaining)}`}
                data-testid="clock"
              >
                {formatTime(remaining)}
              </div>

              {challenge && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-mono animate-fade-in">
                  <Swords className="w-4 h-4" />
                  {t.challengeBanner} <span className="font-bold">{challenge.target} wpm</span>
                </div>
              )}

              {/* Chừa sẵn chỗ cho bài cao nhất (4 dòng × 28px + padding) rồi canh giữa
                  khung trong đó: khung ôm sát nội dung nên bài 1 dòng và bài 4 dòng cao
                  khác nhau, không chừa chỗ thì mỗi lần đổi bài là cả trang nhảy. Vùng
                  chừa này vô hình vì nền khung code trùng nền trang. */}
              <div className="min-h-[144px] flex items-center justify-center">
              <CodeEditorDisplay
                key={snippet.id}
                ref={containerRef}
                code={snippet.code}
                language={SHIKI_LANG[snippet.language]}
                theme={theme}
                uiMode={uiMode}
                charStatuses={charStatuses}
                cursor={cursor}
                onKeyDown={handleKeyDown}
              />
              </div>

              <div className="flex gap-6 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  {t.statusLabel}: {status === 'idle' ? t.statusIdle : t.statusTyping}
                </span>
                <span>wpm: {stats.wpm}</span>
                <span>cpm: {stats.cpm}</span>
                <span>accuracy: {stats.accuracy}%</span>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={restartSame} className={ACTION_BTN}>
                  {t.reset}
                </button>
                <button type="button" onClick={goNext} className={ACTION_BTN}>
                  {t.nextSnippet}
                </button>
              </div>

              <div className="font-mono text-xs text-zinc-400 dark:text-zinc-600">
                <Kbd>Esc</Kbd> {t.hintRestart}
              </div>
            </>
          )}

          {sessionOver && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-8 py-6 animate-pop-in">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{t.resultTitle}</div>
              <div className="flex items-baseline gap-2 font-mono text-orange-500 dark:text-orange-400">
                <span className="text-6xl font-bold tabular-nums">{displayStats.wpm}</span>
                <span className="text-lg text-zinc-500">wpm</span>
              </div>
              <div className="flex gap-6 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                <span>cpm: {displayStats.cpm}</span>
                <span>accuracy: {displayStats.accuracy}%</span>
              </div>
              <div className="flex gap-6 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                <span title={t.rawHint}>raw: {displayStats.rawWpm}</span>
                <span title={t.consistencyHint}>consistency: {displayStats.consistency}%</span>
              </div>

              {challenge && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded border font-mono text-sm ${
                    displayStats.wpm > challenge.target
                      ? 'border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400'
                      : 'border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <Swords className="w-4 h-4" />
                  {displayStats.wpm > challenge.target
                    ? t.challengeWon
                    : `${t.challengeLost} ${challenge.target} wpm`}
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3">
                <button type="button" onClick={restartSame} className={ACTION_BTN_ON_CARD}>
                  {t.reset}
                </button>
                <button type="button" onClick={goNext} className={ACTION_BTN_ON_CARD}>
                  {t.nextSnippet}
                </button>
                <button
                  type="button"
                  onClick={copyChallengeLink}
                  className={`${ACTION_BTN_ON_CARD} flex items-center gap-1.5`}
                >
                  <Swords className="w-4 h-4" />
                  {linkCopied ? t.challengeCopied : t.challengeFriend}
                </button>
              </div>

              <div className="flex gap-4 font-mono text-xs text-zinc-400 dark:text-zinc-500">
                <span>
                  <Kbd>Tab</Kbd> {t.hintRestart}
                </span>
                <span>
                  <Kbd>Enter</Kbd> {t.hintNext}
                </span>
              </div>

              <SubmitScore
                user={user}
                language={snippet.language}
                timeLimit={timeLimit}
                wpm={displayStats.wpm}
                cpm={displayStats.cpm}
                rawWpm={displayStats.rawWpm}
                consistency={displayStats.consistency}
                accuracy={displayStats.accuracy}
                t={t}
              />

              {sessionTopMistakes.length > 0 && (
                <div className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                  <div className="text-zinc-500 mb-1 text-center">{t.thisRunMistakes}</div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {sessionTopMistakes.map(([ch, count]) => (
                      <span
                        key={ch}
                        className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-orange-500/40 dark:border-orange-400/40 text-orange-600 dark:text-orange-400"
                      >
                        {displayChar(ch)} ×{count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <WpmChart results={results} title={t.wpmChartTitle} attemptLabel={t.attemptLabel} />

        </>
      )}

      {mode === 'shortcuts' && (
        <>
          <div className="flex gap-2">
            {(['vscode', 'vim'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShortcutSet(s)}
                className={shortcutSet === s ? TAB_BTN_ACTIVE : TAB_BTN}
              >
                {s === 'vscode' ? 'VS Code' : 'Vim'}
              </button>
            ))}
          </div>

          <ShortcutTrainer
            key={shortcutSet}
            shortcuts={shortcutSet === 'vscode' ? vscodeShortcuts : vimShortcuts}
            t={t}
          />
        </>
      )}

      {mode === 'leaderboard' && (
        <Suspense
          fallback={
            <div className="font-mono text-sm text-zinc-500">{t.leaderboardLoading}</div>
          }
        >
          <Leaderboard
            languages={LANGUAGES}
            timeLimits={TIME_LIMITS}
            currentUser={user}
            defaultLanguage={language}
            defaultTimeLimit={timeLimit}
            t={t}
          />
        </Suspense>
      )}
      </main>

      <ToastStack>
        {/* Đăng nhập lỗi thì Supabase chỉ trả lý do trong URL rồi thôi — không hiện ra
            thì người dùng bấm đăng nhập, quay về, và không hiểu vì sao vẫn chưa vào được. */}
        {authError && (
          <Toast kind="error" dismissLabel={t.dismiss} onDismiss={() => setAuthError(null)}>
            {authError}
          </Toast>
        )}

        {/* Điểm gửi sau khi đăng nhập diễn ra lúc trang vừa tải lại, người dùng không hề
            bấm gì — nên phải nói rõ là đã gửi, đừng để họ tưởng mất điểm. */}
        {pendingNotice && (
          <Toast
            kind={
              pendingNotice.status === 'done'
                ? 'success'
                : pendingNotice.status === 'failed'
                  ? 'error'
                  : 'info'
            }
            dismissLabel={t.dismiss}
            onDismiss={dismissNotice}
          >
            {pendingNotice.status === 'sending' && t.pendingSubmitting}
            {pendingNotice.status === 'done' && (
              <>
                <span className="font-bold">{pendingNotice.wpm} wpm</span> {t.pendingSubmitted}
              </>
            )}
            {pendingNotice.status === 'failed' && t.pendingSubmitFailed}
          </Toast>
        )}
      </ToastStack>

      {recovery && (
        <Suspense fallback={null}>
          <NewPasswordDialog onDone={clearRecovery} t={t} />
        </Suspense>
      )}
    </div>
  )
}

export default App
