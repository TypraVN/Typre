import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'
import { colorFor, type MoveMessage, type RoomMember, type SyncMessage } from '../lib/chess/chessRoom'
import type { Color, ParsedMove } from '../lib/chess/types'

export interface ChessRoomHandlers {
  /** Đối thủ vừa đi. Trả về FEN sau khi mình áp dụng, để hook đối chiếu. */
  onRemoteMove: (message: MoveMessage) => void
  /** Ai đó mới vào và xin thế cờ — trả về thế hiện tại để gửi cho họ. */
  onSyncRequest: () => SyncMessage
  /** Nhận được thế cờ từ người đang chơi. */
  onSyncState: (state: SyncMessage) => void
  /** Đối thủ bắt đầu ván mới. */
  onReset: () => void
}

export interface ChessRoomState {
  connected: boolean
  members: RoomMember[]
  /** Màu của mình. `null` khi chưa vào phòng hoặc mình là người thứ ba (khán giả). */
  myColor: Color | null
  /** Đã đủ hai người chưa. */
  ready: boolean
  /** Tên người chơi còn lại, để hiện "vs …". `null` khi chưa có ai. */
  opponentName: string | null
  /**
   * Đã từng đủ hai người rồi giờ chỉ còn mình.
   *
   * Khác với "đang chờ đối thủ": presence tự dọn khi ai đó đóng tab, nên phân biệt được
   * "chưa ai vào" với "vào rồi lại đi". Không phân biệt thì người chơi ngồi chờ mãi một
   * đối thủ đã bỏ đi từ lâu.
   */
  opponentLeft: boolean
  sendMove: (move: ParsedMove, fen: string) => void
  sendReset: () => void
}

const EMPTY: RoomMember[] = []

/**
 * Vào phòng cờ hai người.
 *
 * Presence để biết ai đang trong phòng và chia màu; broadcast để gửi nước đi. Không có
 * bảng nào cả — ván cờ chỉ sống trong lúc hai tab còn mở.
 */
export function useChessRoom(
  roomId: string | null,
  myName: string,
  handlers: ChessRoomHandlers,
): ChessRoomState {
  const [connected, setConnected] = useState(false)
  const [members, setMembers] = useState<RoomMember[]>(EMPTY)

  const channelRef = useRef<RealtimeChannel | null>(null)

  /** Khoá presence và mốc vào phòng: tạo MỘT lần, giữ nguyên suốt tab. */
  const myKeyRef = useRef<string>(
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  )
  const joinedAtRef = useRef<number>(Date.now())

  /**
   * Giữ handler mới nhất trong ref.
   *
   * Nếu đưa thẳng `handlers` vào mảng phụ thuộc của effect thì mỗi lần component vẽ lại
   * là huỷ và đăng ký lại channel — ván cờ rớt kết nối mỗi nước đi.
   */
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (roomId === null) {
      setMembers(EMPTY)
      setConnected(false)
      return
    }

    let cancelled = false
    let channel: RealtimeChannel | null = null

    void getSupabase().then((supabase) => {
      if (!supabase || cancelled) return

      channel = supabase.channel(`chess:${roomId}`, {
        config: {
          presence: { key: myKeyRef.current },
          // Cần nhận lại chính message mình gửi? Không — nên tắt để khỏi tự áp dụng
          // nước đi của mình hai lần.
          broadcast: { self: false },
        },
      })

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel?.presenceState() ?? {}

          const list: RoomMember[] = Object.entries(state).flatMap(([key, entries]) => {
            const latest = entries[entries.length - 1] as unknown as Partial<RoomMember>
            if (!latest || typeof latest.name !== 'string') return []

            return [{ key, name: latest.name, joinedAt: latest.joinedAt ?? 0 }]
          })

          if (!cancelled) setMembers(list)
        })
        .on('broadcast', { event: 'move' }, ({ payload }) => {
          handlersRef.current.onRemoteMove(payload as MoveMessage)
        })
        .on('broadcast', { event: 'sync-request' }, () => {
          const snapshot = handlersRef.current.onSyncRequest()
          void channel?.send({ type: 'broadcast', event: 'sync-state', payload: snapshot })
        })
        .on('broadcast', { event: 'sync-state' }, ({ payload }) => {
          handlersRef.current.onSyncState(payload as SyncMessage)
        })
        .on('broadcast', { event: 'reset' }, () => {
          handlersRef.current.onReset()
        })
        .subscribe((status) => {
          if (cancelled) return

          if (status === 'SUBSCRIBED') {
            setConnected(true)
            void channel?.track({ name: myName, joinedAt: joinedAtRef.current })

            /**
             * Xin thế cờ hiện tại.
             *
             * Người vào phòng đầu tiên gửi cái này vào chỗ không ai nghe — vô hại. Người
             * vào sau khi ván đã bắt đầu (hoặc vào lại sau khi rớt mạng) nhờ nó mà thấy
             * đúng thế cờ, thay vì bàn cờ mới tinh trong khi đối thủ đã đi mười nước.
             */
            void channel?.send({ type: 'broadcast', event: 'sync-request', payload: {} })
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setConnected(false)
          }
        })

      channelRef.current = channel
    })

    return () => {
      cancelled = true
      setConnected(false)
      void channel?.unsubscribe()
      channelRef.current = null
    }
  }, [roomId, myName])

  const sendMove = useCallback((move: ParsedMove, fen: string) => {
    void channelRef.current?.send({
      type: 'broadcast',
      event: 'move',
      payload: { move, fen } satisfies MoveMessage,
    })
  }, [])

  const sendReset = useCallback(() => {
    void channelRef.current?.send({ type: 'broadcast', event: 'reset', payload: {} })
  }, [])

  const myColor = colorFor(members, myKeyRef.current)
  const ready = members.length >= 2

  /**
   * Nhớ đã từng đủ hai người.
   *
   * Dùng ref chứ không dùng state: chỉ đọc trong lúc render để suy ra `opponentLeft`,
   * đặt state ở đây sẽ tạo thêm một vòng vẽ lại mà không đổi gì trên màn hình.
   */
  const hadOpponentRef = useRef(false)
  if (ready) hadOpponentRef.current = true

  const opponent = members.find((member) => member.key !== myKeyRef.current)

  return {
    connected,
    members,
    myColor,
    ready,
    opponentName: opponent?.name ?? null,
    opponentLeft: hadOpponentRef.current && connected && members.length < 2,
    sendMove,
    sendReset,
  }
}
