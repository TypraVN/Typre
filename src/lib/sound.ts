let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()

  /*
    Trình duyệt tạo AudioContext ở trạng thái treo cho tới khi người dùng tương tác, và
    KHÔNG tự bỏ treo về sau. Không gọi resume thì âm thanh câm lặng vĩnh viễn nếu context
    lỡ được tạo trước cú bấm đầu tiên — im lặng, không báo lỗi, rất khó lần ra.
  */
  if (audioCtx.state === 'suspended') void audioCtx.resume()

  return audioCtx
}

function beep(freq: number, duration: number, type: OscillatorType = 'sine') {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.value = 0.05
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  osc.stop(ctx.currentTime + duration)
}

export function playCorrect() {
  beep(880, 0.05)
}

export function playWrong() {
  beep(150, 0.08, 'square')
}

export function playFinish() {
  beep(660, 0.15)
}

/**
 * Tiếng quân cờ chạm mặt bàn.
 *
 * Dựng bằng NHIỄU lọc chứ không phải sóng sin như tiếng gõ phím. Tiếng quân gỗ đặt xuống
 * là một tiếng "cạch" ngắn có mặt đủ mọi tần số rồi tắt ngay — nó không có cao độ. Lấy
 * sóng sin làm thì ra tiếng "bíp" của đồ điện tử, mỗi nước đi nghe như một cái lò vi
 * sóng báo xong.
 *
 * Hai tham số làm nên khác biệt giữa đi thường và ăn quân: `cutoff` thấp cho tiếng trầm
 * và nặng hơn, `duration` dài cho tiếng có sức va chạm.
 *
 * Đã thử thay bằng tiếng "cọ sát"/"trượt" kéo dài (nhiễu hồng, rồi nhiễu nâu+grit kiểu đá
 * cà đá) — không phiên bản nào ổn khi nghe LẶP LẠI trong ván thật: bản nhẹ nghe sai chất,
 * bản nặng (đúng ý ban đầu, kiểu Wizard's Chess) nghe ồn/chói khi lặp mỗi nước. Quay lại
 * tiếng gõ ngắn ban đầu.
 */
function knock(volume: number, cutoff: number, duration: number) {
  const ctx = getCtx()
  const frames = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < frames; i++) {
    // Bao hình tắt rất nhanh. Chính số mũ này biến một mảng nhiễu ù ù thành tiếng gõ:
    // tắt tuyến tính thì nghe như tiếng nhiễu sóng radio.
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 8
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  // Cắt tần cao, vì mặt bàn gỗ hấp thụ chúng. Không lọc thì ra tiếng "xì" của nhiễu trắng.
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = cutoff

  const gain = ctx.createGain()
  gain.gain.value = volume

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
}

export function playPieceMove() {
  knock(0.3, 2400, 0.055)
}

/** Ăn quân: trầm hơn, dài hơn, to hơn — phải nghe ra ngay là vừa mất quân. */
export function playPieceCapture() {
  knock(0.55, 1100, 0.11)
}

/**
 * Chiếu tướng: hai nốt đi lên, KHÔNG phải tiếng gõ.
 *
 * Đây là thông tin chứ không phải chuyển động, nên phải khác hẳn về chất tiếng. Cùng chất
 * với tiếng đặt quân thì nó chìm vào nền và mất tác dụng cảnh báo.
 */
export function playCheck() {
  beep(988, 0.06)
  setTimeout(() => beep(1319, 0.09), 70)
}

/**
 * Nhập thành: hai quân cùng chạm bàn thì phải nghe ra HAI tiếng, không phải một.
 *
 * Tiếng gõ của Vua trước (`knock` nhẹ, khớp lúc nó chạm ô đích), rồi tới tiếng gõ của Xe
 * nặng hơn một nhịp sau — đúng nhịp "một-hai" của hiệu ứng trượt hình ảnh (Xe trượt trễ
 * hơn Vua một chút, xem `CASTLE_ROOK_DELAY_MS` trong ChessBoard.tsx). Phủ thêm một chuỗi
 * ba nốt đi lên: nhập thành là nước MANG TÍNH SỰ KIỆN (đổi cả thế trận, không phải một
 * bước đi thường), cần chất tiếng trang trọng hơn tiếng "cạch" đơn thuần của đi thường.
 */
export function playCastle() {
  knock(0.3, 2400, 0.055)
  setTimeout(() => knock(0.45, 1400, 0.09), 90)
  beep(523, 0.1)
  setTimeout(() => beep(659, 0.1), 60)
  setTimeout(() => beep(784, 0.14), 120)
}

/**
 * Phong hậu: một tiếng gõ đặt quân trước (Tốt vẫn chạm bàn thật), rồi bốn nốt đi lên
 * NHANH và VANG hơn hẳn `playCastle` (E5→G5→B5→E6, gần một quãng tám) — phong cấp đổi
 * hẳn một quân yếu thành quân mạnh nhất bàn cờ, cần chất tiếng "thăng hoa" rõ ràng hơn
 * nhập thành (vốn chỉ đổi thế trận, quân vẫn vậy). Bốn nốt thay vì ba của nhập thành, và
 * quãng rộng hơn (E-G-B-E so với C-E-G sát nhau của nhập thành) để tai phân biệt được
 * ngay hai sự kiện, không lẫn vào nhau dù cả hai đều là "chuỗi nốt đi lên".
 */
export function playPromotion() {
  knock(0.3, 2400, 0.055)
  setTimeout(() => beep(659, 0.09), 70)
  setTimeout(() => beep(784, 0.09), 140)
  setTimeout(() => beep(988, 0.09), 210)
  setTimeout(() => beep(1319, 0.16), 280)
}
