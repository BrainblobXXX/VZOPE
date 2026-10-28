'use client'

import { TestBars } from '../../tv/ui'

export default function Stage1DeadChannel({ channel }: { channel: number }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="absolute inset-0 opacity-60" aria-hidden="true">
        <div className="flex h-full flex-col">
          <TestBars className="h-6" />
          <div className="flex-1" style={{ background: 'repeating-linear-gradient(0deg, #1a0f05 0 2px, #331A00 2px 4px)' }} />
          <TestBars className="h-6" />
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="font-pixel glow-amber text-[22px] text-[#FFB000]">НЕТ СИГНАЛА</div>
        <p className="font-pixel text-[8px] leading-relaxed text-[#8a6f3f]">КАНАЛ {channel} · ЧАСТОТА ПОТЕРЯНА</p>
        <p className="font-pixel text-[6px] leading-relaxed text-[#5a4626]">КАНАЛЫ ПОЯВЯТСЯ ПОЗЖЕ. ЭТО НЕ ОШИБКА.</p>
        <div className="font-pixel mt-2 border border-[#5a3a00] px-2 py-1 text-[6px] text-[#8a6f3f]">
          ПОВЕРНИ КРУТИЛКУ. ТАМ БЫЛ КАНАЛ 1.
        </div>
      </div>

      <div className="relative z-10 overflow-hidden border-t border-[#5a3a00] bg-[#0d0a06] py-1">
        <p className="font-pixel whitespace-nowrap text-[6px] text-[#33FF00]">
          КАНАЛ {channel} · НАСТРОЙКА · КАНАЛ {channel} · НАСТРОЙКА · КАНАЛ {channel} · НАСТРОЙКА
        </p>
      </div>
    </div>
  )
}
