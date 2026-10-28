'use client'

import { useEffect, useRef, useState } from 'react'
import SnowOverlay from '../tv/SnowOverlay'
import type { S1Meme } from './data'

type Phase = 'black' | 'snow' | 'title' | 'tune'

const MEME_SLOTS = [
  { left: '6%', top: '14%', size: 84, rotate: -12, delay: 600 },
  { left: '67%', top: '10%', size: 72, rotate: 10, delay: 800 },
  { left: '8%', top: '58%', size: 76, rotate: 8, delay: 1000 },
  { left: '67%', top: '60%', size: 84, rotate: -8, delay: 1200 },
  { left: '2%', top: '35%', size: 62, rotate: 14, delay: 1400 },
  { left: '79%', top: '34%', size: 64, rotate: -14, delay: 1600 },
  { left: '38%', top: '3%', size: 58, rotate: 5, delay: 1800 },
]

export default function Stage1Boot({ memes, onDone }: { memes: S1Meme[]; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('black')
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const timer = window.setTimeout(() => doneRef.current(), 500)
      return () => window.clearTimeout(timer)
    }

    const timers: number[] = []
    timers.push(window.setTimeout(() => setPhase('snow'), 400))
    timers.push(window.setTimeout(() => setPhase('title'), 1200))
    timers.push(window.setTimeout(() => setPhase('tune'), 5400))
    timers.push(window.setTimeout(() => doneRef.current(), 6500))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  const visibleMemes = memes.length > 0 ? MEME_SLOTS.map((slot, i) => ({ slot, meme: memes[i % memes.length] })) : []

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      {(phase === 'snow' || phase === 'tune') && <SnowOverlay active />}

      {phase !== 'black' && visibleMemes.map(({ slot, meme }, i) => (
        <div
          key={`${meme.id}-${i}`}
          className="boot-meme pointer-events-none absolute z-40 border-2 bg-[#0d0a06] p-0.5"
          style={{
            left: slot.left,
            top: slot.top,
            width: slot.size,
            height: slot.size,
            borderColor: `${meme.accent}aa`,
            boxShadow: `0 0 18px ${meme.accent}33`,
            animationDelay: `${slot.delay}ms`,
            ['--boot-rot' as string]: `${slot.rotate}deg`,
          }}
          aria-hidden="true"
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden">
            {meme.src ? (
              <img src={meme.src} alt="" className="h-full w-full object-contain" style={{ imageRendering: 'pixelated' }} />
            ) : (
              <span className="text-[26px] leading-none">{meme.emoji}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 border-l border-t border-black bg-[#c53a2b] px-0.5 text-[4px] leading-[6px] text-[#f5e6c8]">S/H</span>
        </div>
      ))}

      {phase === 'title' && (
        <div className="relative flex h-dvh items-center justify-center">
          <SnowOverlay active amber />
          <h1 className="glitch-text font-pixel relative z-50 text-[30px] text-[#FFB000]">В ЖОПЕ</h1>
          <p className="font-pixel px-blink absolute bottom-8 z-50 text-[7px] text-[#8a6f3f]">ПОИСК СИГНАЛА...</p>
        </div>
      )}

      {phase === 'black' && (
        <p className="font-pixel px-blink absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] text-[#3a2a10]">▮</p>
      )}
    </div>
  )
}
