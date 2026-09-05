import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChessBoard, GLIDE_MS } from './ChessBoard'
import { ChessClock } from './ChessClock'
import { CopyLinkButton } from './CopyLinkButton'
import { lazyChunk } from '../lib/lazyChunk'
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
  type ClockSnapshot,
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
import { playCastle, playCheck, playFinish, playPieceCapture, playPieceMove, playPromotion, playWrong }
  from '../lib/sound'
import { useSoundStore } from '../store/useSoundStore'
import { isLeaderboardEnabled } from '../lib/supabase'
import { submitChessResult } from '../lib/chessLeaderboard'
import { DialogBoundary } from './DialogBoundary'
import type { AppUser } from '../lib/auth'
import type { Color, GameState, Square } from '../lib/chess/types'
import type { SnippetLanguage } from '../data/types'
import type { Translation } from '../i18n/translations'

// Kéo theo logo 3 hãng đăng nhập / danh sách người chơi — chỉ tải khi thật sự cần mở.
const SignInDialog = lazyChunk('SignInDialog', () =>
  import('./SignInDialog').then((m) => ({ default: m.SignInDialog })),
)
const ChessLeaderboardDialog = lazyChunk('ChessLeaderboardDialog', () =>
  import('./ChessLeaderboardDialog').then((m) => ({ default: m.ChessLeaderboardDialog })),
)

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
  /**
   * `null` = chưa đăng nhập (khách). Đấu ONLINE giờ bắt buộc đăng nhập — xem chỗ gọi
   * `chooseOpponent`/`pendingRoomJoin` — để bảng xếp hạng ELO có tài khoản thật đối chiếu,
   * không phải tên gõ tuỳ ý.
   */
  currentUser: AppUser | null
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

/**
 * Xe đi kèm khi nhập thành, suy từ Ô ĐÍCH của vua — không cần hỏi lại chess.js.
 *
 * Nhập thành luôn cố định theo CỘT bất kể màu quân: vua sang cột g thì xe từ h về f, vua
 * sang cột c thì xe từ a về d. Khác nhau duy nhất giữa trắng/đen là HÀNG (1 hay 8), mà
 * hàng đó đã có sẵn trong chính ô đích của vua — không cần biết thêm gì khác.
 */
function castleRookMove(san: string, kingTo: Square): { from: Square; to: Square } | null {
  if (san !== 'O-O' && san !== 'O-O-O') return null

  const rank = kingTo[1]
  return san === 'O-O'
    ? { from: `h${rank}` as Square, to: `f${rank}` as Square }
    : { from: `a${rank}` as Square, to: `d${rank}` as Square }
}

/**
 * Ô vừa PHONG HẬU (hay phong quân khác) — cùng cách phát hiện nhập thành ở
 * `castleRookMove`: đọc thẳng ký hiệu chuẩn (SAN) mà engine trả về sẵn, không hỏi thêm.
 * chess.js ghi phong quân bằng `=Q`/`=R`/`=B`/`=N` ngay sau ô đích (`"e8=Q"`,
 * `"exd8=Q+"`), nên chỉ cần dò dấu `=` — không cần biết phong THÀNH quân gì, ô đích đã đủ
 * để `ChessBoard` tự đọc quân mới đang đứng ở đó (xem `promotedSquare` trong ChessBoard).
 */
function promotionSquare(san: string, moveTo: Square): Square | null {
  return san.includes('=') ? moveTo : null
}

/**
 * Một chỗ duy nhất quyết định mỗi nước đi kêu ra tiếng gì.
 *
 * Trước đây ba chỗ áp dụng nước đi — mình gõ, bot đi, đối thủ trên mạng đi — tự gọi
 * `playCorrect()` của chế độ gõ code. Hai vấn đề. Một, tiếng "bíp gõ đúng phím" chẳng
 * liên quan gì tới bàn cờ, và ăn quân với đi thường kêu giống hệt nhau nên tai không
 * biết vừa xảy ra chuyện gì. Hai, và đây mới là lỗi thật: cả ba chỗ đều KHÔNG hỏi công
 * tắc tắt tiếng, nên chế độ cờ vẫn kêu sau khi người dùng đã tắt tiếng cả app.
 *
 * Loại nước đi đọc từ ký hiệu cờ tiêu chuẩn mà engine trả về sẵn: `x` là ăn quân, `+` là
 * chiếu. Không phải hỏi thêm engine, và cũng không cần thêm trường nào vào `MoveResult`.
 */
