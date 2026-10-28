'use client'

import { Modal, PxButton } from '../tv/ui'
import PhotoAvatar from './PhotoAvatar'
import { VIEWERS, type S1Match, type S1Meme } from './data'

function InfoLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-pixel mb-1.5 text-[6px] tracking-wider text-[#8a6f3f]">{children}</p>
}

export default function Stage1MatchModal({
  match,
  memes,
  avatars,
  onClose,
  onRequest,
}: {
  match: S1Match
  memes: S1Meme[]
  avatars: Record<string, string>
  onClose: () => void
  onRequest: () => void
}) {
  const user = VIEWERS.find((u) => u.id === match.userId)
  if (!user) return null

  const common = memes.slice(0, 3)
  const gender = user.gender === 'Ж' ? 'Ж' : 'М'
  const orientation = user.orientation ? user.orientation.toUpperCase() : '—'

  return (
    <Modal title="СОВПАДЕНИЕ ВКУСОВ" onClose={onClose} wide>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Крупный аватар и базовая карточка */}
        <div className="flex flex-col items-center gap-2 border-2 border-[#33FF00]/60 bg-[#0d0a06] px-3 py-3">
          <div className="relative border-2 border-[#33FF00] bg-[#140c04] p-1" style={{ boxShadow: '0 0 18px #33FF0022' }}>
            <PhotoAvatar src={avatars[user.id]} seed={user.seed} size={112} alt={user.nick} />
            <span
              className={`absolute -bottom-1 -right-1 h-3 w-3 border border-black ${user.online ? 'bg-[#33FF00]' : 'bg-[#4a3a20]'}`}
              aria-label={user.online ? 'В сети' : 'Не в сети'}
            />
          </div>
          <div className="text-center">
            <p className="font-pixel glow-green text-[14px] text-[#33FF00]">{user.nick}</p>
            <p className="font-pixel mt-1.5 text-[7px] text-[#e8d9b0]">
              {user.age ?? '—'} · {gender} · {orientation}
            </p>
            <p className="font-pixel mt-1 text-[6px] text-[#8a6f3f]">
              {user.online ? '● В СЕТИ' : '○ НЕ В СЕТИ'}
            </p>
          </div>
        </div>

        {/* Информация из профиля */}
        <div className="pixel-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
          <section>
            <InfoLabel>О СЕБЕ</InfoLabel>
            <p className="font-pixel border-l-2 border-[#5a3a00] pl-2 text-[7px] leading-relaxed text-[#e8d9b0]">
              {user.about ?? 'БЕЗ ОПИСАНИЯ'}
            </p>
          </section>

          <section>
            <InfoLabel>ИНТЕРЕСЫ</InfoLabel>
            <div className="flex flex-wrap gap-1.5">
              {(user.interests && user.interests.length > 0 ? user.interests : ['МЕМЫ']).map((interest) => (
                <span
                  key={interest}
                  className="font-pixel border border-[#5a3a00] bg-[#1c0e00] px-2 py-1 text-[6px] text-[#FFB000]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>

          <section>
            <InfoLabel>ОБЩИЕ МЕМЫ</InfoLabel>
            <div className="flex justify-center gap-2">
              {common.map((m) => (
                <div
                  key={m.id}
                  className="flex h-[72px] w-[86px] flex-col items-center justify-center overflow-hidden border-2 bg-[#0d0a06]"
                  style={{ borderColor: `${m.accent}88` }}
                >
                  {m.src ? (
                    <img
                      src={m.src}
                      alt={m.caption}
                      className="max-h-[50px] max-w-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <span className="text-[28px] leading-none" aria-hidden="true">
                      {m.emoji}
                    </span>
                  )}
                  <span className="font-pixel mt-1 text-[5px]" style={{ color: m.accent }}>
                    {m.tag}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <p className="font-pixel text-center text-[5px] leading-relaxed text-[#5a4626]">
            ЭТО МОКАП. НАСТОЯЩИЙ ПРОФИЛЬ ОТКРОЕТСЯ ПОСЛЕ МЭТЧА.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5">
          <PxButton variant="green" className="w-full" onClick={onRequest}>
            ОТПРАВИТЬ ЗАЯВКУ
          </PxButton>
          <PxButton variant="ghost" className="w-full" onClick={onClose}>
            ПРОПУСТИТЬ
          </PxButton>
        </div>
      </div>
    </Modal>
  )
}
