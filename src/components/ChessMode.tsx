import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChessBoard } from './ChessBoard'
import { ChessClock } from './ChessClock'
import { CopyLinkButton } from './CopyLinkButton'
import { ChessService } from '../lib/chess/chessService'
import { pickMove, type BotLevel } from '../lib/chess/chessBot'
import { examplesFor, parseCommand } from '../lib/chess/commandParsers'
import { describeMoveError, describeParseError } from '../lib/chess/describe'
import {
  INITIAL_MS,
  flagged,
  timeoutResult,
  newClock,
  remaining,
  stop,
  switchTurn,
  type ClockState,
} from '../lib/chess/clock'
import {
  buildRoomUrl,
  clearRoomHash,
  newRoomId,
  readRoomFromHash,
  setRoomHash,
  type MoveMessage,
} from '../lib/chess/chessRoom'
import { useChessRoom } from '../hooks/useChessRoom'
import { playCorrect, playFinish, playWrong } from '../lib/sound'
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

/** Ván dừng không do luật cờ. `draw` chỉ có nghĩa với hết giờ (luật FIDE 6.9). */
type ManualEnd =
  | { kind: 'resign'; loser: Color }
  | { kind: 'timeout'; loser: Color; draw: boolean }

const BOT_LEVEL: Record<'bot-easy' | 'bot-medium' | 'bot-hard', BotLevel> = {
  'bot-easy': 'easy',
  'bot-medium': 'medium',
  'bot-hard': 'hard',
}

const BTN =
  'px-3 py-1 text-sm rounded border cursor-pointer transition-colors duration-150 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500'

