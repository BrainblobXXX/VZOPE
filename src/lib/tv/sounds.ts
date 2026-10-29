// Синтезированные звуки «найденного телевизора» (WebAudio, без ассетов)
import { AUDIO_MANIFEST } from '@/generated/media'

let ctx: AudioContext | null = null
let enabled = true

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function setSoundEnabled(v: boolean) {
  enabled = v
  if (!v) {
    stopHum()
    stopSoundtrack()
  }
}
export function isSoundEnabled() {
  return enabled
}

function noiseBuffer(c: AudioContext, dur: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}

function playNoise(dur: number, vol: number, freq = 1200, q = 0.8) {
  if (!enabled) return
  const c = ac()
  if (!c) return
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, dur)
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  filter.Q.value = q
  const gain = c.createGain()
  gain.gain.setValueAtTime(vol, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  src.connect(filter).connect(gain).connect(c.destination)
  src.start()
}

function playTone(freq: number, dur: number, vol: number, type: OscillatorType = 'square', slideTo?: number) {
  if (!enabled) return
  const c = ac()
  if (!c) return
  const osc = c.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur)
  const gain = c.createGain()
  gain.gain.setValueAtTime(vol, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  osc.connect(gain).connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + dur)
}

// механический щелчок крутилки/кнопки
export function playClick() {
  playNoise(0.05, 0.25, 2500, 1.2)
  playTone(220, 0.03, 0.08, 'square', 90)
}

// переключение канала: щелчок + шум
export function playSwitch() {
  playClick()
  setTimeout(() => playNoise(0.3, 0.16, 1600, 0.5), 30)
}

// отправка сообщения: мягкий клик
export function playSend() {
  playNoise(0.04, 0.12, 3200, 1.5)
}

// получен пуш: короткий бип
export function playBeep() {
  playTone(880, 0.07, 0.1, 'square')
  setTimeout(() => playTone(1170, 0.09, 0.1, 'square'), 80)
}

// монетка (покупка/дарение)
export function playCoin() {
  playTone(880, 0.08, 0.12, 'square')
  setTimeout(() => playTone(1320, 0.12, 0.12, 'square'), 70)
  setTimeout(() => playNoise(0.12, 0.05, 4000, 1), 60)
}

// ошибка: низкий глиitch
export function playError() {
  playTone(110, 0.18, 0.16, 'sawtooth', 70)
}

// вспышка фото
export function playFlash() {
  playNoise(0.18, 0.2, 3000, 0.6)
}

// кассета вставляется/вытаскивается
export function playCassette() {
  playNoise(0.1, 0.2, 900, 1)
  setTimeout(() => playTone(160, 0.25, 0.1, 'square', 60), 80)
}

// свайп мема: короткий вжух
export function playSwipe(dir: 'left' | 'right' = 'right') {
  playNoise(0.1, 0.12, dir === 'right' ? 1100 : 700, 0.7)
  setTimeout(() => playTone(dir === 'right' ? 520 : 300, 0.05, 0.05, 'square', dir === 'right' ? 700 : 180), 15)
}

// мэтч найден: фанфара телетекста
export function playMatch() {
  playTone(660, 0.09, 0.11, 'square')
  setTimeout(() => playTone(880, 0.09, 0.11, 'square'), 110)
  setTimeout(() => playTone(1320, 0.18, 0.11, 'square'), 220)
  setTimeout(() => playNoise(0.15, 0.06, 2600, 0.8), 240)
}

// плёнка рвётся: резкий срыв шума + провал тона вниз (сжечь кадр / сброс демо)
export function playTear() {
  playNoise(0.3, 0.28, 2200, 0.35)
  playTone(340, 0.32, 0.13, 'sawtooth', 55)
  setTimeout(() => playNoise(0.18, 0.2, 650, 0.5), 130)
}

// ── фоновый гул ЭЛТ (тихий, постоянный; раздел 2.4 диз-дока) ──

