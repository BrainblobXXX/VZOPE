'use client'

import { useEffect, useState } from 'react'
import SnowOverlay from '../SnowOverlay'

type Phase = 'black' | 'snow' | 'title' | 'tune'

// Экран 0.1 — первый запуск: снег → глитч-титры «В ЖОПЕ» → Канал 1
export default function FirstLaunchScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('black')

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setPhase('snow'), 450))
    timers.push(setTimeout(() => setPhase('title'), 1050))
    timers.push(setTimeout(() => setPhase('tune'), 2650))
    timers.push(setTimeout(() => onDone(), 2950))
    return () => timers.forEach(clearTimeout)
     
  }, [])

  return (
    <div className="relative h-full bg-black">
      {(phase === 'snow' || phase === 'tune') && <SnowOverlay active />}
      {phase === 'title' && (
        <div className="relative flex h-full items-center justify-center">
          <SnowOverlay active amber />
          <h1 className="glitch-text font-pixel relative z-10 text-[30px] text-[#FFB000]">В ЖОПЕ</h1>
          <p className="font-pixel px-blink absolute bottom-8 text-[7px] text-[#8a6f3f]">ПОИСК СИГНАЛА...</p>
        </div>
      )}
      {phase === 'black' && (
        <p className="font-pixel px-blink absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] text-[#3a2a10]">▮</p>
      )}
    </div>
  )
}
