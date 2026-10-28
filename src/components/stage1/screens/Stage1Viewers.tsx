'use client'

import { useEffect, useState } from 'react'
import PhotoAvatar from '../PhotoAvatar'
import UserModal from '../UserModal'
import { LIVE_STATUSES, VIEWERS, type S1Cassette, type S1Request, type S1User } from '../data'

export default function Stage1Viewers({
  avatars,
  me,
  cassettes,
  requests,
  myStatus,
  onToast,
  onOpenCassette,
  onGoShop,
}: {
  avatars: Record<string, string>
  me: S1User
  cassettes: S1Cassette[]
  requests: S1Request[]
  myStatus: string
  onToast: (text: string, tone?: 'amber' | 'red' | 'green') => void
  onOpenCassette: (userId: string) => void
  onGoShop: () => void
}) {
  const [pickedId, setPickedId] = useState<string | null>(null)
  // статусы онлайн-зрителей гуляют каждые 18с
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setTick((v) => v + 1), 18000)
    return () => window.clearInterval(t)
  }, [])
  const liveStatus = (u: S1User, row: number) => (LIVE_STATUSES[(tick + row) % LIVE_STATUSES.length])
  const meRow = { ...me, status: myStatus }
  const rest = [...VIEWERS].sort((a, b) => Number(b.online) - Number(a.online) || a.nick.localeCompare(b.nick))
  const list = [meRow, ...rest]
  const online = list.filter((u) => u.online).length
  const picked = VIEWERS.find((u) => u.id === pickedId) ?? null
  const pickedHasCassette = !!cassettes.find((c) => c.userId === pickedId)
  const pickedPending = !!requests.find((r) => r.userId === pickedId)
  const pendingIds = new Set(requests.map((r) => r.userId))

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b-2 border-[#6b4a00] bg-[#1c0e00]/60 px-3 py-2">
        <h2 className="font-pixel glow-green text-[11px] text-[#33FF00]">ЗРИТЕЛИ</h2>
        <span className="font-pixel text-[8px] text-[#33FF00]" aria-label="онлайн">
          ● {online}/{list.length}
        </span>
      </header>

      <div className="pixel-scroll min-h-0 flex-1 overflow-y-auto">
        <ul>
          {list.map((u, row) => (
            <li key={u.id}>
              <button
                onClick={() => {
                  if (u.id === me.id) {
                    onToast('ЭТО ВЫ. ПРОФИЛЬ — КНОПКОЙ ПРОФИЛЬ', 'amber')
                    return
                  }
                  setPickedId(u.id)
                }}
                className={`flex w-full items-center gap-3 border-b border-[#3d2a10] px-3 py-3 text-left hover:bg-[#FFB000]/5 ${!u.online ? 'opacity-50' : ''}`}
              >
                <span className="relative shrink-0">
                  <PhotoAvatar src={avatars[u.id]} seed={u.seed} size={34} alt={u.nick} dim={!u.online} />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border border-black ${u.online ? 'bg-[#33FF00]' : 'bg-[#4a3a20]'}`} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`font-pixel block truncate text-[9px] ${u.online ? 'text-[#FFB000]' : 'text-[#8a6f3f]'}`}>
                    {u.nick}
                    {u.id === me.id && <span className="ml-1 text-[6px] text-[#5a4626]">(ЭТО ВЫ)</span>}
                  </span>
                  <span className="font-pixel mt-1 block truncate text-[6px] text-[#8a6f3f]">{u.online ? liveStatus(u, row) : 'OFF AIR'}</span>
                </span>
                {pendingIds.has(u.id) && (
                  <span className="px-blink-fast font-pixel shrink-0 border border-[#FFB000] px-1 py-0.5 text-[5px] text-[#FFB000]" aria-label="Ждёт ответа на заявку">
                    ↩ ЗАЯВКА
                  </span>
                )}
                <span className="font-pixel shrink-0 text-[6px] text-[#5a4626]">{u.id === me.id ? '' : 'ПРОФИЛЬ →'}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="font-pixel px-4 py-4 text-center text-[6px] leading-relaxed text-[#3d3020]">
          ОНЛАЙН — АКТИВНОСТЬ ЗА ПОСЛЕДНИЕ 5 МИНУТ.
          <br />
          ТАП ПО ЗРИТЕЛЮ — ПРОФИЛЬ, КАССЕТА ИЛИ ПОДАРОК.
        </p>
      </div>

      {picked && (
        <UserModal
          user={picked}
          avatars={avatars}
          hasCassette={pickedHasCassette}
          pendingRequest={pickedPending}
          onOpenCassette={() => {
            setPickedId(null)
            onOpenCassette(picked.id)
          }}
          onGoShop={() => {
            setPickedId(null)
            onGoShop()
          }}
          onClose={() => setPickedId(null)}
        />
      )}
    </div>
  )
}
