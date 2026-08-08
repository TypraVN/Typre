let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
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
