import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChessBoard } from './ChessBoard'
import { CopyLinkButton } from './CopyLinkButton'
import { ChessService } from '../lib/chess/chessService'
import { pickMove, type BotLevel } from '../lib/chess/chessBot'
import { exampleFor, parseCommand } from '../lib/chess/commandParsers'
import {
  buildRoomUrl,
  clearRoomHash,
  newRoomId,
  readRoomFromHash,
  setRoomHash,
  type MoveMessage,
} from '../lib/chess/chessRoom'
import { useChessRoom } from '../hooks/useChessRoom'
import { isLeaderboardEnabled } from '../lib/supabase'
import type { Color, GameState, Square } from '../lib/chess/types'
import type { SnippetLanguage } from '../data/types'
import type { Translation } from '../i18n/translations'

interface ChessModeProps {
  /**
   * Ngôn ngữ đang luyện của app. Dùng CHUNG với chế độ gõ code chứ không giữ riêng —
   * đổi ở đây thì quay về tab kia cũng thấy đổi theo, đúng thứ người dùng mong đợi.
   */
  language: SnippetLanguage
  languages: readonly SnippetLanguage[]
  onSelectLanguage: (language: SnippetLanguage) => void
  /** Tên hiện cho đối thủ thấy. Chưa đăng nhập thì là tên khách. */
  myName: string
  t: Translation
}

type Opponent = 'bot-easy' | 'bot-medium' | 'bot-hard' | 'human' | 'online'

const BOT_LEVEL: Record<'bot-easy' | 'bot-medium' | 'bot-hard', BotLevel> = {
  'bot-easy': 'easy',
  'bot-medium': 'medium',
  'bot-hard': 'hard',
}

const BTN =
  'px-3 py-1 text-sm rounded border cursor-pointer transition-colors duration-150 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500'
const BTN_ACTIVE =
  'px-3 py-1 text-sm rounded border cursor-pointer transition-colors duration-150 border-orange-500 dark:border-orange-400 text-orange-500 dark:text-orange-400'

// Nut ngon ngu nho hon: co 14 cai, dung co chu nut doi thu thi tran ra hai ba dong.
const SMALL_BTN =
  'px-2 py-0.5 text-xs rounded cursor-pointer transition-colors duration-150 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
const SMALL_BTN_ACTIVE =
  'px-2 py-0.5 text-xs rounded cursor-pointer transition-colors duration-150 bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium'

