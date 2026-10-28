'use client'

import { type Gift, type User } from '@/lib/tv/data'
import { playClick } from '@/lib/tv/sounds'
import PixelAvatar from '../PixelAvatar'
import { PxButton, TestBars } from '../ui'
import FilmStrip from './FilmStrip'

export default function OtherProfileScreen({
  user,
  gifts,
  photos,
  canWrite,
  writeHint,
  onWrite,
  onGift,
  onBack,
  onFrameClick,
}: {
  user: User
  gifts: Gift[]
  photos: Array<{ src: string | null }>
  canWrite: boolean
  writeHint: string
  onWrite: () => void
  onGift: () => void
  onBack: () => void
  onFrameClick: (index: number) => void
}) {
  const statsLine = [
    `ПОЛ ${user.gender === 'M' ? 'М' : 'Ж'}`,
    user.age ? `ВОЗРАСТ ${user.age}` : '',
    user.orientation ? user.orientation.toUpperCase() : '',
  ]
    .filter(Boolean)
    .join(' · ')

  const shownGifts = gifts.slice(-8)

  return (
    <div className="flex h-full flex-col">
      <TestBars />

      <div className="pixel-scroll relative min-h-0 flex-1 overflow-y-auto">
        {/* назад */}
        <button
          onClick={() => { playClick(); onBack() }}
          className="font-pixel absolute left-2 top-2 z-10 border-2 border-[#6b4a00] bg-black/60 px-2 py-1.5 text-[7px] text-[#FFB000] hover:border-[#FFB000]"
          aria-label="Назад"
        >
          ← НАЗАД
        </button>

        <div className="flex flex-col items-center px-3 pb-3 pt-4">
          <span className="rounded-full border-4 border-[#33FF00]/60 p-1" style={{ boxShadow: '0 0 14px rgba(51,255,0,.2)' }}>
            <PixelAvatar seed={user.avatarSeed} size={64} dim={!user.online} />
          </span>
          <h2 className="font-pixel mt-3 text-[13px] text-[#FFB000]">{user.nick}</h2>
          <p className="font-pixel mt-2 text-center text-[6px] leading-relaxed text-[#8a6f3f]">
            {statsLine}
            {user.online ? '' : ' · OFF AIR'}
          </p>
        </div>

        {user.bio && (
          <p className="border-y border-dashed border-[#5a4626] px-4 py-2 text-center text-[8px] leading-relaxed text-[#e8d9b0]">
            «{user.bio}»
          </p>
        )}

        <p className="font-pixel px-3 py-2 text-[6px] text-[#5a4626]">ПЛЁНКА · ТОЛЬКО ПРОСМОТР</p>
        <FilmStrip photos={photos} editable={false} onFrameClick={onFrameClick} />

        {/* полученные подарки */}
        {shownGifts.length > 0 && (
          <>
            <p className="font-pixel px-3 pb-1 pt-4 text-[6px] text-[#5a4626]">ПОЛУЧЕННЫЕ ПОДАРКИ · {gifts.length}</p>
            <div className="flex gap-1.5 overflow-x-auto px-3 pb-3">
              {shownGifts.map((g) => (
                <span
                  key={g.id}
                  className="flex h-11 w-11 shrink-0 flex-col items-center justify-center border border-[#6b4a00] bg-black/40"
                  title={`${g.name} — от ${g.fromNick}`}
                >
                  <span className="emoji-px text-lg leading-none">{g.icon}</span>
                </span>
              ))}
            </div>
          </>
        )}

        {/* кнопки действий */}
        <div className="flex flex-col gap-2 px-3 pb-4 pt-2">
          <PxButton
            onClick={() => { playClick(); onWrite() }}
            disabled={!canWrite}
            variant="green"
            className="w-full !py-3"
          >
            ✉ НАПИСАТЬ (КАССЕТА)
          </PxButton>
          {!canWrite && writeHint && (
            <p className="font-pixel text-center text-[6px] leading-relaxed text-[#8a6f3f]">{writeHint}</p>
          )}
          <PxButton onClick={() => { playClick(); onGift() }} className="w-full !py-3">
            🎁 ПОДАРИТЬ ПОДАРОК
          </PxButton>
        </div>

        <p className="font-pixel px-4 pb-4 text-center text-[6px] leading-relaxed text-[#3d3020]">
          БАЛАНС, ПОЛКА И ЛИЧКА ЭТОГО КАНАЛА СКРЫТЫ.
          <br />
          ПРИВАТНОСТЬ — ЭТО КОГДА ТЕБЯ НЕ ВИДНО.
        </p>
      </div>

      <TestBars className="shrink-0" />
    </div>
  )
}
