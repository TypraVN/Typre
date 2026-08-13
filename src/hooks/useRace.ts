import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'
import type { Race, Racer } from '../lib/race'

/**
 * Gửi tiến độ tối đa 4 lần/giây. Gõ 80 wpm là ~7 ký tự/giây, gửi từng ký tự thì mỗi
 * người bắn 7 message/giây và phòng 4 người thành 28 — vô ích vì mắt không thấy khác gì
 * so với 4 lần/giây.
 */
const SEND_INTERVAL_MS = 250

export interface RaceProgress {
  percent: number
  wpm: number
  /** Lượt đã kết thúc: gõ xong HOẶC hết giờ. */
  done: boolean
  /** Gõ hết bài — chỉ trường hợp này mới được xếp thứ tự về đích. */
  completed: boolean
}

export interface RaceState {
  racers: Racer[]
  /** Đã vào phòng và đồng bộ được presence. */
  connected: boolean
  myKey: string
}

/**
 * Vào phòng đua, gửi tiến độ của mình và đọc tiến độ mọi người.
 *
 * Dùng presence chứ không dùng bảng: presence tự dọn khi ai đó đóng tab, nên không có
 * "người tàng hình" đứng mãi trong phòng. Đổi lại là phòng không tồn tại sau khi mọi
 * người rời — đúng ý muốn, đua xong là xong.
 */
export function useRace(
  race: Race | null,
  myName: string,
  progress: RaceProgress,
): RaceState {
  const [racers, setRacers] = useState<Racer[]>([])
  const [connected, setConnected] = useState(false)

  const channelRef = useRef<RealtimeChannel | null>(null)
  /** Khoá presence: ổn định suốt một tab, tạo một lần. */
  const myKeyRef = useRef<string>(
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  )
  const lastSentRef = useRef({ at: 0, percent: -1, done: false })
  /** Thứ tự về đích của mình, chốt một lần rồi giữ nguyên. */
  const placeRef = useRef(0)
  /** Đọc progress mới nhất trong timer mà không phải đăng ký lại channel. */
  const progressRef = useRef(progress)
  progressRef.current = progress

  const roomId = race?.roomId ?? null

  useEffect(() => {
    if (roomId === null) {
      setRacers([])
      setConnected(false)
      placeRef.current = 0
      lastSentRef.current = { at: 0, percent: -1, done: false }
      return
    }

    let cancelled = false
    let channel: RealtimeChannel | null = null

    getSupabase().then((supabase) => {
      if (!supabase || cancelled) return

      channel = supabase.channel(`race:${roomId}`, {
        config: { presence: { key: myKeyRef.current } },
      })

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel?.presenceState() ?? {}

          const list: Racer[] = Object.entries(state).flatMap(([key, entries]) => {
            // Presence trả về MẢNG cho mỗi khoá (một khoá có thể có nhiều kết nối);
            // lấy bản mới nhất, không thì tiến độ nhảy qua lại giữa các bản cũ/mới.
            const latest = entries[entries.length - 1] as unknown as Partial<Racer>
            if (!latest || typeof latest.name !== 'string') return []

            return [
              {
                key,
                name: latest.name,
                percent: latest.percent ?? 0,
                wpm: latest.wpm ?? 0,
                done: latest.done ?? false,
                completed: latest.completed ?? false,
                place: latest.place ?? 0,
              },
            ]
          })

          if (!cancelled) setRacers(list)
        })
        .subscribe((status) => {
          if (cancelled) return

          if (status === 'SUBSCRIBED') {
            setConnected(true)
            void channel?.track({
              name: myName,
              percent: 0,
              wpm: 0,
              done: false,
              completed: false,
              place: 0,
            })
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

  // Gửi tiến độ theo nhịp cố định thay vì gửi trong lúc render: render xảy ra mỗi
  // keystroke, còn ở đây chỉ cần 4 lần/giây.
  useEffect(() => {
    if (roomId === null) return

    const id = window.setInterval(() => {
      const channel = channelRef.current
      if (!channel) return

      const now = Date.now()
      const p = progressRef.current
      const last = lastSentRef.current

      // Chỉ gửi khi có gì đổi thật. Đứng im mà vẫn bắn message là phí băng thông.
      const changed = Math.round(p.percent) !== last.percent || p.done !== last.done
      if (!changed || now - last.at < SEND_INTERVAL_MS) return

      // Chỉ người GÕ XONG mới có thứ tự về đích; hết giờ giữa bài thì không.
      if (p.completed && placeRef.current === 0) {
        // Thứ hạng tự tính: đếm người đã về đích trước mình. Có thể lệch nếu hai người
        // về cùng lúc, nhưng không đáng để làm thêm một tầng trọng tài phía server.
        const aheadCount = racers.filter(
          (r) => r.key !== myKeyRef.current && r.completed,
        ).length
        placeRef.current = aheadCount + 1
      }

      lastSentRef.current = { at: now, percent: Math.round(p.percent), done: p.done }

      void channel.track({
        name: myName,
        percent: Math.round(p.percent),
        wpm: p.wpm,
        done: p.done,
        completed: p.completed,
        place: placeRef.current,
      })
    }, SEND_INTERVAL_MS)

    return () => window.clearInterval(id)
  }, [roomId, myName, racers])

  return { racers, connected, myKey: myKeyRef.current }
}