export function ChessMode({
  language,
  languages,
  onSelectLanguage,
  myName,
  t,
}: ChessModeProps) {
  /**
   * Giữ engine trong ref chứ không trong state: nó có thể thay đổi bên trong (đi, lùi
   * nước) nên không phải giá trị bất biến. State chỉ giữ ẢNH CHỤP `GameState` — đó mới
   * là thứ React so sánh để vẽ lại.
   */
  const serviceRef = useRef<ChessService | null>(null)
  if (serviceRef.current === null) serviceRef.current = new ChessService()
  const service = serviceRef.current

  const [state, setState] = useState<GameState>(() => service.state)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null)
  const [thinking, setThinking] = useState(false)
  const [flipped, setFlipped] = useState(false)

  /** Mở app bằng link phòng thì vào thẳng chế độ trực tuyến. */
  const initialRoom = useMemo(() => readRoomFromHash(), [])
  const [roomId, setRoomId] = useState<string | null>(initialRoom)
  const [opponent, setOpponent] = useState<Opponent>(initialRoom ? 'online' : 'bot-medium')

  const inputRef = useRef<HTMLInputElement>(null)

  const online = opponent === 'online'
  const versusBot = opponent.startsWith('bot-')

  const resetLocal = useCallback(() => {
    setState(service.reset())
    setLastMove(null)
    setError(null)
    setInput('')
  }, [service])

  /**
   * Xử lý sự kiện từ phòng.
   *
   * Đọc `service.state` chứ không đọc biến `state`: các hàm này chạy trong callback của
   * channel, mà `state` ở đó là ảnh chụp của lần vẽ đã cũ. Engine thì luôn là hiện tại.
   */
  const onRemoteMove = useCallback(
    (message: MoveMessage) => {
      const result = service.applyMove(message.move)

      if (result.ok && result.state.fen === message.fen) {
        setState(result.state)
      } else {
        /**
         * Không áp dụng được, hoặc áp dụng xong ra thế khác với bên gửi.
         *
         * Nạp thẳng FEN của bên gửi. Mất biên bản (chess.js xoá lịch sử khi `load`),
         * nhưng hai người nhìn hai bàn cờ khác nhau mà không ai biết thì tệ hơn nhiều.
         */
        setState(service.load(message.fen))
      }

      setLastMove({ from: message.move.from, to: message.move.to })
      setError(null)
    },
    [service],
  )

  const onSyncRequest = useCallback(
    () => ({ fen: service.state.fen, history: service.state.history }),
    [service],
  )

  const onSyncState = useCallback(
    (snapshot: { fen: string; history: string[] }) => {
      // Chỉ nhận khi mình CHƯA đi nước nào. Không thì hai người cùng vào một lúc sẽ
      // ghi đè bàn cờ của nhau qua lại.
      if (service.state.history.length > 0) return
      if (snapshot.history.length === 0) return

      setState(service.load(snapshot.fen))
    },
    [service],
  )

  const onReset = useCallback(() => {
    resetLocal()
  }, [resetLocal])

  const room = useChessRoom(online ? roomId : null, myName, {
    onRemoteMove,
    onSyncRequest,
    onSyncState,
    onReset,
  })

  /** Màu của mình: trực tuyến thì do phòng chia, còn lại thì luôn cầm Trắng. */
  const myColor: Color | null = online ? room.myColor : 'w'

  const myTurn = online
    ? myColor !== null && room.ready && state.turn === myColor
    : versusBot
      ? state.turn === 'w'
      : true

  const example = useMemo(() => exampleFor(language), [language])

  /** Cầm quân Đen thì tự lật bàn — không ai muốn chơi mà quân mình ở phía xa. */
  useEffect(() => {
    if (myColor === 'b') setFlipped(true)
  }, [myColor])

  const newGame = useCallback(() => {
    resetLocal()
    if (online) room.sendReset()
    inputRef.current?.focus()
  }, [resetLocal, online, room])

  const undo = useCallback(() => {
    // Đấu bot phải lùi HAI nửa nước: một của bot, một của mình. Lùi một thì tới lượt bot
    // và nó đi lại ngay, người chơi không sửa được gì.
    service.undo()
    if (versusBot && service.state.turn !== 'w') service.undo()

    setState(service.state)
    setLastMove(null)
    setError(null)
    inputRef.current?.focus()
  }, [service, versusBot])

  /**
   * Lượt của bot.
   *
   * `setTimeout` không phải để giả vờ suy nghĩ mà là BẮT BUỘC: tìm kiếm chạy đồng bộ và
   * mức khó khoá luồng chính gần một giây. Gọi thẳng trong effect thì React chưa kịp vẽ
   * chữ "bot đang nghĩ", người chơi thấy trang đơ chứ không thấy phản hồi nào.
   */
  useEffect(() => {
    if (!versusBot || state.isOver || state.turn !== 'b') return

    setThinking(true)
    let cancelled = false

    const id = setTimeout(() => {
      const move = pickMove(state.fen, {
        level: BOT_LEVEL[opponent as keyof typeof BOT_LEVEL],
      })

      if (cancelled) return

      if (move) {
        const result = service.applyMove(move)
        if (result.ok) {
          setState(result.state)
          setLastMove({ from: move.from, to: move.to })
        }
      }

      setThinking(false)
    }, 30)

    return () => {
      cancelled = true
      clearTimeout(id)
      setThinking(false)
    }
  }, [state.fen, state.turn, state.isOver, versusBot, opponent, service])

  function chooseOpponent(value: Opponent) {
    setOpponent(value)
    resetLocal()

    if (value === 'online') {
      const id = roomId ?? newRoomId()
      setRoomId(id)
      setRoomHash(id)
    } else {
      setRoomId(null)
      clearRoomHash()
    }
  }

  function leaveRoom() {
    setRoomId(null)
    clearRoomHash()
    setOpponent('bot-medium')
    resetLocal()
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (state.isOver || thinking || !myTurn) return

    const parsed = parseCommand(language, input)

    if (!parsed.ok) {
      // Gợi ý cú pháp đã hiện thường trực dưới ô nhập, nên không lặp lại trong lỗi.
      setError(parsed.error.message)
      return
    }

    const result = service.applyMove(parsed.move)

    if (!result.ok) {
      setError(result.error.message)
      return
    }

    setState(result.state)
    setLastMove({ from: parsed.move.from, to: parsed.move.to })
    setInput('')
    setError(null)

    if (online) room.sendMove(parsed.move, result.state.fen)
  }

  const pieces = service.pieces()

  const checkSquare =
    state.status === 'check' || state.status === 'checkmate'
      ? (pieces.find((p) => p.type === 'k' && p.color === state.turn)?.square ?? null)
      : null

  return (
    <div className="w-full max-w-3xl flex flex-col gap-5">
      <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{t.chessIntro}</p>

      {/*
        Bộ chọn ngôn ngữ phải có Ở ĐÂY, không mượn của tab "Type code".
        Cả điểm hay của chế độ này là gõ lệnh bằng ngôn ngữ khác nhau; bắt người chơi
        chuyển tab để đổi rồi quay lại là chặn đúng thứ họ tới đây để làm.

        Đổi giữa ván cũng được: thế cờ không liên quan gì tới ngôn ngữ của câu lệnh.
      */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 mr-1">
          {t.langFilterLabel}
        </span>
        {languages.map((value) => (
          <button
            key={value}
            type="button"
            className={value === language ? SMALL_BTN_ACTIVE : SMALL_BTN}
            onClick={() => onSelectLanguage(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          {t.chessOpponent}
        </span>
        {(['bot-easy', 'bot-medium', 'bot-hard', 'human', 'online'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={opponent === value ? BTN_ACTIVE : BTN}
            onClick={() => chooseOpponent(value)}
            disabled={value === 'online' && !isLeaderboardEnabled}
          >
            {value === 'bot-easy'
              ? t.chessBotEasy
              : value === 'bot-medium'
                ? t.chessBotMedium
                : value === 'bot-hard'
                  ? t.chessBotHard
                  : value === 'human'
                    ? t.chessTwoPlayers
                    : t.chessOnline}
          </button>
        ))}
      </div>

      {online && (
        <OnlinePanel
          roomId={roomId}
          connected={room.connected}
          ready={room.ready}
          myColor={room.myColor}
          onLeave={leaveRoom}
          t={t}
        />
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <ChessBoard
          pieces={pieces}
          lastMove={lastMove}
          checkSquare={checkSquare}
          flipped={flipped}
        />

        <div className="flex-1 min-w-0 flex flex-col gap-3 font-mono text-sm">
          <StatusLine state={state} thinking={thinking} t={t} />

          <div className="flex flex-wrap gap-2">
            <button type="button" className={BTN} onClick={newGame}>
              {t.chessNewGame}
            </button>
            {/* Lùi nước bị ẩn khi chơi mạng: hai bên phải cùng đồng ý mới lùi được, mà
                một nút "lùi" tự ý sửa bàn cờ của đối thủ thì thành gian lận. */}
            {!online && (
              <button
                type="button"
                className={BTN}
                onClick={undo}
                disabled={state.history.length === 0}
              >
                {t.chessUndo}
              </button>
            )}
            <button type="button" className={BTN} onClick={() => setFlipped((f) => !f)}>
              {t.chessFlip}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              {t.chessHistory}
            </div>
            <MoveList history={state.history} t={t} />
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              // Xoá lỗi ngay khi người chơi sửa: để lỗi cũ nằm đó trong lúc họ gõ lại là
              // vừa gây hoang mang vừa trông như app không phản hồi.
              if (error) setError(null)
            }}
            disabled={state.isOver || thinking || !myTurn}
            placeholder={state.isOver ? '' : !myTurn ? t.chessWaitTurn : t.chessCommandPlaceholder}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="flex-1 min-w-0 px-3 py-2 rounded border font-mono text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={state.isOver || thinking || !myTurn}
            className="px-4 py-2 rounded text-sm font-medium cursor-pointer bg-orange-500 text-zinc-900 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.chessSubmit}
          </button>
        </div>

        <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {t.chessSyntaxLabel}:{' '}
          <code className="text-orange-600 dark:text-orange-400">{example}</code>
        </div>

        {error && (
          <div role="alert" className="font-mono text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}

function OnlinePanel({
  roomId,
  connected,
  ready,
  myColor,
  onLeave,
  t,
}: {
  roomId: string | null
  connected: boolean
  ready: boolean
  myColor: Color | null
  onLeave: () => void
  t: Translation
}) {
  if (!isLeaderboardEnabled) {
    return (
      <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded p-3">
        {t.chessOnlineOffline}
      </div>
    )
  }

  if (!roomId) return null

  const url = buildRoomUrl(roomId)

  return (
    <div className="flex flex-col gap-2 border border-zinc-300 dark:border-zinc-700 rounded p-3">
      <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {t.chessRoomLink}
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 min-w-0 truncate font-mono text-xs text-orange-600 dark:text-orange-400">
          {url}
        </code>
        <CopyLinkButton url={url} t={t} />
        <button type="button" className={BTN} onClick={onLeave}>
          {t.chessLeaveRoom}
        </button>
      </div>

      <div className="font-mono text-xs">
        {!connected ? (
          <span className="text-zinc-500">{t.chessConnecting}</span>
        ) : myColor === null ? (
          <span className="text-zinc-500">{t.chessSpectating}</span>
        ) : !ready ? (
          <span className="text-zinc-500">{t.chessWaitingOpponent}</span>
        ) : (
          <span className="text-orange-600 dark:text-orange-400">
            {myColor === 'w' ? t.chessYouAreWhite : t.chessYouAreBlack}
          </span>
        )}
      </div>
    </div>
  )
}

function StatusLine({
  state,
  thinking,
  t,
}: {
  state: GameState
  thinking: boolean
  t: Translation
}) {
  if (state.isOver) {
    const text =
      state.status === 'checkmate'
        ? `${t.chessCheckmate} — ${state.winner === 'w' ? t.chessWhiteWins : t.chessBlackWins}`
        : state.status === 'stalemate'
          ? t.chessStalemate
          : state.status === 'draw-insufficient'
            ? t.chessDrawMaterial
            : state.status === 'draw-threefold'
              ? t.chessDrawRepetition
              : t.chessDrawFifty

    return <div className="text-orange-600 dark:text-orange-400 font-bold">{text}</div>
  }

  if (thinking) {
    return <div className="text-zinc-500 dark:text-zinc-400">{t.chessThinking}</div>
  }

  return (
    <div className="text-zinc-700 dark:text-zinc-200">
      {state.turn === 'w' ? t.chessTurnWhite : t.chessTurnBlack}
      {state.status === 'check' && (
        <span className="ml-2 text-red-600 dark:text-red-400">{t.chessCheck}</span>
      )}
    </div>
  )
}

function MoveList({ history, t }: { history: string[]; t: Translation }) {
  if (history.length === 0) {
    return <div className="text-zinc-400 dark:text-zinc-500">{t.chessNoMoves}</div>
  }

  // Gộp thành từng cặp trắng/đen, đúng cách ghi biên bản cờ vua.
  const rounds: Array<[string, string | undefined]> = []
  for (let i = 0; i < history.length; i += 2) {
    rounds.push([history[i]!, history[i + 1]])
  }

  return (
    <ol className="max-h-40 overflow-y-auto tabular-nums text-zinc-600 dark:text-zinc-300">
      {rounds.map(([white, black], index) => (
        <li key={index} className="flex gap-2">
          <span className="w-6 text-right text-zinc-400 dark:text-zinc-500">{index + 1}.</span>
          <span className="w-16">{white}</span>
          <span className="w-16">{black ?? ''}</span>
        </li>
      ))}
    </ol>
  )
}

export default ChessMode
