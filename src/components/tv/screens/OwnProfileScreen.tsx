'use client'

import { useState } from 'react'
import { ERR, type Cassette, type User } from '@/lib/tv/data'
import { playClick, playError } from '@/lib/tv/sounds'
import PixelAvatar from '../PixelAvatar'
import { IconCassette, IconCoin, Modal, PxButton, TestBars } from '../ui'
import FilmStrip from './FilmStrip'

export default function OwnProfileScreen({
  me,
  photos,
  avatarImg,
  cassette,
  soundOn,
  onEdit,
  onAvatarClick,
  onFrameAction,
  onOpenChat,
  onLogout,
  onBanner,
}: {
  me: User
  photos: Array<{ src: string | null }>
  avatarImg: string | null
  cassette: Cassette | null
  soundOn: boolean
  onEdit: (patch: Partial<User>) => void
  onAvatarClick: () => void
  onFrameAction: (index: number) => void
  onOpenChat: () => void
  onLogout: () => void
  onBanner: (text: string) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [age, setAge] = useState(String(me.age ?? ''))
  const [orientation, setOrientation] = useState(me.orientation ?? '')
  const [bio, setBio] = useState(me.bio ?? '')
  const [sound, setSound] = useState(soundOn)

  const statsLine = [
    `ПОЛ ${me.gender === 'M' ? 'М' : 'Ж'}`,
    me.age ? `ВОЗРАСТ ${me.age}` : '',
    `МЕМ-КОИНЫ ${me.coins}`,
  ]
    .filter(Boolean)
    .join(' · ')

  const save = () => {
    const ageNum = parseInt(age, 10)
    if (age && (isNaN(ageNum) || ageNum < 1 || ageNum > 120)) {
      playError()
      return onBanner('ВОЗРАСТ ОТ 1 ДО 120. НЕ ВРИ')
    }
    playClick()
    onEdit({
      age: ageNum || undefined,
      orientation: orientation.slice(0, 30),
      bio: bio.slice(0, 200),
    })
    setEditOpen(false)
    onBanner(ERR.SAVED)
  }

  const companion = cassette ? { nick: 'КАСС_КРОТ' } : null

  return (
    <div className="relative flex h-full flex-col">
      <TestBars />

      <div className="pixel-scroll relative min-h-0 flex-1 overflow-y-auto">
        {/* редактировать */}
        <button
          onClick={() => { playClick(); setEditOpen(true) }}
          className="font-pixel absolute right-2 top-2 z-10 border-2 border-[#6b4a00] bg-black/60 px-2 py-1.5 text-[7px] text-[#FFB000] hover:border-[#FFB000]"
          aria-label="Редактировать профиль"
        >
          ✎ РЕД.
        </button>

        {/* аватар */}
        <div className="flex flex-col items-center px-3 pb-3 pt-4">
          <button
            onClick={onAvatarClick}
            className="relative rounded-full border-4 border-[#FFB000]/80 p-1"
            style={{ boxShadow: '0 0 14px rgba(255,176,0,.35)' }}
            aria-label="Аватар канала — нажать, чтобы загрузить"
          >
            {avatarImg ? (
               
              <img src={avatarImg} alt="Аватар" className="h-16 w-16 rounded-full object-cover" style={{ imageRendering: 'pixelated' }} />
            ) : (
              <PixelAvatar seed={me.avatarSeed} size={64} />
            )}
            {/* бейдж загрузки */}
            <span className="font-pixel absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center border border-black bg-[#FFB000] text-[9px] text-black">
              +
            </span>
          </button>

          <h2 className="font-pixel chroma mt-3 text-[13px] text-[#FFB000]">{me.nick}</h2>
          <p className="font-pixel mt-2 text-center text-[6px] leading-relaxed text-[#8a6f3f]">{statsLine}</p>
        </div>

        {/* о себе */}
        {me.bio && (
          <p className="border-y border-dashed border-[#5a4626] px-4 py-2 text-center text-[8px] leading-relaxed text-[#e8d9b0]">
            «{me.bio}»
          </p>
        )}

        {/* плёнка */}
        <p className="font-pixel px-3 py-2 text-[6px] text-[#5a4626]">ПЛЁНКА · 4 КАДРА · {photos.filter((p) => p.src).length}/4</p>
        <FilmStrip photos={photos} editable onFrameClick={(i) => onFrameAction(i)} />

        {/* полка с кассетами */}
        <div className="mx-2 mt-4 border-x-4 border-b-4 border-[#5C4033] bg-[#3d2a1a] px-3 pb-3 pt-2">
          <p className="font-pixel mb-2 text-[6px] text-[#c9b18a]">ПОЛКА С КАССЕТАМИ · 1/1</p>
          {cassette && companion ? (
            <button
              onClick={() => { playClick(); onOpenChat() }}
              className="flex w-full items-center gap-3 border-2 border-[#FFB000]/60 bg-black/50 px-3 py-2 text-left hover:border-[#FFB000]"
              aria-label="Открыть личный чат"
            >
              <IconCassette size={34} color="#FFB000" />
              <span>
                <span className="font-pixel block text-[8px] text-[#FFB000]">{companion.nick}</span>
                <span className="font-pixel mt-1 block text-[6px] text-[#8a6f3f]">ТАП: ОТКРЫТЬ ПЛЁНКУ</span>
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3 border-2 border-dashed border-[#5a4626] px-3 py-2 opacity-60">
              <IconCassette size={34} color="#3d3020" />
              <span className="font-pixel text-[7px] leading-relaxed text-[#5a4626]">
                ПОЛКА ПУСТА.
                <br />
                НАПИШИ КОМУ-ТО ИЗ ЧУЖИХ ПРОФИЛЕЙ
              </span>
            </div>
          )}
        </div>

        <p className="font-pixel px-4 py-4 text-center text-[6px] leading-relaxed text-[#3d3020]">
          ТЕСТ-КАРТА УЭИТ · ТВОЙ КАНАЛ В СЕТИ
        </p>
      </div>

      <TestBars className="shrink-0" />

      {/* модалка редактирования */}
      {editOpen && (
        <Modal title="РЕДАКТИРОВАТЬ" onClose={() => setEditOpen(false)}>
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="font-pixel mb-1 block text-[7px] text-[#8a6f3f]">ВОЗРАСТ (1–120)</span>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
                inputMode="numeric"
                className="font-pixel px-input w-full px-2 py-2 text-[9px]"
                placeholder="27"
              />
            </label>
            <label className="block">
              <span className="font-pixel mb-1 block text-[7px] text-[#8a6f3f]">ОРИЕНТАЦИЯ (ДО 30)</span>
              <input
                value={orientation}
                onChange={(e) => setOrientation(e.target.value.slice(0, 30))}
                className="font-pixel px-input w-full px-2 py-2 text-[9px]"
                placeholder="тёплый ламповый"
              />
            </label>
            <label className="block">
              <span className="font-pixel mb-1 block text-[7px] text-[#8a6f3f]">О СЕБЕ (ДО 200)</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                rows={3}
                className="font-pixel px-input w-full resize-none px-2 py-2 text-[8px] leading-relaxed"
              />
            </label>
            <button
              onClick={() => setSound((v) => !v)}
              className={`font-pixel flex items-center justify-between border-2 px-2 py-2 text-[7px] ${sound ? 'border-[#33FF00] text-[#33FF00]' : 'border-[#6b4a00] text-[#8a6f3f]'}`}
            >
              ФОНОВЫЙ ГУЛ ЭЛТ
              <span>{sound ? 'ВКЛ' : 'ВЫКЛ'}</span>
            </button>
            <div className="flex gap-2">
              <PxButton onClick={save} className="flex-1">
                СОХРАНИТЬ
              </PxButton>
              <PxButton
                variant="danger"
                onClick={() => onLogout()}
                className="shrink-0"
              >
                ВЫЙТИ
              </PxButton>
            </div>
            <p className="font-pixel text-center text-[6px] leading-relaxed text-[#5a4626]">
              ПОЛ И НИК НЕ МЕНЯЮТСЯ. ТАК ЗАШИТО В ПРИШИВКУ.
            </p>
          </div>
        </Modal>
      )}

    </div>
  )
}
