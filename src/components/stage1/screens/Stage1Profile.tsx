'use client'

import { useRef, useState } from 'react'
import PhotoAvatar from '../PhotoAvatar'
import UserModal from '../UserModal'
import { IconCoin, Modal, PxButton, TestBars } from '../../tv/ui'
import { ABOUT_MAX, STATUS_MAX, VIEWERS, type S1Cassette, type S1Request, type S1User } from '../data'

export default function Stage1Profile({
  avatars,
  me,
  coins,
  cassettes,
  unread,
  requests,
  myStatus,
  myAbout,
  matchesCount = 0,
  onAvatarUpload,
  onOpenCassette,
  onDeleteCassette,
  onAcceptRequest,
  onDeclineRequest,
  onToast,
  onEditProfile,
  onOpenSettings,
  onGoShop,
}: {
  avatars: Record<string, string>
  me: S1User
  coins: number
  cassettes: S1Cassette[]
  unread: Record<string, number>
  requests: S1Request[]
  myStatus: string
  myAbout: string
  matchesCount?: number
  onAvatarUpload: (dataUrl: string) => void
  onOpenCassette: (userId: string) => void
  onDeleteCassette: (userId: string) => void
  onAcceptRequest: (userId: string) => void
  onDeclineRequest: (userId: string) => void
  onToast: (text: string, tone?: 'amber' | 'red' | 'green') => void
  onEditProfile: (status: string, about: string) => void
  onOpenSettings: () => void
  onGoShop?: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<S1Cassette | null>(null)
  const [pickedUser, setPickedUser] = useState<S1User | null>(null)
  const [draftStatus, setDraftStatus] = useState(myStatus)
  const [draftAbout, setDraftAbout] = useState(myAbout)

  const onFile = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      onToast('ТОЛЬКО ФОТО')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      onToast('ФОТО БОЛЬШЕ 5 МБ')
      return
    }
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const sx = (img.naturalWidth - side) / 2
      const sy = (img.naturalHeight - side) / 2
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        onToast('НЕ УДАЛОСЬ ОБРАБОТАТЬ ФОТО')
        return
      }
      ctx.drawImage(img, sx, sy, side, side, 0, 0, 512, 512)
      onAvatarUpload(canvas.toDataURL('image/jpeg', 0.86))
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      onToast('НЕ УДАЛОСЬ ОТКРЫТЬ ФОТО')
    }
    img.src = url
  }

  return (
    <div className="pixel-scroll h-full overflow-y-auto">
      <TestBars />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0])
          e.currentTarget.value = ''
        }}
      />
      <div className="px-3 py-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative cursor-pointer border-2 border-[#FFB000] bg-[#140c04] p-1"
              aria-label="Загрузить свой аватар"
            >
              <PhotoAvatar src={avatars['me']} seed={me.seed} size={65} alt="Свой аватар" />
              <span className="font-pixel absolute -bottom-1 -right-1 border border-black bg-[#FFB000] px-1 text-[10px] leading-[14px] text-black">+</span>
            </button>
            <div className="min-w-0">
              <h2 className="font-pixel glow-amber text-[16px] text-[#FFB000]">{me.nick}</h2>
              <p className="font-pixel mt-1.5 text-[7.5px] leading-relaxed text-[#8a6f3f]">
                ПОЛ {me.gender} · ВОЗРАСТ {me.age ?? '—'} · МЭТЧИ {matchesCount} · <IconCoin size={10} color="#FFB000" /> {coins}
              </p>
              <p className="font-pixel mt-1.5 max-w-[195px] truncate text-[6.5px] text-[#33FF00]">● {myStatus}</p>
            </div>
          </div>
          <PxButton variant="ghost" className="px-2 py-1 text-[7px]" onClick={() => { setDraftStatus(myStatus); setDraftAbout(myAbout); setEditOpen(true) }}>
            ✎ РЕД.
          </PxButton>
        </div>

        <p className="font-pixel mt-3 text-[9px] leading-relaxed text-[#e8d9b0]">{myAbout}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-pixel text-[7px] text-[#8a6f3f]">ПОЛКА С КАССЕТАМИ</span>
          <span className="font-pixel text-[6px] text-[#5a4626]">{cassettes.length} ШТ.</span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {cassettes.length === 0 && (
            <p className="font-pixel border border-dashed border-[#5a3a00] px-3 py-3 text-center text-[6px] leading-relaxed text-[#8a6f3f]">
              КАССЕТ ПОКА НЕТ. ПРИМИ ЗАЯВКУ ИЛИ ДОЖДИСЬ МЭТЧА.
            </p>
          )}
          {cassettes.map((c) => (
            <div key={c.id} className="relative flex items-stretch gap-1">
              <button
                onClick={() => onOpenCassette(c.userId)}
                className="group relative flex h-[62px] min-w-0 flex-1 items-stretch overflow-hidden border-2 border-[#2b1a0c] bg-[#120d08] p-[3px] text-left shadow-[0_3px_0_#000] transition-transform hover:-translate-y-[1px]"
                aria-label={`Открыть кассету ${c.nick}`}
              >
              {/* левый торец кассеты */}
              <span className="relative flex w-[30px] shrink-0 flex-col items-center justify-between border-r-2 border-[#3d2a10] bg-[#1d1510] py-1" aria-hidden="true">
                <span className="h-1 w-1 rounded-full bg-[#8a7a5a]" />
                <span className="h-3.5 w-3.5 rounded-full border-2 border-[#4a3a20] bg-[#0d0a06]" />
                <span className="h-1 w-1 rounded-full bg-[#8a7a5a]" />
              </span>

              {/* бумажный лейбл */}
              <span
                className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden bg-[#d8c9a3] px-2 py-1 text-[#1a1208]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.05) 0 1px, transparent 1px 3px)' }}
              >
                <span className="flex items-center gap-1.5 pr-5">
                  <span className="shrink-0 border border-[#1a1208] bg-[#f0e3c2] p-[1px]">
                    <PhotoAvatar src={avatars[c.userId]} seed={c.seed} size={22} alt={c.nick} />
                  </span>
                  <span className="font-pixel truncate text-[7px] text-[#1a1208]">{c.nick}</span>
                </span>
                <span className="font-mono mt-0.5 block truncate pr-7 text-[6px] leading-tight text-[#3a2a18]">{c.last}</span>
                <span className="font-pixel absolute right-1 top-1 border border-[#1a1208] bg-[#c53a2b] px-1 text-[4px] leading-[7px] text-[#f5e6c8]">S/H</span>
                <span className="font-pixel absolute bottom-0.5 right-1 text-[4px] text-[#5a4626]">{c.time}</span>
              </span>

              {/* корешок E-180 */}
              <span className="flex w-[26px] shrink-0 flex-col items-center justify-center gap-0.5 border-l-2 border-[#3d2a10] bg-[#c53a2b]" aria-hidden="true">
                <span className="font-pixel text-[4px] leading-none text-[#f5e6c8]" style={{ writingMode: 'vertical-rl' }}>E-180</span>
                <span className="h-1 w-1 bg-[#f5e6c8]" />
              </span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(c)}
                className="flex h-[62px] w-7 shrink-0 items-center justify-center border-2 border-[#2b1a0c] bg-[#1d1510] text-[12px] text-[#FF4A4A] shadow-[0_3px_0_#000] transition-colors hover:border-[#FF4A4A] hover:bg-[#3a1410]"
                aria-label={`Удалить кассету ${c.nick}`}
                title="Вытащить кассету"
              >
                ✕
              </button>
              {(unread[c.userId] ?? 0) > 0 && (
                <span className="px-blink-fast font-pixel absolute right-9 -top-1.5 z-10 min-w-[14px] border border-black bg-[#FF4A4A] px-[2px] text-center text-[6px] leading-[12px] text-black">
                  {unread[c.userId]}
                </span>
              )}
            </div>
          ))}
        </div>

        {requests.length > 0 && (
          <>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-pixel text-[7px] text-[#8a6f3f]">ВХОДЯЩИЕ ЗАЯВКИ</span>
              <span className="font-pixel text-[6px] text-[#5a4626]">{requests.length}</span>
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {requests.map((r) => (
            <div key={r.id} className="relative flex items-center gap-2 border border-[#5a3a00] bg-[#1c0e00]/70 p-2">
              <button
                type="button"
                onClick={() => setPickedUser(VIEWERS.find((u) => u.id === r.userId) ?? null)}
                className="shrink-0 cursor-pointer border border-transparent hover:border-[#FFB000]"
                aria-label={`Открыть профиль ${r.nick}`}
              >
                <PhotoAvatar src={avatars[r.userId]} seed={r.seed} size={26} alt={r.nick} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-pixel truncate text-[7px] text-[#33FF00]">{r.nick}</p>
                <p className="font-pixel mt-1 text-[5px] text-[#8a6f3f]">ОБЩИХ МЕМОВ: {r.common}</p>
              </div>
              {!r.seen && (
                <span className="px-blink-fast font-pixel shrink-0 border border-[#FFB000] px-1 py-0.5 text-[5px] text-[#FFB000]">НОВОЕ</span>
              )}
              <div className="flex shrink-0 gap-1">
                <PxButton variant="green" className="px-1.5 py-1 text-[6px]" onClick={() => onAcceptRequest(r.userId)}>✓</PxButton>
                <PxButton variant="danger" className="px-1.5 py-1 text-[6px]" onClick={() => onDeclineRequest(r.userId)}>✕</PxButton>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-5 flex justify-center gap-2 pb-2">
          <PxButton variant="ghost" className="text-[7px]" onClick={onOpenSettings}>
            НАСТРОЙКИ
          </PxButton>
        </div>
      </div>
      <TestBars />

      {pickedUser && (
        <UserModal
          user={pickedUser}
          avatars={avatars}
          hasCassette={cassettes.some((c) => c.userId === pickedUser.id)}
          pendingRequest={requests.some((r) => r.userId === pickedUser.id)}
          onOpenCassette={() => {
            const id = pickedUser.id
            setPickedUser(null)
            onOpenCassette(id)
          }}
          onGoShop={onGoShop}
          onClose={() => setPickedUser(null)}
        />
      )}

      {deleteTarget && (
        <Modal title="ВЫТАЩИТЬ КАССЕТУ" onClose={() => setDeleteTarget(null)} wide>
          <div className="flex flex-col gap-3">
            <p className="font-pixel text-center text-[8px] leading-relaxed text-[#FF4A4A]">
              {deleteTarget.nick}: КАССЕТА ИСЧЕЗНЕТ С ПОЛКИ. ПЕРЕПИСКА СГОРИТ.
            </p>
            <div className="flex gap-1.5">
              <PxButton
                variant="danger"
                className="flex-1"
                onClick={() => {
                  onDeleteCassette(deleteTarget.userId)
                  setDeleteTarget(null)
                }}
              >
                ДА, ВЫТАЩИТЬ
              </PxButton>
              <PxButton variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)}>
                ОСТАВИТЬ
              </PxButton>
            </div>
          </div>
        </Modal>
      )}

      {editOpen && (
        <Modal title="РЕД. ПРОФИЛЯ" onClose={() => setEditOpen(false)} wide>
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="font-pixel mb-1 block text-[5px] text-[#8a6f3f]">СТАТУС (ДО {STATUS_MAX} СИМВОЛОВ)</span>
              <input
                value={draftStatus}
                maxLength={STATUS_MAX}
                onChange={(e) => setDraftStatus(e.target.value)}
                className="font-pixel w-full border-2 border-[#5a3a00] bg-[#140c04] px-2 py-2 text-[7px] text-[#e8d9b0] focus:border-[#FFB000] focus:outline-none"
                aria-label="Статус"
                placeholder="ЧЕМ ЗАНЯТ?"
              />
            </label>
            <label className="block">
              <span className="font-pixel mb-1 block text-[5px] text-[#8a6f3f]">О СЕБЕ (ДО {ABOUT_MAX})</span>
              <textarea
                value={draftAbout}
                maxLength={ABOUT_MAX}
                onChange={(e) => setDraftAbout(e.target.value)}
                rows={4}
                className="font-pixel w-full resize-none border-2 border-[#5a3a00] bg-[#140c04] px-2 py-2 text-[7px] leading-relaxed text-[#e8d9b0] focus:border-[#FFB000] focus:outline-none"
                aria-label="О себе"
                placeholder="ЗАПИШИ СЕБЯ НА ПЛЁНКУ"
              />
              <span className="font-pixel mt-0.5 block text-right text-[5px] text-[#5a4626]">{draftAbout.length}/{ABOUT_MAX}</span>
            </label>
            <div className="flex gap-1.5">
              <PxButton
                variant="green"
                className="flex-1"
                disabled={draftStatus.trim().length === 0 || draftAbout.trim().length === 0}
                onClick={() => {
                  onEditProfile(draftStatus.trim().slice(0, STATUS_MAX), draftAbout.trim().slice(0, ABOUT_MAX))
                  setEditOpen(false)
                }}
              >
                ЗАПИСАТЬ
              </PxButton>
              <PxButton variant="ghost" className="flex-1" onClick={() => setEditOpen(false)}>
                ОТМЕНА
              </PxButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
