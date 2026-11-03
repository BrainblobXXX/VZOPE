'use client'

import type { ReactNode } from 'react'
import { IconCart, IconMeme, IconPerson, IconWaves } from '../tv/ui'
import { ChannelKnob } from '../tv/TVShell'
import type { S1Screen, S1StickerPlacement } from './data'

function PanelButton({
  icon,
  label,
  active,
  badge = 0,
  onClick,
}: {
  icon: 'meme' | 'viewers' | 'profile' | 'shop'
  label: string
  active: boolean
  badge?: number
  onClick: () => void
}) {
  const Icon = icon === 'meme' ? IconMeme : icon === 'viewers' ? IconWaves : icon === 'profile' ? IconPerson : IconCart
  return (
    <button
      onClick={onClick}
      className={`tv-btn relative flex h-[38px] w-[52px] flex-col items-center justify-center gap-[2px] rounded-[4px] ${active ? 'pressed' : ''}`}
      aria-label={label}
      aria-pressed={active}
    >
      <span className="tv-btn-icon">
        <Icon size={17} />
      </span>
      <span className={`font-pixel text-[5px] leading-none ${active ? 'text-[#FFB000]' : 'text-[#5a5148]'}`}>{label}</span>
      {badge > 0 && (
        <span className="px-blink-fast font-pixel absolute -right-1 -top-1 min-w-[12px] border border-black bg-[#FF4A4A] px-[2px] text-center text-[6px] leading-[12px] text-black">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

export default function Stage1Shell({
  screen,
  channel,
  matchBadge,
  profileBadge,
  soundOn,
  musicOn,
  noiseOn,
  stickers,
  children,
  onKnob,
  onFeed,
  onViewers,
  onProfile,
  onShop,
  onAntenna,
  onSound,
  onMusic,
}: {
  screen: S1Screen
  channel: number
  matchBadge: number
  profileBadge: number
  soundOn: boolean
  musicOn: boolean
  noiseOn: boolean
  stickers: S1StickerPlacement[]
  children: ReactNode
  onKnob: () => void
  onFeed: () => void
  onViewers: () => void
  onProfile: () => void
  onShop: () => void
  onAntenna: () => void
  onSound: () => void
  onMusic: () => void
}) {
  return (
    <div className="kitchen-bg flex min-h-dvh w-full items-center justify-center sm:p-4">
      <div className="relative flex h-dvh w-full max-w-[440px] flex-col sm:h-[min(94dvh,900px)] sm:rounded-[22px]">
        <div className="wood-frame relative flex min-h-0 flex-1 flex-col rounded-t-[18px] p-2 pb-3 sm:rounded-[22px] sm:p-3" data-tv-frame="true">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="font-pixel text-[7px] tracking-widest text-[#c9b18a]/80">РУБИН-2094</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onSound}
                className="font-pixel flex items-center gap-1 rounded-sm bg-[#1a1713] px-1.5 py-1 text-[5.5px] text-[#8a7a5a] active:translate-y-[1px]"
                aria-pressed={soundOn}
                aria-label="Переключатель звуковых эффектов"
                title="Звук: щелчки и эффекты"
              >
                <span className={`inline-block h-[6px] w-[6px] rounded-full ${soundOn ? 'bg-[#33FF00] led' : 'bg-[#3a332c]'}`} />
                ЗВУК
              </button>
              <button
                onClick={onMusic}
                className="font-pixel flex items-center gap-1 rounded-sm bg-[#1a1713] px-1.5 py-1 text-[5.5px] text-[#8a7a5a] active:translate-y-[1px]"
                aria-pressed={musicOn}
                aria-label="Переключатель музыки"
                title="Музыка: саундтрек"
              >
                <span className={`inline-block h-[6px] w-[6px] rounded-full ${musicOn ? 'bg-[#FFB000] led' : 'bg-[#3a332c]'}`} />
                МУЗЫКА
              </button>
              <button
                onClick={onAntenna}
                className="font-pixel flex items-center gap-1 rounded-sm bg-[#1a1713] px-1.5 py-1 text-[5.5px] text-[#8a7a5a] active:translate-y-[1px]"
                aria-pressed={noiseOn}
                aria-label="Переключатель шума антенны"
                title="Антенна: шум помех"
              >
                <span className={`inline-block h-[6px] w-[6px] rounded-full ${noiseOn ? 'bg-[#33FF00] led' : 'bg-[#3a332c]'}`} />
                АНТ
              </button>
            </div>
          </div>

          <div className="plastic-bezel wear-scratches relative flex min-h-0 flex-1 flex-col gap-2 rounded-[10px] p-2">
            <div className="crt-glass relative min-h-0 flex-1 overflow-hidden rounded-[8px]" data-tv-screen="true" style={{ borderRadius: '10px / 8px', boxShadow: 'inset 0 0 24px rgba(0,0,0,.8), inset 0 0 4px rgba(0,0,0,.9)' }}>
              {children}
            </div>

            <div className="panel-black relative flex shrink-0 items-center gap-2.5 rounded-[8px] px-2.5 py-2.5">
              <span className="screw absolute left-1 top-1" aria-hidden="true" />
              <span className="screw absolute right-1 top-1" aria-hidden="true" />
              <span className="screw absolute bottom-1 left-1" aria-hidden="true" />
              <span className="screw absolute bottom-1 right-1" aria-hidden="true" />

              <div className="grille h-[64px] min-w-0 flex-1 rounded-[4px]" aria-hidden="true" />

              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <PanelButton icon="meme" label="МЕМ" active={screen === 'feed'} badge={matchBadge} onClick={onFeed} />
                  <PanelButton icon="viewers" label="ЗРИТЕЛИ" active={screen === 'viewers'} onClick={onViewers} />
                </div>
                <div className="flex gap-1.5">
                  <PanelButton icon="profile" label="ПРОФИЛЬ" active={screen === 'profile' || screen === 'cassette'} badge={profileBadge} onClick={onProfile} />
                  <PanelButton icon="shop" label="МАГАЗИН" active={screen === 'shop'} onClick={onShop} />
                </div>
              </div>

              <ChannelKnob channel={channel} unread={{}} active={screen === 'channel'} onClick={onKnob} />
            </div>
          </div>

          <div className="mt-1 flex justify-center" aria-hidden="true">
            <div className="h-[4px] w-2/3 rounded-full bg-black/50" />
          </div>

          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-label="Наклейки на корпусе">
            {stickers.map((sticker) => (
              <span
                key={sticker.id}
                className="absolute select-none text-[30px] leading-none drop-shadow-[1px_2px_0_rgba(0,0,0,.65)]"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotate}deg)`,
                }}
                role="img"
                aria-label={`Стикер ${sticker.name}`}
                title={sticker.name}
              >
                {sticker.emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