let humNodes: { osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null = null

export function startHum() {
  if (!enabled || humNodes) return
  const c = ac()
  if (!c) return
  try {
    const gain = c.createGain()
    gain.gain.value = 0.005
    // базовый тон 55 Гц (трансформатор)
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 55
    // лёгкое «дыхание» громкости через LFO
    const lfo = c.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.17
    const lfoGain = c.createGain()
    lfoGain.gain.value = 0.0015
    lfo.connect(lfoGain).connect(gain.gain)
    osc.connect(gain).connect(c.destination)
    osc.start()
    lfo.start()
    humNodes = { osc, lfo, gain }
  } catch {
    humNodes = null
  }
}

export function stopHum() {
  if (!humNodes) return
  try {
    humNodes.gain.gain.setTargetAtTime(0.0001, humNodes.osc.context.currentTime, 0.1)
    const nodes = humNodes
    setTimeout(() => {
      try {
        nodes.osc.stop()
        nodes.lfo.stop()
      } catch {
        /* уже остановлен */
      }
    }, 300)
  } catch {
    /* noop */
  }
  humNodes = null
}

// ── фоновое радио: плейлист вперемешку + тихий шум комнаты ──

let soundtrack: HTMLAudioElement | null = null
let soundtrackActive = false
let musicQueue: string[] = []
let currentTrack: string | null = null
let musicFade: number | null = null
let roomNoise: { source: AudioBufferSourceNode; gain: GainNode } | null = null
let unlockCleanup: (() => void) | null = null
let failedTracks = 0

const MUSIC_VOLUME = 0.017
const ROOM_NOISE_VOLUME = 0.003

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function fillMusicQueue() {
  // не ставим только что сыгранный трек первым в новом круге
  const pool = AUDIO_MANIFEST.filter((track) => track !== currentTrack)
  musicQueue = shuffle(pool.length > 0 ? pool : [...AUDIO_MANIFEST])
}

function clearMusicFade() {
  if (musicFade === null) return
  window.clearInterval(musicFade)
  musicFade = null
}

function fadeMusic(to: number, ms = 1400) {
  if (!soundtrack) return
  clearMusicFade()

  const from = soundtrack.volume
  const steps = Math.max(1, Math.floor(ms / 40))
  let step = 0

  musicFade = window.setInterval(() => {
    step += 1
    if (!soundtrack) return
    const t = Math.min(1, step / steps)
    soundtrack.volume = from + (to - from) * t
    if (t >= 1) clearMusicFade()
  }, 40)
}

function startRoomNoise() {
  if (!enabled) return
  const c = ac()
  if (!c || roomNoise) return

  const source = c.createBufferSource()
  source.buffer = noiseBuffer(c, 2)
  source.loop = true

  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1600
  filter.Q.value = 0.45

  const gain = c.createGain()
  gain.gain.value = ROOM_NOISE_VOLUME

  source.connect(filter).connect(gain).connect(c.destination)
  source.start()
  roomNoise = { source, gain }
}

function stopRoomNoise() {
  if (!roomNoise) return
  try {
    roomNoise.source.stop()
    roomNoise.source.disconnect()
    roomNoise.gain.disconnect()
  } catch {
    /* уже остановлен */
  }
  roomNoise = null
}

function clearAudioUnlock() {
  if (!unlockCleanup) return
  unlockCleanup()
  unlockCleanup = null
}

function armAudioUnlock() {
  if (unlockCleanup || typeof window === 'undefined') return

  const unlock = () => {
    clearAudioUnlock()
    if (soundtrackActive) requestPlay()
  }

  unlockCleanup = () => {
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('touchstart', unlock)
    window.removeEventListener('keydown', unlock)
  }

  window.addEventListener('pointerdown', unlock, { once: true, passive: true })
  window.addEventListener('touchstart', unlock, { once: true, passive: true })
  window.addEventListener('keydown', unlock, { once: true })
}

/**
 * Единственная точка запуска/возобновления HTMLAudio.
 * Если браузер заблокировал play(), не крутим бесконечный retry,
 * а ждём следующего жеста пользователя.
 */
function requestPlay() {
  if (!soundtrack || !soundtrackActive) return

  const result = soundtrack.play()
  if (!result) {
    startRoomNoise()
    fadeMusic(MUSIC_VOLUME, 1400)
    return
  }

  result
    .then(() => {
      clearAudioUnlock()
      failedTracks = 0
      startRoomNoise()
      fadeMusic(MUSIC_VOLUME, 1400)
    })
    .catch(() => {
      // Шум не должен играть отдельно от музыки: иначе получается
      // «радио шипит, а трека нет».
      stopRoomNoise()
      armAudioUnlock()
    })
}

function playNextTrack() {
  if (!soundtrackActive || !soundtrack) return

  if (musicQueue.length === 0) fillMusicQueue()
  const next = musicQueue.shift()
  if (!next) return

  currentTrack = next
  soundtrack.src = next
  soundtrack.volume = 0
  soundtrack.load()
  requestPlay()
}

export function startSoundtrack() {
  if (!enabled || typeof window === 'undefined' || AUDIO_MANIFEST.length === 0) return

  if (!soundtrack) {
    soundtrack = new Audio()
    soundtrack.preload = 'auto'
    soundtrack.loop = false
    soundtrack.volume = 0

    soundtrack.addEventListener('ended', () => {
      if (soundtrackActive) playNextTrack()
    })

    soundtrack.addEventListener('error', () => {
      if (!soundtrackActive) return
      failedTracks += 1

      // Если все треки отдают 404/не поддерживаются — не зацикливаемся.
      if (failedTracks >= AUDIO_MANIFEST.length) {
        soundtrackActive = false
        clearMusicFade()
        stopRoomNoise()
        console.warn('[soundtrack] all tracks failed to load')
        return
      }

      window.setTimeout(() => {
        if (soundtrackActive) playNextTrack()
      }, 800)
    })
  }

  soundtrackActive = true
  startHum()

  if (!soundtrack.paused) {
    startRoomNoise()
    return
  }

  if (!soundtrack.src) {
    playNextTrack()
    return
  }

  requestPlay()
}

export function stopSoundtrack() {
  soundtrackActive = false
  clearMusicFade()
  clearAudioUnlock()
  stopRoomNoise()
  stopHum()
  musicQueue = []
  currentTrack = null
  failedTracks = 0

  if (!soundtrack) return
  soundtrack.pause()
  soundtrack.removeAttribute('src')
  soundtrack.load()
  soundtrack = null
}

export function pauseSoundtrack() {
  clearMusicFade()
  soundtrack?.pause()
  stopRoomNoise()
  stopHum()
}

export function resumeSoundtrack() {
  if (!enabled || !soundtrackActive || !soundtrack) return
  startHum()
  requestPlay()
}