function useChessSound(): (san: string, isOver: boolean) => void {
  const enabled = useSoundStore((s) => s.enabled)

  /*
    Đọc công tắc qua ref để danh tính hàm KHÔNG BAO GIỜ đổi.

    Phát tiếng là chỗ đổ tác dụng phụ, không phải giá trị mà thứ khác cần phản ứng theo.
    Nếu hàm đổi danh tính mỗi lần bật/tắt tiếng thì nó có mặt trong mảng phụ thuộc của
    effect điều khiển bot — và gạt công tắc giữa lúc bot đang nghĩ sẽ huỷ rồi bắt nó tính
    lại từ đầu. Người dùng chỉ vừa tắt loa.
  */
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  return useCallback((san: string, isOver: boolean) => {
    if (!enabledRef.current) return

    /*
      Trễ đúng bằng THỜI LƯỢNG TRƯỢT (`GLIDE_MS`), không phát ngay.

      Bản trước phát tiếng NGAY LÚC nước đi được áp dụng vào state — đúng lúc quân BẮT
      ĐẦU trượt, không phải lúc nó CHẠM ô đích. Lúc trượt còn 300ms thì độ lệch khó nhận
      ra; kéo dài lên 650ms (xem `GLIDE_MS`) thì tai nghe "cạch" trước khi mắt thấy quân
      tới nơi — lệch hẳn, đúng như phản hồi "tiếng với nước đi chưa khớp nhau". Tiếng
      quân chạm bàn phải phát đúng lúc quân CHẠM BÀN.

      (Có thử đổi hẳn sang tiếng "cọ sát" kéo dài suốt quãng trượt, phát ngay lúc bắt đầu
      thay vì trễ — nhưng không phiên bản nào ổn khi nghe lặp lại trong ván thật, nên quay
      lại tiếng gõ ngắn này.)
    */
    setTimeout(() => {
      // Hết ván thì chỉ một tiếng kết thúc. Chồng thêm tiếng đặt quân và tiếng chiếu vào
      // cùng một khoảnh khắc chỉ thành một cục tạp âm.
      if (isOver) {
        playFinish()
        return
      }

      /*
        Phong hậu ưu tiên TRƯỚC ăn quân: SAN của một nước vừa ăn vừa phong (`"exd8=Q+"`)
        chứa CẢ `x` LẪN `=` — kiểm `x` trước thì phong cấp (sự kiện lớn hơn hẳn) lại kêu y
        hệt một nước ăn quân bình thường, mất hẳn tác dụng "thăng hoa" của `playPromotion`.
      */
      if (san.includes('=')) playPromotion()
      else if (san.includes('x')) playPieceCapture()
      else if (san === 'O-O' || san === 'O-O-O') playCastle()
      else playPieceMove()

      // Chiếu thì kêu THÊM chứ không kêu thay: vẫn cần nghe quân vừa đặt xuống.
      if (san.includes('+')) playCheck()
    }, GLIDE_MS)
  }, [])
}

