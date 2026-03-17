export type SoundType = 'tap' | 'complete' | 'levelup' | 'feed' | 'evolve'

let _ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return _ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start()
    osc.stop(ctx.currentTime + dur)
  } catch (_) {}
}

export function playSound(type: SoundType, enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return
  try {
    if (type === 'tap') {
      tone(520, 0.08)
      setTimeout(() => tone(660, 0.06), 50)
    } else if (type === 'complete') {
      tone(523, 0.1)
      setTimeout(() => tone(659, 0.1), 100)
      setTimeout(() => tone(784, 0.2), 200)
    } else if (type === 'levelup') {
      ;[523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.12), i * 100))
    } else if (type === 'feed') {
      tone(440, 0.06)
      setTimeout(() => tone(550, 0.1), 60)
    } else if (type === 'evolve') {
      ;[440, 554, 659, 880, 1100].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'sine', 0.14), i * 120))
    }
  } catch (_) {}
}
