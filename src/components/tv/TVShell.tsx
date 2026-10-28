'use client'

import type { ReactNode } from 'react'
import { IconCart, IconMeme, IconPerson, IconWaves } from './ui'

// ── Крутилка каналов (5 положений) ──────────────────────────

const KNOB_ANGLES: Record<number, number> = { 1: -70, 2: -35, 3: 0, 4: 35, 5: 70 }

export function ChannelKnob({
  channel,
  unread,
  active = true,
  onClick,
}: {
  channel: number
  unread?: Record<number, number> // опционален: проп может не доехать — не роняем весь ТВ
  active?: boolean
  onClick: () => void
}) {
  return (
    <div className="relative h-[67px] w-[67px] shrink-0 translate-x-[4px] select-none" role="group" aria-label="Крутилка каналов">
      {/* цифры вокруг */}
      {[
        { n: 1, style: { left: 2, top: 17, transform: 'translate(-50%, -50%)' } },
        { n: 2, style: { left: 16, top: 2, transform: 'translate(-50%, -50%)' } },
        { n: 3, style: { left: '50%', top: -3, transform: 'translate(-50%, -50%)' } },
        { n: 4, style: { left: 52, top: 2, transform: 'translate(-50%, -50%)' } },
        { n: 5, style: { left: 65, top: 17, transform: 'translate(-50%, -50%)' } },
      ].map(({ n, style }) => {
        const count = unread?.[n] ?? 0
        return (
          <span
            key={n}
            className={`font-pixel absolute z-10 text-[7px] ${active && n === channel ? 'text-[#FFB000] glow-amber' : 'text-[#5a5148]'}`}
            style={style as React.CSSProperties}
          >
            {n}
            {/* бейдж непрочитанных */}
            {count > 0 && (
              <span
                className="px-blink-fast font-pixel absolute -right-[10px] -top-[7px] min-w-[11px] border border-black bg-[#FF4A4A] px-[2px] text-center text-[5px] leading-[11px] text-black"
                aria-label={`Непрочитанных на канале ${n}: ${count}`}
              >
                {count > 9 ? '9+' : count}
              </span>
            )}
          </span>
        )
      })}
      <button
        onClick={onClick}
        className="knob absolute inset-[7px] cursor-pointer rounded-full"
        style={{ transform: `rotate(${KNOB_ANGLES[channel] ?? 0}deg)` }}
        aria-label={`Канал ${channel}, нажать — следующий`}
      >
        {/* маркер-указатель */}
        <span className="absolute left-1/2 top-[4px] h-[30%] w-[3px] -translate-x-1/2 rounded bg-[#e8e2d8]" style={{ boxShadow: '0 0 3px rgba(0,0,0,.6)' }} />
        {/* риски */}
        <span className="absolute left-1/2 top-[40%] h-[18%] w-[2px] -translate-x-1/2 bg-[#3d3831]" />
      </button>
    </div>
  )
}

// ── физическая кнопка на панели ─────────────────────────────

export function PanelButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: 'meme' | 'onair' | 'profile' | 'shop'
  label: string
  active: boolean
  onClick: () => void
}) {
  const Icon = icon === 'meme' ? IconMeme : icon === 'onair' ? IconWaves : icon === 'profile' ? IconPerson : IconCart
  return (
    <button
      onClick={onClick}
      className={`tv-btn flex h-[38px] w-[52px] flex-col items-center justify-center gap-[2px] rounded-[4px] ${active ? 'pressed' : ''}`}
      aria-label={label}
      aria-pressed={active}
    >
      <span className="tv-btn-icon">
        <Icon size={18} />
      </span>
      <span className={`font-pixel text-[5px] leading-none ${active ? 'text-[#FFB000]' : 'text-[#5a5148]'}`}>
        {label}
      </span>
    </button>
  )
}

// ── корпус телевизора ───────────────────────────────────────

