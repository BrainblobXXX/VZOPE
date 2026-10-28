'use client'

import PhotoAvatar from './PhotoAvatar'
import { Modal, PxButton } from '../tv/ui'
import type { S1User } from './data'

function InfoLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-pixel mb-1 text-[5px] tracking-wider text-[#8a6f3f]">{children}</p>
}

export default function UserModal({
  user,
  avatars,
  hasCassette,
  pendingRequest,
  onOpenCassette,
  onGoShop,
  onClose,
}: {
  user: S1User
  avatars: Record<string, string>
  hasCassette: boolean
  pendingRequest?: boolean
  onOpenCassette: () => void
  onGoShop?: () => void
  onClose: () => void
}) {
  const gender = user.gender === 'Ж' ? 'Ж' : 'М'
  const orientation = user.orientation ? user.orientation.toUpperCase() : '—'

  return (
    <Modal title="ПРОФИЛЬ" onClose={onClose} wide>
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col items-center gap-1.5 border-2 border-[#5a3a00] bg-[#0d0a06] px-3 py-2.5">
          <div className="relative">
            <PhotoAvatar src={avatars[user.id]} seed={user.seed} size={72} alt={user.nick} dim={!user.online} />
            <span
              className={`absolute -bottom-1 -right-1 h-3 w-3 border border-black ${user.online ? 'bg-[#33FF00]' : 'bg-[#4a3a20]'}`}
              aria-label={user.online ? 'В сети' : 'Не в сети'}
            />
          </div>
          <p className="font-pixel glow-amber text-[12px] text-[#FFB000]">{user.nick}</p>
          <p className="font-pixel text-[6px] text-[#e8d9b0]">
            {user.age ?? '—'} · {gender} · {orientation}
          </p>
          <p className="font-pixel text-[5px] text-[#8a6f3f]">
            {user.online ? `● В СЕТИ · ${user.status.toUpperCase()}` : '○ НЕ В СЕТИ'}
          </p>
          {pendingRequest && (
            <p className="px-blink-fast font-pixel text-[5px] text-[#FFB000]">↩ ОТПРАВИЛ(А) ВАМ ЗАЯВКУ. ОТВЕТ — В ПРОФИЛЕ.</p>
          )}
        </div>

        <div className="pixel-scroll flex max-h-[30dvh] flex-col gap-2.5 overflow-y-auto pr-1">
          <section>
            <InfoLabel>О СЕБЕ</InfoLabel>
            <p className="font-pixel border-l-2 border-[#5a3a00] pl-2 text-[6px] leading-relaxed text-[#e8d9b0]">
              {user.about ?? 'МОЛЧИТ В ТРУБКУ. ЗАПИШИСЬ НА ЭФИР.'}
            </p>
          </section>
          <section>
            <InfoLabel>ИНТЕРЕСЫ</InfoLabel>
            <div className="flex flex-wrap gap-1">
              {(user.interests && user.interests.length > 0 ? user.interests : ['МЕМЫ']).map((i) => (
                <span key={i} className="font-pixel border border-[#5a3a00] bg-[#1c0e00] px-1.5 py-0.5 text-[5px] text-[#FFB000]">
                  {i}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-1.5">
          {hasCassette && (
            <PxButton variant="green" onClick={onOpenCassette}>
              ОТКРЫТЬ КАССЕТУ
            </PxButton>
          )}
          {onGoShop && (
            <PxButton variant="ghost" onClick={onGoShop}>
              🎁 ПОДАРИТЬ ПОДАРОК
            </PxButton>
          )}
          <PxButton variant="ghost" onClick={onClose}>
            ЗАКРЫТЬ
          </PxButton>
        </div>
      </div>
    </Modal>
  )
}
