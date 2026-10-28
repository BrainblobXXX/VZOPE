'use client'

import { ME_ID, type User } from '@/lib/tv/data'
import { playClick } from '@/lib/tv/sounds'
import PixelAvatar from '../PixelAvatar'

export default function OnAirScreen({
  me,
  users,
  onOpenProfile,
}: {
  me: User
  users: User[]
  onOpenProfile: (userId: string) => void
}) {
  const list = [{ ...me, status: 'ЭТО ВЫ' }, ...users.filter((u) => u.id !== ME_ID)]
  const onlineCount = list.filter((u) => u.online).length

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b-2 border-[#6b4a00] bg-[#1c0e00]/60 px-3 py-2">
        <h2 className="font-pixel glow-green text-[11px] text-[#33FF00]">В ЭФИРЕ</h2>
        <span className="font-pixel text-[8px] text-[#33FF00]" aria-label="онлайн">
          ● {onlineCount}/{list.length}
        </span>
      </header>

      <div className="pixel-scroll min-h-0 flex-1 overflow-y-auto">
        <ul>
          {list.map((u) => (
            <li key={u.id}>
              <button
                onClick={() => {
                  playClick()
                  onOpenProfile(u.id)
                }}
                className={`flex w-full items-center gap-3 border-b border-[#3d2a10] px-3 py-3 text-left hover:bg-[#FFB000]/5 ${!u.online ? 'opacity-50' : ''}`}
              >
                <span className="relative shrink-0">
                  <PixelAvatar seed={u.avatarSeed} size={34} dim={!u.online} />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border border-black ${u.online ? 'bg-[#33FF00]' : 'bg-[#4a3a20]'}`}
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`font-pixel block truncate text-[9px] ${u.online ? 'text-[#FFB000]' : 'text-[#8a6f3f]'}`}>
                    {u.nick}
                    {u.id === ME_ID && <span className="ml-1 text-[6px] text-[#5a4626]">(ЭТО ВЫ)</span>}
                  </span>
                  <span className="font-pixel mt-1 block truncate text-[6px] text-[#8a6f3f]">
                    {u.online ? u.status ?? 'в эфире' : 'OFF AIR'}
                  </span>
                </span>
                <span className="font-pixel shrink-0 text-[6px] text-[#5a4626]">{u.id === ME_ID ? '' : 'ПРОФИЛЬ →'}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="font-pixel px-4 py-4 text-center text-[6px] leading-relaxed text-[#3d3020]">
          СТАТУСЫ ОФЛАЙН НЕ ТРЕКАЮТСЯ.
          <br />
          МЫ НЕ СОЗДАЁМ ОЩУЩЕНИЕ СЛЕЖКИ.
        </p>
      </div>
    </div>
  )
}