/** Nhãn nhóm trong cột trái. Cùng kiểu với cột lọc của bảng xếp hạng. */
const GROUP_LABEL =
  'px-2 text-[11px] font-mono font-bold text-orange-600 dark:text-orange-500 uppercase tracking-widest'

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
  /** Ô đi được của quân vừa gõ sai — tô chấm cam lên bàn. */
  const [hintSquares, setHintSquares] = useState<Square[]>([])
  const [thinking, setThinking] = useState(false)
  const [flipped, setFlipped] = useState(false)
  /** Màu người chơi chọn khi đấu bot. Trực tuyến thì phòng chia, không dùng cái này. */
  const [preferredColor, setPreferredColor] = useState<Color>('w')
  /**
   * Ván kết thúc KHÔNG do luật cờ: xin thua hoặc hết giờ.
   *
   * Gộp một chỗ thay vì hai cờ riêng — hai cờ thì mỗi lần thêm cách kết thúc lại phải
   * nhớ kiểm cả hai ở năm chỗ, và quên một chỗ là ván vẫn cho đi tiếp sau khi đã xong.
   */
  const [manualEnd, setManualEnd] = useState<ManualEnd | null>(null)
  const [clockOn, setClockOn] = useState(true)
  const [clock, setClock] = useState<ClockState>(() => newClock('w'))
  /** Chỉ để VẼ LẠI đồng hồ. Giờ thật tính bằng hiệu hai mốc, không bằng số nhịp. */
  const [now, setNow] = useState(() => Date.now())
  /** Đoạn văn bản gõ sai, để gạch đỏ dưới ô nhập. */
  const [badToken, setBadToken] = useState<{ text: string; at: number } | null>(null)

  /** Mở app bằng link phòng thì vào thẳng chế độ trực tuyến. */
  const initialRoom = useMemo(() => readRoomFromHash(), [])
  const [roomId, setRoomId] = useState<string | null>(initialRoom)
  const [opponent, setOpponent] = useState<Opponent>(initialRoom ? 'online' : 'bot-medium')

  const inputRef = useRef<HTMLInputElement>(null)
  /**
   * Câu lệnh của lần gửi gần nhất.
   *
   * Không dùng `input` được: người chơi gõ tiếp là nó đổi ngay, mà vạch đỏ phải chỉ vào
   * câu ĐÃ GỬI chứ không phải câu đang sửa dở.
   */
  const lastCommandRef = useRef('')

  const online = opponent === 'online'
  const versusBot = opponent.startsWith('bot-')

  const resetLocal = useCallback(() => {
    setState(service.reset())
    setLastMove(null)
    setError(null)
    setHintSquares([])
    setBadToken(null)
    setManualEnd(null)
    setClock(newClock('w'))
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

      /**
       * Nhận giờ từ bên vừa đi.
       *
       * Họ mới là bên biết chính xác đã dùng bao lâu. Tự tính ở đây thì độ trễ mạng bị
       * tính vào giờ của họ, và mỗi nước lại lệch thêm một chút.
       */
      setClock((current) => ({
        base: message.clock ?? remaining(current, Date.now()),
        turn: service.state.turn,
        runningSince: Date.now(),
      }))

      // Doi thu di khi minh dang nhin cho khac — khong co tieng thi khong biet toi luot.
      if (service.state.isOver) playFinish()
      else playCorrect()
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

  const onResign = useCallback((color: Color) => {
    setManualEnd({ kind: 'resign', loser: color })
    playFinish()
  }, [])

  const room = useChessRoom(online ? roomId : null, myName, {
    onRemoteMove,
    onSyncRequest,
    onSyncState,
    onReset,
    onResign,
  })

  /** Màu của mình: trực tuyến thì phòng chia, đấu bot thì do người chơi chọn. */
  const myColor: Color | null = online ? room.myColor : preferredColor

  const myTurn = online
    ? myColor !== null && room.ready && state.turn === myColor
    : versusBot
      ? state.turn === preferredColor
      : true

  const examples = useMemo(() => examplesFor(language), [language])

  const times = clockOn
    ? remaining(clock, now)
    : { whiteMs: INITIAL_MS, blackMs: INITIAL_MS }

  /**
   * Nhịp vẽ lại đồng hồ.
   *
   * CHỈ để vẽ. Giờ thật tính bằng hiệu hai mốc thời gian, nên tab chạy nền bị trình duyệt
   * bóp nhịp cũng không ai được lợi giờ.
   */
  useEffect(() => {
    if (!clockOn || clock.runningSince === null) return

    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [clockOn, clock.runningSince])

  /**
   * Hết giờ.
   *
   * Luật FIDE 6.9: hết giờ mà bên kia KHÔNG đủ quân chiếu hết thì HOÀ, không phải thua.
   * Thiếu vế này thì người còn mỗi vua vẫn "thắng" khi đối thủ hết giờ — ai biết luật
   * cũng nhận ra ngay.
   */
  useEffect(() => {
    if (!clockOn || manualEnd || state.isOver || clock.runningSince === null) return

    /**
     * Tính lại giờ NGAY TRONG effect thay vì phụ thuộc vào biến `times` bên ngoài.
     *
     * `times` là object mới mỗi lần vẽ, nên đưa nó vào mảng phụ thuộc là effect chạy sau
     * mọi lần vẽ, kể cả những lần chẳng liên quan gì tới đồng hồ.
     */
    const flag = flagged(remaining(clock, now))
    if (!flag) return

    setManualEnd({ kind: 'timeout', ...timeoutResult(state.fen, flag) })
    setClock((current) => stop(current, Date.now()))
    playFinish()
  }, [clockOn, manualEnd, state.isOver, state.fen, clock, now])

  /** Ván kết thúc theo luật cờ thì cũng phải dừng đồng hồ. */
  useEffect(() => {
    if (state.isOver && clock.runningSince !== null) {
      setClock((current) => stop(current, Date.now()))
    }
  }, [state.isOver, clock.runningSince])

  /** Cầm quân Đen thì tự lật bàn — không ai muốn chơi mà quân mình ở phía xa. */
  useEffect(() => {
    if (myColor === 'b') setFlipped(true)
  }, [myColor])

  const newGame = useCallback(() => {
    resetLocal()
    if (online) room.sendReset()
    inputRef.current?.focus()
  }, [resetLocal, online, room])

  /**
   * Xin thua.
   *
   * Đấu mạng bắt buộc phải có: thua rồi mà không có cách kết thúc thì người ta chỉ đóng
   * tab, và đối thủ ngồi chờ một nước đi không bao giờ tới.
   */
  const resign = useCallback(() => {
    if (myColor === null) return

    setManualEnd({ kind: 'resign', loser: myColor })
    playFinish()
    if (online) room.sendResign(myColor)
  }, [myColor, online, room])

  const undo = useCallback(() => {
    // Đấu bot phải lùi HAI nửa nước: một của bot, một của mình. Lùi một thì tới lượt bot
    // và nó đi lại ngay, người chơi không sửa được gì.
    service.undo()
    if (versusBot && service.state.turn !== preferredColor) service.undo()

    setState(service.state)
    setLastMove(null)
    setError(null)
    inputRef.current?.focus()
  }, [service, versusBot, preferredColor])

  /**
   * Lượt của bot.
   *
   * `setTimeout` không phải để giả vờ suy nghĩ mà là BẮT BUỘC: tìm kiếm chạy đồng bộ và
   * mức khó khoá luồng chính gần một giây. Gọi thẳng trong effect thì React chưa kịp vẽ
   * chữ "bot đang nghĩ", người chơi thấy trang đơ chứ không thấy phản hồi nào.
   */
  useEffect(() => {
    if (!versusBot || state.isOver || manualEnd || state.turn === preferredColor) return

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
          if (result.state.isOver) playFinish()
          else playCorrect()

          const at = Date.now()
          setClock((current) => {
            const next = switchTurn(current, result.state.turn, at)
            return result.state.isOver ? stop(next, at) : next
          })
        }
      }

      setThinking(false)
    }, 30)

    return () => {
      cancelled = true
      clearTimeout(id)
      setThinking(false)
    }
  }, [state.fen, state.turn, state.isOver, versusBot, opponent, preferredColor, manualEnd, service])

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

    if (state.isOver || manualEnd || thinking || !myTurn) return

    lastCommandRef.current = input
    const parsed = parseCommand(language, input)

    if (!parsed.ok) {
      // Gợi ý cú pháp đã hiện thường trực dưới ô nhập, nên không lặp lại trong lỗi.
      setError(describeParseError(parsed.error, t))
      setHintSquares([])
      setBadToken(
        parsed.error.token && parsed.error.at !== undefined && parsed.error.at >= 0
          ? { text: parsed.error.token, at: parsed.error.at }
          : null,
      )
      playWrong()
      return
    }

    const result = service.applyMove(parsed.move)

    if (!result.ok) {
      setError(describeMoveError(result.error, t))
      setHintSquares(result.error.legalTargets ?? [])
      setBadToken(null)
      playWrong()
      return
    }

    setState(result.state)
    setLastMove({ from: parsed.move.from, to: parsed.move.to })
    setInput('')
    setError(null)
    setHintSquares([])
    setBadToken(null)

    // Tieng phan hoi nhu che do go code: dung lai dung ham do, khong them am moi.
    if (result.state.isOver) playFinish()
    else playCorrect()

    const at = Date.now()
    const next = switchTurn(clock, result.state.turn, at)
    setClock(result.state.isOver ? stop(next, at) : next)

    if (online) room.sendMove(parsed.move, result.state.fen, next.base)
  }

  const pieces = service.pieces()

  const checkSquare =
    state.status === 'check' || state.status === 'checkmate'
      ? (pieces.find((p) => p.type === 'k' && p.color === state.turn)?.square ?? null)
      : null

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
      {/*
        Cột cài đặt bên trái, cùng khuôn với cột lọc của bảng xếp hạng.

        Ba nhóm này trước đây xếp thành ba hàng ngang chiếm hết phần trên màn hình, đẩy
        bàn cờ xuống dưới nếp gấp. Chúng là thứ chọn MỘT LẦN rồi thôi, không đáng chiếm
        chỗ của thứ người chơi nhìn suốt ván.
      */}
      <aside className="md:w-44 shrink-0 flex flex-col gap-4">
        {/*
          Bộ chọn ngôn ngữ phải có Ở ĐÂY, không mượn của tab "Type code".
          Cả điểm hay của chế độ này là gõ lệnh bằng ngôn ngữ khác nhau; bắt người chơi
          chuyển tab để đổi rồi quay lại là chặn đúng thứ họ tới đây để làm.

          Đổi giữa ván cũng được: thế cờ không liên quan gì tới ngôn ngữ của câu lệnh.
        */}
        <div className="flex flex-col gap-1">
          <div className={`${GROUP_LABEL} mb-1`}>{t.langFilterLabel}</div>
          {/* Hai cột: 14 mục xếp dọc một cột thì cột này dài gấp đôi bàn cờ. */}
          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
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
        </div>

        <div className="flex flex-col gap-1 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className={`${GROUP_LABEL} mb-1`}>{t.chessOpponent}</div>
          {(['bot-easy', 'bot-medium', 'bot-hard', 'human', 'online'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={opponent === value ? SMALL_BTN_ACTIVE : SMALL_BTN}
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

        {/*
          Chọn màu quân, chỉ khi đấu bot.

          Trực tuyến thì phòng chia theo thứ tự vào, còn hai người chung máy thì cả hai
          dùng chung ô nhập nên màu không có nghĩa. Người chơi cờ có gu rõ về việc cầm
          trắng hay đen, ép luôn cầm trắng là cắt mất một nửa số ván họ muốn chơi.
        */}
        {versusBot && (
          <div className="flex flex-col gap-1 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className={`${GROUP_LABEL} mb-1`}>{t.chessPlayAs}</div>
            {(['w', 'b'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={preferredColor === value ? SMALL_BTN_ACTIVE : SMALL_BTN}
                onClick={() => {
                  setPreferredColor(value)
                  setFlipped(value === 'b')
                  resetLocal()
                }}
              >
                {value === 'w' ? t.chessAsWhite : t.chessAsBlack}
              </button>
            ))}
          </div>
        )}

        {/*
          Đồng hồ TẮT ĐƯỢC.

          App này để luyện gõ; ép 15 phút lên người đang mò cú pháp Rust là chặn đúng mục
          đích chính của họ. Mặc định bật vì cờ có đồng hồ mới ra cờ.
        */}
        <div className="flex flex-col gap-1 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className={`${GROUP_LABEL} mb-1`}>{t.chessClockLabel}</div>
          {[true, false].map((value) => (
            <button
              key={String(value)}
              type="button"
              className={clockOn === value ? SMALL_BTN_ACTIVE : SMALL_BTN}
              onClick={() => {
                setClockOn(value)
                resetLocal()
              }}
            >
              {value ? t.chessClock15 : t.chessClockOff}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{t.chessIntro}</p>

        {online && (
          <OnlinePanel
            roomId={roomId}
            connected={room.connected}
            ready={room.ready}
            myColor={room.myColor}
            opponentName={room.opponentName}
            opponentLeft={room.opponentLeft}
            onLeave={leaveRoom}
            t={t}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-6">
        <ChessBoard
          pieces={pieces}
          lastMove={lastMove}
          checkSquare={checkSquare}
          hintSquares={hintSquares}
          flipped={flipped}
        />

        <div className="flex-1 min-w-0 flex flex-col gap-3 font-mono text-sm">
          {clockOn && (
            <ChessClock
              whiteMs={times.whiteMs}
              blackMs={times.blackMs}
              running={clock.runningSince === null ? null : clock.turn}
              flipped={flipped}
            />
          )}

          <StatusLine
            state={state}
            thinking={thinking}
            manualEnd={manualEnd}
            myColor={myColor}
            t={t}
          />

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
            {/* Chỉ có nghĩa khi có đối thủ thật: hai người chung máy thì cứ bảo nhau. */}
            {(online || versusBot) && !state.isOver && !manualEnd && state.history.length > 0 && (
              <button
                type="button"
                className={BTN}
                onClick={() => {
                  if (window.confirm(t.chessResignConfirm)) resign()
                }}
              >
                {t.chessResign}
              </button>
            )}
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
              if (error) {
                setError(null)
                setHintSquares([])
                setBadToken(null)
              }
            }}
            disabled={state.isOver || Boolean(manualEnd) || thinking || !myTurn}
            placeholder={state.isOver ? '' : !myTurn ? t.chessWaitTurn : t.chessCommandPlaceholder}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="flex-1 min-w-0 px-3 py-2 rounded border font-mono text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={state.isOver || Boolean(manualEnd) || thinking || !myTurn}
            className="px-4 py-2 rounded text-sm font-medium cursor-pointer bg-orange-500 text-zinc-900 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.chessSubmit}
          </button>
        </div>

        {/*
          Ba dòng, không phải một.

          Nhập thành là "đi vua hai ô" — không ai đoán ra nếu chỉ thấy ví dụ đi thường.
          Người chơi sẽ thử `O-O`, bị báo sai cú pháp, rồi bỏ giữa ván.
        */}
        <dl className="font-mono text-xs text-zinc-500 dark:text-zinc-400 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt>{t.chessSyntaxLabel}</dt>
          <dd>
            <code className="text-orange-600 dark:text-orange-400">{examples.move}</code>
          </dd>
          <dt>{t.chessSyntaxCastle}</dt>
          <dd>
            <code className="text-orange-600 dark:text-orange-400">{examples.castle}</code>
          </dd>
          <dt>{t.chessSyntaxPromote}</dt>
          <dd>
            <code className="text-orange-600 dark:text-orange-400">{examples.promote}</code>
          </dd>
        </dl>

        {error && (
          <div role="alert" className="font-mono text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/*
          Chỉ ra ĐÚNG đoạn gõ sai trong câu lệnh.

          Với câu dài như lệnh SQL thì "z9 không phải ô cờ" vẫn bắt người chơi đi dò lại
          cả dòng. Vẽ lại câu và gạch đỏ đúng chỗ thì mắt bắt được ngay.
        */}
        {badToken && (
          <pre className="font-mono text-xs text-zinc-500 dark:text-zinc-400 overflow-x-auto">
            {lastCommandRef.current.slice(0, badToken.at)}
            <span className="text-red-600 dark:text-red-400 underline decoration-wavy decoration-red-500">
              {badToken.text}
            </span>
            {lastCommandRef.current.slice(badToken.at + badToken.text.length)}
          </pre>
        )}
        </form>
      </div>
    </div>
  )
}

function OnlinePanel({
  roomId,
  connected,
  ready,
  myColor,
  opponentName,
  opponentLeft,
  onLeave,
  t,
}: {
  roomId: string | null
  connected: boolean
  ready: boolean
  myColor: Color | null
  opponentName: string | null
  opponentLeft: boolean
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
            {opponentName && (
              <span className="text-zinc-500 dark:text-zinc-400"> · vs {opponentName}</span>
            )}
          </span>
        )}

        {/* Doi thu dong tab: presence tu don nen minh biet ngay, khong ngoi cho mai. */}
        {opponentLeft && (
          <div className="mt-1 text-red-600 dark:text-red-400">{t.chessOpponentLeft}</div>
        )}
      </div>
    </div>
  )
}

function StatusLine({
  state,
  thinking,
  manualEnd,
  myColor,
  t,
}: {
  state: GameState
  thinking: boolean
  manualEnd: ManualEnd | null
  myColor: Color | null
  t: Translation
}) {
  // Xin thua / hết giờ đứng TRƯỚC mọi trạng thái khác: ván dừng ngay, bất kể thế cờ.
  if (manualEnd) {
    if (manualEnd.kind === 'resign') {
      return (
        <div className="text-orange-600 dark:text-orange-400 font-bold">
          {manualEnd.loser === myColor ? t.chessResigned : t.chessOpponentResigned}
        </div>
      )
    }

    return (
      <div className="text-orange-600 dark:text-orange-400 font-bold">
        {manualEnd.draw
          ? t.chessFlagDraw
          : manualEnd.loser === 'w'
            ? t.chessFlagWhite
            : t.chessFlagBlack}
      </div>
    )
  }

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