export default function TVShell({
  channel,
  screen,
  online,
  soundOn,
  unread,
  children,
  onKnob,
  onMemes,
  onOnAir,
  onProfile,
  onShop,
  onAntenna,
  onSound,
}: {
  channel: number
  screen: string // текущий экран (для pressed-состояний кнопок)
  online: boolean
  soundOn: boolean
  unread: Record<number, number>
  children: ReactNode
  onKnob: () => void
  onMemes: () => void
  onOnAir: () => void
  onProfile: () => void
  onShop: () => void
  onAntenna: () => void
  onSound: () => void
}) {
  return (
    <div className="kitchen-bg flex min-h-dvh w-full items-center justify-center sm:p-4">
      <div className="relative flex h-dvh w-full max-w-[440px] flex-col sm:h-[min(94dvh,900px)] sm:rounded-[22px]">
        {/* антенны */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-8 left-[26%] hidden h-16 w-[3px] origin-bottom -rotate-[24deg] rounded bg-gradient-to-b from-[#8a8a8a] to-[#4a4a4a] sm:block" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-8 right-[26%] hidden h-16 w-[3px] origin-bottom rotate-[24deg] rounded bg-gradient-to-b from-[#8a8a8a] to-[#4a4a4a] sm:block" />

        {/* деревянный корпус */}
        <div className="wood-frame flex min-h-0 flex-1 flex-col rounded-t-[18px] p-2 pb-3 sm:rounded-[22px] sm:p-3">
          {/* верхняя кромка: бренд + антенна-тумблер + LED + звук */}
          <div className="mb-2 flex items-center justify-between px-1">
            {/* v2.0: пасхалки вне скоупа — шильдик просто бренд */}
            <span className="font-pixel text-[7px] tracking-widest text-[#c9b18a]/70" aria-hidden="true">
              РУБИН-2094
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onSound}
                className="font-pixel flex items-center gap-1 rounded-sm bg-[#1a1713] px-2 py-1 text-[6px] text-[#8a7a5a] active:translate-y-[1px]"
                aria-pressed={soundOn}
                aria-label="Переключатель звука"
              >
                <span className={`inline-block h-[6px] w-[6px] rounded-full ${soundOn ? 'bg-[#33FF00] text-[#33FF00]' : 'bg-[#3a332c] text-transparent'} led`} />
                ЗВУК
              </button>
              <button
                onClick={onAntenna}
                className="font-pixel flex items-center gap-1 rounded-sm bg-[#1a1713] px-2 py-1 text-[6px] text-[#8a7a5a] active:translate-y-[1px]"
                aria-pressed={online}
                aria-label="Антенна (сеть). Нажать — отключить/включить"
                title="Сеть: вкл/выкл"
              >
                <span className={`inline-block h-[6px] w-[6px] rounded-full ${online ? 'bg-[#33FF00] text-[#33FF00]' : 'bg-[#3a332c] text-transparent'} led`} />
                ANT
              </button>
            </div>
          </div>

          {/* пластиковый кант */}
          <div className="plastic-bezel wear-scratches relative flex min-h-0 flex-1 flex-col gap-2 rounded-[10px] p-2">
            {/* стикер самиздата */}
            <div className="body-sticker font-pixel absolute -left-1 bottom-[26%] z-40 rotate-[-8deg] rounded-[2px] px-1.5 py-[3px] text-[5px] text-black/80">
              СДЕЛАНО В ЖОПЕ
            </div>

            {/* ЭКРАН */}
            <div className="crt-glass relative min-h-0 flex-1 overflow-hidden rounded-[8px]" style={{ borderRadius: '10px / 8px', boxShadow: 'inset 0 0 24px rgba(0,0,0,.8), inset 0 0 4px rgba(0,0,0,.9)' }}>
              {children}
            </div>

            {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
            <div className="panel-black relative flex shrink-0 items-center gap-3 rounded-[8px] px-3 py-2.5">
              {/* винты по углам */}
              <span className="screw absolute left-1 top-1" aria-hidden="true" />
              <span className="screw absolute right-1 top-1" aria-hidden="true" />
              <span className="screw absolute bottom-1 left-1" aria-hidden="true" />
              <span className="screw absolute bottom-1 right-1" aria-hidden="true" />

              {/* решётка динамика */}
              <div className="grille h-[64px] flex-1 rounded-[4px]" aria-hidden="true" />

              {/* кнопки (4.2 v2.0: МЭМ · В ЭФИРЕ · ПРОФИЛЬ · МАГАЗИН) */}
              <div className="grid shrink-0 grid-cols-2 gap-1.5">
                <PanelButton icon="meme" label="МЭМ" active={screen === 'memes'} onClick={onMemes} />
                <PanelButton icon="onair" label="В ЭФИРЕ" active={screen === 'onair'} onClick={onOnAir} />
                <PanelButton icon="profile" label="ПРОФИЛЬ" active={screen === 'profile'} onClick={onProfile} />
                <PanelButton icon="shop" label="МАГАЗИН" active={screen === 'shop'} onClick={onShop} />
              </div>

              {/* крутилка */}
              <ChannelKnob channel={channel} unread={unread} active={screen === 'channel'} onClick={onKnob} />
            </div>
          </div>

          {/* ножки/цоколь */}
          <div className="mt-1 flex justify-center" aria-hidden="true">
            <div className="h-[4px] w-2/3 rounded-full bg-black/50" />
          </div>
        </div>
      </div>
    </div>
  )
}