export function ChessMode({
  language,
  languages,
  onSelectLanguage,
  myName,
  currentUser,
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
  const [undoMove, setUndoMove] = useState<{ from: Square; to: Square } | null>(null)
  const [capturedPiece, setCapturedPiece] = useState<{
    square: Square
    type: string
    color: Color
  } | null>(null)
  const [castleRook, setCastleRook] = useState<{ from: Square; to: Square } | null>(null)
  const [promotedSquare, setPromotedSquare] = useState<Square | null>(null)

  const sound = useChessSound()
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

  /**
   * Mở app bằng link phòng thì vào thẳng chế độ trực tuyến — NHƯNG chỉ khi đã đăng nhập
   * (đấu online giờ bắt buộc, để bảng xếp hạng ELO có tài khoản thật). Chưa đăng nhập thì
   * giữ mã phòng lại chờ (`pendingRoomJoin`), hiện hộp thoại đăng nhập, và chỉ THỰC SỰ
   * vào phòng ở effect bên dưới, sau khi `currentUser` có giá trị — đúng lúc đó dù là vì
   * phiên đăng nhập cũ tự khôi phục hay vì người dùng vừa đăng nhập xong trong hộp thoại.
   */
  const initialRoom = useMemo(() => readRoomFromHash(), [])
  const [pendingRoomJoin, setPendingRoomJoin] = useState<string | null>(initialRoom)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [opponent, setOpponent] = useState<Opponent>('bot-medium')
  const [showSignIn, setShowSignIn] = useState(false)
  const [showChessLeaderboard, setShowChessLeaderboard] = useState(false)

  useEffect(() => {
    if (!pendingRoomJoin) return
    if (!currentUser) {
      setShowSignIn(true)
      return
    }
    setRoomId(pendingRoomJoin)
    setOpponent('online')
    setPendingRoomJoin(null)
  }, [pendingRoomJoin, currentUser])

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
    setUndoMove(null)
    setCapturedPiece(null)
    setCastleRook(null)
    setPromotedSquare(null)
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
      const captured = service.pieces().find((p) => p.square === message.move.to) ?? null
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
      setUndoMove(null)
      setCapturedPiece(result.ok ? captured : null)
      setCastleRook(result.ok ? castleRookMove(result.san, message.move.to) : null)
      setPromotedSquare(result.ok ? promotionSquare(result.san, message.move.to) : null)
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

      // Đối thủ đi lúc mình đang nhìn chỗ khác — không có tiếng thì không biết tới lượt.
      sound(result.ok ? result.san : '', service.state.isOver)
    },
    [service, sound],
  )

  /**
   * Gửi giờ hiện tại CÙNG với thế cờ.
   *
   * `SyncMessage.clock` đã khai báo từ trước với đúng mục đích này ("để người vào lại
   * giữa ván không được cấp 15 phút mới"), nhưng chưa từng được gán giá trị ở đây — một
   * trường tồn tại chỉ trên giấy. Người rớt mạng giữa ván rồi vào lại nhận đúng thế cờ
   * nhưng đồng hồ cục bộ của họ (`useState(() => newClock('w'))` lúc mở lại tab) vẫn là
   * 15:00/15:00 mới tinh — bug thật, không phải giả thuyết: gắn `clock` vào tsx bug tracker
   * lúc rà lại toàn bộ tính năng mới lộ ra vì chưa ai thử refresh giữa ván có đồng hồ.
   *
   * Tính bằng `remaining()` chứ không gửi thẳng `clock.base`: `base` chỉ đúng tại đúng
   * lúc `runningSince` được đặt, còn thời gian đã trôi từ đó tới lúc gửi tin thì chưa trừ.
   */
  const onSyncRequest = useCallback(
    () => ({
      fen: service.state.fen,
      history: service.state.history,
      clock: remaining(clock, Date.now()),
    }),
    [service, clock],
  )

  const onSyncState = useCallback(
    (snapshot: { fen: string; history: string[]; clock?: ClockSnapshot }) => {
      // Chỉ nhận khi mình CHƯA đi nước nào. Không thì hai người cùng vào một lúc sẽ
      // ghi đè bàn cờ của nhau qua lại.
      if (service.state.history.length > 0) return
      if (snapshot.history.length === 0) return

      const loaded = service.load(snapshot.fen)
      setState(loaded)

      if (snapshot.clock) {
        setClock({
          base: snapshot.clock,
          turn: loaded.turn,
          runningSince: loaded.isOver ? null : Date.now(),
        })
      }
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

  /**
   * Định danh ván đấu ONLINE hiện tại — để cả hai máy gọi `submitChessResult` với đúng
   * cùng một `gameId` khi ván kết thúc (xem `record_chess_result`, chặn cộng điểm hai
   * lần bằng khoá này). `null` giữa hai ván (đã hết ván cũ, ván mới chưa kịp bắt đầu).
   */
  const [gameId, setGameId] = useState<string | null>(null)
  const onGameStart = useCallback((id: string) => setGameId(id), [])

  const room = useChessRoom(online ? roomId : null, myName, currentUser?.id ?? null, {
    onRemoteMove,
    onSyncRequest,
    onSyncState,
    onReset,
    onResign,
    onGameStart,
  })

  /** Màu của mình: trực tuyến thì phòng chia, đấu bot thì do người chơi chọn. */
  const myColor: Color | null = online ? room.myColor : preferredColor

  /**
   * Phát định danh ván mới — CHỈ bên Trắng, đúng lúc bàn cờ vừa về vị trí xuất phát và cả
   * hai đã vào phòng. Trắng luôn tồn tại và được xác định NHƯ NHAU ở cả hai máy (chia màu
   * theo `joinedAt`, xem `colorFor`), nên chọn nó làm "người phát" tránh được việc cả hai
   * máy cùng tự sinh `gameId` khác nhau cho cùng một ván. Đen chỉ NHẬN qua `onGameStart`.
   */
  useEffect(() => {
    if (!online || !room.ready || myColor !== 'w' || state.history.length !== 0) return

    const id = crypto.randomUUID()
    setGameId(id)
    room.sendGameStart(id)
    // `room` là object MỚI mỗi lần vẽ (không phải state/ref) — đưa cả nó vào mảng phụ
    // thuộc thì effect chạy lại ở MỌI lần vẽ trong khi điều kiện trên vẫn đúng, phát
    // `game-start` lặp lại với `gameId` MỚI mỗi lần, hai máy không bao giờ đồng thuận nổi
    // một giá trị. Chỉ ba giá trị nguyên thuỷ trong điều kiện mới là thứ đáng theo dõi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, room.ready, myColor, state.history.length])

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

  /**
   * Ván kết thúc — theo luật cờ HOẶC xin thua — thì phải dừng đồng hồ.
   *
   * Bản trước chỉ kiểm `state.isOver`. Xin thua (local hoặc qua `onResign` từ đối thủ)
   * không đụng tới `state` — nó là một cờ RIÊNG (`manualEnd`) — nên đồng hồ vẫn chạy sau
   * khi ai đó xin thua: tấm "you resigned" hiện ra trong khi `ChessClock` phía trên vẫn
   * tích tắc, có thể chạy tới tận 0:00. Người chơi thấy hai thông điệp mâu thuẫn cùng lúc.
   */
  useEffect(() => {
    if ((state.isOver || manualEnd) && clock.runningSince !== null) {
      setClock((current) => stop(current, Date.now()))
    }
  }, [state.isOver, manualEnd, clock.runningSince])

  /**
   * Nộp kết quả ván ONLINE lên bảng xếp hạng ELO — đúng MỘT lần mỗi ván, ngay khi ván
   * kết thúc (theo luật cờ hoặc xin thua/hết giờ, cùng điều kiện với effect dừng đồng hồ
   * ở trên).
   *
   * Im lặng bỏ qua (không nộp) nếu thiếu bất kỳ điều kiện nào: chưa đăng nhập, chưa có
   * `gameId` (chưa kịp đồng bộ lúc ván vừa bắt đầu), hoặc chưa biết ID đối thủ (đối thủ
   * chưa đăng nhập — dù giờ đã bắt đăng nhập mới vào được phòng, vẫn phòng hờ trường hợp
   * họ vào TRƯỚC khi bản này lên, hoặc rớt mạng đúng lúc). Bỏ qua an toàn hơn báo lỗi:
   * ván vẫn chơi và kết thúc bình thường, chỉ là không được tính điểm.
   *
   * `submittedGameRef` chặn gọi lại nhiều lần (component vẽ lại nhiều lần trong lúc
   * `state.isOver`/`manualEnd` vẫn giữ nguyên giá trị) — so theo `gameId` chứ không phải
   * boolean đơn thuần, để ván MỚI (gameId khác) vẫn nộp được bình thường.
   */
  const submittedGameRef = useRef<string | null>(null)
  useEffect(() => {
    if (!online || !currentUser || !gameId || !myColor || !room.opponentId) return
    if (!(state.isOver || manualEnd)) return
    if (submittedGameRef.current === gameId) return
    submittedGameRef.current = gameId

    const { winner } = resultOf(state, manualEnd, t)
    const reason = resultReasonCode(state, manualEnd)
    const winnerCode: 'w' | 'b' | 'draw' = winner ?? 'draw'

    const me = { id: currentUser.id, name: currentUser.displayName, avatarUrl: currentUser.avatarUrl }
    const opponentPlayer = { id: room.opponentId, name: room.opponentName ?? 'opponent', avatarUrl: null }

    void submitChessResult({
      gameId,
      white: myColor === 'w' ? me : opponentPlayer,
      black: myColor === 'b' ? me : opponentPlayer,
      winner: winnerCode,
      reason,
    })
  }, [online, currentUser, gameId, myColor, room.opponentId, room.opponentName, state, manualEnd, t])

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
    //
    // Bắt lấy ô đi/đến của TỪNG nửa nước NGAY TRƯỚC KHI lùi nó — sau khi lùi thì thông tin
    // đó mất khỏi biên bản. Đấu bot thì ưu tiên trượt lại nước CỦA MÌNH (nửa nước lùi sau
    // cùng): đó là thứ người chơi vừa thấy trên bàn và đang mong sửa lại.
    const undone1 = service.lastMoveSquares()
    service.undo()

    let reversed = undone1
    if (versusBot && service.state.turn !== preferredColor) {
      reversed = service.lastMoveSquares()
      service.undo()
    }

    setState(service.state)
    setLastMove(null)
    setUndoMove(reversed ? { from: reversed.to, to: reversed.from } : null)
    setCapturedPiece(null)
    // Lùi nước nhập thành: Xe không tự trượt ngược lại (chỉ Vua có, qua `undoMove` ở
    // trên) — biết trước và chấp nhận, xem ghi chú ở `CASTLE_GLIDE_MS`/`castleRookMove`.
    setCastleRook(null)
    setError(null)
    inputRef.current?.focus()
  }, [service, versusBot, preferredColor])

  /**
   * Lượt của bot.
   *
   * HAI bước tách rời — TÍNH sớm, ÁP DỤNG đúng nhịp — không phải một `setTimeout` như
   * bản trước. Lý do: bản gộp-một-bước từng đổi trễ từ 30ms lên `GLIDE_MS` để bot đợi
   * quân mình trượt xong rồi mới đi — đúng hướng, nhưng kéo theo một lỗi mới không thấy
   * ngay. Tìm kiếm của bot chạy ĐỒNG BỘ, mức khó khoá luồng chính tới gần một giây; đúng
   * lúc `useLandedMove` (ChessBoard) cũng đang chờ hết `GLIDE_MS` để bật vòng cam cho
   * nước MÌNH vừa đi. Hai hẹn giờ trùng mốc `GLIDE_MS`, mà lỡ hẹn giờ của bot chạy trước
   * và khoá luồng chính lúc tính, thì vòng cam của MÌNH bị giữ lại kẹt phía sau — quân đã
   * đứng yên (compositor riêng, không bị khoá) mà vòng cam thì mắc kẹt, sáng trễ thêm cả
   * trăm mili giây. Đúng phản hồi "chưa khớp" sau khi tưởng đã sửa xong.
   *
   * Sửa tận gốc: TÍNH sớm (30ms, đủ để React vẽ chữ "bot đang nghĩ" trước khi khoá luồng)
   * — phần này chạy khi nào cũng được, không ảnh hưởng hình vì quân đang trượt là
   * compositor. Chỉ có bước ÁP DỤNG (rẻ, tức thời) mới cần đúng nhịp `GLIDE_MS`, và tính
   * từ lúc HIỆU ỨNG BẮT ĐẦU chứ không phải từ lúc tính xong — khỏi cộng dồn.
   */
  useEffect(() => {
    if (!versusBot || state.isOver || manualEnd || state.turn === preferredColor) return

    setThinking(true)
    let cancelled = false
    let applyId: ReturnType<typeof setTimeout> | null = null
    const startedAt = performance.now()

    const computeId = setTimeout(() => {
      const move = pickMove(state.fen, {
        level: BOT_LEVEL[opponent as keyof typeof BOT_LEVEL],
      })

      if (cancelled) return

      // Đã tính xong — có thể đã chiếm mất một khoảng luồng chính. Trừ đi phần đó, chỉ
      // chờ ĐÚNG PHẦN CÒN LẠI của `GLIDE_MS`, không phải thêm nguyên một `GLIDE_MS` nữa.
      const remaining = Math.max(0, GLIDE_MS - (performance.now() - startedAt))

      applyId = setTimeout(() => {
        if (cancelled) return

        if (move) {
          const captured = service.pieces().find((p) => p.square === move.to) ?? null
          const result = service.applyMove(move)
          if (result.ok) {
            setState(result.state)
            setLastMove({ from: move.from, to: move.to })
            setUndoMove(null)
            setCapturedPiece(captured)
            setCastleRook(castleRookMove(result.san, move.to))
            setPromotedSquare(promotionSquare(result.san, move.to))
            sound(result.san, result.state.isOver)

            const at = Date.now()
            setClock((current) => {
              const next = switchTurn(current, result.state.turn, at)
              return result.state.isOver ? stop(next, at) : next
            })
          }
        }

        setThinking(false)
      }, remaining)
    }, 30)

    return () => {
      cancelled = true
      clearTimeout(computeId)
      if (applyId !== null) clearTimeout(applyId)
      setThinking(false)
    }
    // `sound` có danh tính cố định (xem `useChessSound`), nên có mặt ở đây không làm bot
    // phải tính lại mỗi khi người chơi gạt công tắc tiếng.
  }, [
    state.fen,
    state.turn,
    state.isOver,
    versusBot,
    opponent,
    preferredColor,
    manualEnd,
    service,
    sound,
  ])

  function chooseOpponent(value: Opponent) {
    // Bắt đăng nhập TRƯỚC khi vào phòng — không chuyển `opponent` sang 'online' nếu chưa
    // có tài khoản, để không có ván nào bắt đầu rồi mới phát hiện không nộp được điểm.
    if (value === 'online' && !currentUser) {
      setShowSignIn(true)
      return
    }

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

    const captured = service.pieces().find((p) => p.square === parsed.move.to) ?? null
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
    setUndoMove(null)
    setCapturedPiece(captured)
    setCastleRook(castleRookMove(result.san, parsed.move.to))
    setPromotedSquare(promotionSquare(result.san, parsed.move.to))
    setInput('')
    setError(null)
    setHintSquares([])
    setBadToken(null)

    sound(result.san, result.state.isOver)

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

  // Chỉ chiếu HẾT mới giơ cờ trắng — chiếu thường (`checkSquare` khác `null` nhưng chưa
  // hết ván) thì Vua vẫn còn nước đi, đầu hàng lúc đó là sai.
  const checkmateSquare = state.status === 'checkmate' ? checkSquare : null

  return (
    /*
      max-w-6xl chứ không phải max-w-4xl như trước.

      4xl (896px) là khuôn tính từ HỒI CHƯA có khung viền và khay quân chết. Cả hai thêm
      vào hôm nay đã đẩy bề rộng khối bàn cờ tăng hơn 100px, mà khuôn ngoài không nới theo
      — kết quả đo được: cột phải (đồng hồ, nút, biên bản) bị ép còn ĐÚNG 41px ở màn hình
      1280px, mỗi chữ vỡ thành nhiều dòng ("white" / "to" / "move"). Đây là lỗi thật, không
      phải cảm giác — đo trực tiếp trong DOM chứ không đoán.
    */
    <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
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
          undoMove={undoMove}
          capturedPiece={capturedPiece}
          castleRook={castleRook}
          promotedSquare={promotedSquare}
          checkmatedSquare={checkmateSquare}
          checkSquare={checkSquare}
          hintSquares={hintSquares}
          captured={state.captured}
          flipped={flipped}
        />

        {/*
          Sàn 15rem thay cho `min-w-0`.

          `min-w-0` cho phép flex item co tới 0 — đúng công dụng của nó ở chỗ khác (chữ
          dài cần phép co để `overflow`/`truncate` hoạt động), nhưng ở ĐÂY nó là nguyên
          nhân trực tiếp của lỗi: khối bàn cờ không co được (kích thước cố định theo nội
          dung), nên mọi khoảng thiếu hụt đổ hết vào cột này — đo được co tới 41px thật.
          Cột này chứa nút bấm và chữ tiếng Anh, không có gì cần co bằng 0 để hoạt động
          đúng; 15rem là bề rộng đủ cho "flip board" nằm một dòng.
        */}
        <div className="flex-1 min-w-60 flex flex-col gap-3 font-mono text-sm">
          {clockOn && (
            <ChessClock
              whiteMs={times.whiteMs}
              blackMs={times.blackMs}
              running={clock.runningSince === null ? null : clock.turn}
              flipped={flipped}
            />
          )}

          {state.isOver || manualEnd ? (
            <GameOverPanel
              state={state}
              manualEnd={manualEnd}
              /*
                Chỉ xưng "bạn thắng/thua" khi có một đối thủ THẬT SỰ khác mình — đấu bot
                hoặc trực tuyến. Ván hai người ngồi chung máy thì `myColor` vẫn có giá trị
                (màu người chơi CHỌN lúc mở ván), nhưng gọi nó là "bạn" ở đó vô nghĩa: cả
                hai người đang ngồi cùng một chỗ, ai cũng là "bạn" như nhau.
              */
              myColor={online || versusBot ? myColor : null}
              onNewGame={newGame}
              t={t}
            />
          ) : (
            <StatusLine state={state} thinking={thinking} t={t} />
          )}

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
            {/* Chỉ có ý nghĩa khi Supabase bật — bảng xếp hạng chỉ tính ván online. */}
            {isLeaderboardEnabled && (
              <button
                type="button"
                className={BTN}
                onClick={() => setShowChessLeaderboard(true)}
              >
                {t.chessLeaderboardBtn}
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

      {showSignIn && (
        <DialogBoundary closeLabel={t.close} message={t.dialogError} onClose={() => setShowSignIn(false)}>
          <Suspense fallback={null}>
            <SignInDialog onClose={() => setShowSignIn(false)} t={t} />
          </Suspense>
        </DialogBoundary>
      )}

      {showChessLeaderboard && (
        <DialogBoundary
          closeLabel={t.close}
          message={t.dialogError}
          onClose={() => setShowChessLeaderboard(false)}
        >
          <Suspense fallback={null}>
            <ChessLeaderboardDialog onClose={() => setShowChessLeaderboard(false)} t={t} />
          </Suspense>
        </DialogBoundary>
      )}

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
          <div
            role="alert"
            className="font-mono text-xs text-red-600 dark:text-red-400 animate-fade-in"
          >
            {error}
          </div>
        )}

        {/*
          Chỉ ra ĐÚNG đoạn gõ sai trong câu lệnh.

          Với câu dài như lệnh SQL thì "z9 không phải ô cờ" vẫn bắt người chơi đi dò lại
          cả dòng. Vẽ lại câu và gạch đỏ đúng chỗ thì mắt bắt được ngay.
        */}
        {badToken && (
          <pre className="font-mono text-xs text-zinc-500 dark:text-zinc-400 overflow-x-auto animate-fade-in">
            {lastCommandRef.current.slice(0, badToken.at)}
            <span className="text-red-600 dark:text-red-400 underline decoration-wavy decoration-red-500">
              {badToken.text}
            </span>
            {lastCommandRef.current.slice(badToken.at + badToken.text.length)}
          </pre>
        )}
        </form>
      </div>

      {/*
        Ghi công AGPLv3+ của bộ quân "pixel" (therealqtpi, lichess-org/lila) — BẮT BUỘC
        theo giấy phép, không phải trang trí. Trước đứng thành một dòng riêng ngay đầu
        trang, chiếm chỗ cạnh phần giới thiệu; giờ dồn xuống góc, nhỏ và mờ, vẫn LUÔN THẤY
        ĐƯỢC (không che, không cuộn mất) mà không tranh chỗ với nội dung chính. Xem chi
        tiết điều khoản trong `pieceSprites.ts`.
      */}
      <div className="fixed bottom-1.5 right-2 font-mono text-[10px] text-zinc-400/60 dark:text-zinc-600/60">
        Pieces:{' '}
        <a
          href="https://github.com/lichess-org/lila/tree/master/public/piece/pixel"
          rel="noopener"
          className="underline hover:text-zinc-600 dark:hover:text-zinc-400"
        >
          therealqtpi/lila
        </a>{' '}
        <a
          href="https://www.gnu.org/licenses/agpl-3.0.html"
          rel="noopener"
          className="underline hover:text-zinc-600 dark:hover:text-zinc-400"
        >
          AGPLv3+
        </a>
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

/**
 * Dòng trạng thái cho ván ĐANG CHƠI. Ván đã kết thúc chuyển sang `GameOverPanel` — hai
 * cái không dùng chung một hàm vì kết thúc cần nhiều chỗ hơn một dòng chữ (xem đó).
 */
function StatusLine({
  state,
  thinking,
  t,
}: {
  state: GameState
  thinking: boolean
  t: Translation
}) {
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

/** Kết quả một ván, quy về ba loại — đủ để chọn màu và tiêu đề của tấm kết quả. */
type Result = 'win' | 'loss' | 'draw'

/**
 * Suy kết quả VÀ lý do từ trạng thái ván.
 *
 * Gộp về đúng ba loại kết quả (thắng/thua/hoà) tách biệt khỏi LÝ DO (chiếu hết, hết giờ,
 * xin thua, hoà cờ theo luật nào) vì hai thứ đó cần hiển thị khác nhau: kết quả quyết
 * định MÀU và TIÊU ĐỀ lớn của tấm, lý do chỉ là một dòng phụ bên dưới.
 */
function resultOf(
  state: GameState,
  manualEnd: ManualEnd | null,
  t: Translation,
): { winner: Color | null; reason: string } {
  if (manualEnd) {
    if (manualEnd.kind === 'resign') {
      return { winner: manualEnd.loser === 'w' ? 'b' : 'w', reason: t.chessResign }
    }

    // Hoà cần câu đầy đủ (luật FIDE 6.9 không hiển nhiên); đã biết ai thắng thì chỉ cần
    // nói VÌ SAO — tiêu đề lớn của tấm đã nói ai thắng rồi, lặp lại là thừa.
    return {
      winner: manualEnd.draw ? null : manualEnd.loser === 'w' ? 'b' : 'w',
      reason: manualEnd.draw ? t.chessFlagDraw : t.chessOutOfTime,
    }
  }

  if (state.status === 'checkmate') {
    return { winner: state.winner ?? null, reason: t.chessCheckmate }
  }

  const reason =
    state.status === 'stalemate'
      ? t.chessStalemate
      : state.status === 'draw-insufficient'
        ? t.chessDrawMaterial
        : state.status === 'draw-threefold'
          ? t.chessDrawRepetition
          : t.chessDrawFifty

  return { winner: null, reason }
}

/**
 * Cùng logic suy lý do như `resultOf`, nhưng trả về MÃ ỔN ĐỊNH (không dịch) thay vì chuỗi
 * đã dịch của `t` — dùng để LƯU xuống `chess_games.reason`. Chuỗi tiếng Anh của `t` có thể
 * đổi theo thời gian (sửa câu chữ UI); một cột lưu trữ thì không nên phụ thuộc vào đó.
 */
function resultReasonCode(state: GameState, manualEnd: ManualEnd | null): string {
  if (manualEnd) {
    if (manualEnd.kind === 'resign') return 'resign'
    return manualEnd.draw ? 'timeout-draw' : 'timeout'
  }
  if (state.status === 'checkmate') return 'checkmate'
  return state.status
}

const RESULT_STYLE: Record<Result, string> = {
  // Xanh lá cho thắng, đỏ cho thua — quy ước phổ biến ở mọi bàn cờ trực tuyến, không cần
  // học lại. Hoà giữ tông cam thương hiệu vì nó KHÔNG PHẢI thắng hay thua, chỉ là hết ván.
  win: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  loss: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
  draw: 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400',
}

/**
 * Tấm kết quả khi ván kết thúc.
 *
 * Trước đây kết thúc ván chỉ là MỘT DÒNG CHỮ CAM — thắng, thua và hoà đều nhạt như nhau,
 * và không có gì mời người chơi vào ván tiếp theo ngoài phải tự mò lên nút "new game" bé
 * ở hàng nút phía trên. Đây là khoảnh khắc quan trọng nhất của một ván cờ; nó xứng đáng
 * được vẽ khác hẳn phần còn lại của giao diện.
 */
function GameOverPanel({
  state,
  manualEnd,
  myColor,
  onNewGame,
  t,
}: {
  state: GameState
  manualEnd: ManualEnd | null
  /** `null` nếu ván không có đối thủ thật (hai người chung máy) — xem chỗ gọi. */
  myColor: Color | null
  onNewGame: () => void
  t: Translation
}) {
  const { winner, reason } = resultOf(state, manualEnd, t)

  const result: Result =
    winner === null ? 'draw' : myColor === null ? 'win' : winner === myColor ? 'win' : 'loss'

  const title =
    result === 'draw'
      ? t.chessGameDraw
      : myColor !== null
        ? result === 'win'
          ? t.chessYouWin
          : t.chessYouLose
        : winner === 'w'
          ? t.chessWhiteWins
          : t.chessBlackWins

  return (
    <div
      className={`rounded-lg border px-4 py-3 flex flex-col gap-2 animate-pop-in ${RESULT_STYLE[result]}`}
    >
      <div className="text-lg font-bold">{title}</div>
      <div className="text-sm opacity-80">{reason}</div>
      {/*
        Nút mời ván mới NGAY TRONG tấm kết quả, không bắt người chơi đi tìm nút "new game"
        ở hàng phía trên — hàng đó vẫn còn, nhưng đây là chỗ mắt đang nhìn vào lúc ván vừa
        xong.
      */}
      <button
        type="button"
        onClick={onNewGame}
        className="self-start mt-1 px-4 py-1.5 rounded text-sm font-medium cursor-pointer bg-orange-500 text-zinc-900 hover:bg-orange-400"
      >
        {t.chessNewGame}
      </button>
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
