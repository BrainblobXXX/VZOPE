'use client'

import { useEffect, useRef, useState } from 'react'
import PhotoAvatar from '../PhotoAvatar'
import UserModal from '../UserModal'
import { Modal, PxButton } from '../../tv/ui'
import type { S1ChatMessage, S1ShopItem, S1User } from '../data'

function TypingRow({ avatar, nick, src, seed }: { avatar?: string; nick: string; src?: string; seed: string }) {
  return (
    <div className="mb-2.5 flex items-end gap-1.5">
      <PhotoAvatar src={avatar} seed={seed} size={22} alt={nick} />
      <div className="flex items-center gap-1.5 border-2 border-[#5a3a00] bg-[#1c0e00] px-2.5 py-2" aria-label={`${nick} печатает`}>
        <span className="font-pixel text-[6px] text-[#8a6f3f]">ЗАПИСЫВАЕТ</span>
        <span className="flex gap-0.5" aria-hidden="true">
          <span className="px-blink-dot h-1 w-1 bg-[#FFB000]" style={{ animationDelay: '0ms' }} />
          <span className="px-blink-dot h-1 w-1 bg-[#FFB000]" style={{ animationDelay: '160ms' }} />
          <span className="px-blink-dot h-1 w-1 bg-[#FFB000]" style={{ animationDelay: '320ms' }} />
        </span>
      </div>
    </div>
  )
}

export default function Stage1Cassette({
  user,
  messages,
  avatars,
  typing = false,
  stickers,
  gifts,
  onBack,
  onSend,
  onSendItem,
  onBurn,
  onExport,
}: {
  user: S1User
  messages: S1ChatMessage[]
  avatars: Record<string, string>
  typing?: boolean
  stickers: S1ShopItem[]
  gifts: S1ShopItem[]
  onBack: () => void
  onSend: (text: string) => void
  onSendItem: (item: S1ShopItem) => void
  onBurn?: (msgId: string) => void
  onExport?: (msg: S1ChatMessage) => void
}) {
  const [text, setText] = useState('')
  const [giftPicker, setGiftPicker] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [burnTarget, setBurnTarget] = useState<S1ChatMessage | null>(null)
  const [exportTarget, setExportTarget] = useState<S1ChatMessage | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText('')
  }

  return (
    <div className="flex h-full flex-col bg-[#140c04]">
      <header className="flex items-center gap-2 border-b-2 border-[#6b4a00] bg-[#1c0e00]/80 px-2.5 py-2">
        <button
          onClick={onBack}
          className="font-pixel shrink-0 border border-[#5a3a00] px-1.5 py-1 text-[10px] text-[#FFB000] hover:border-[#FFB000]"
          aria-label="Назад в профиль"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="shrink-0 cursor-pointer border border-transparent hover:border-[#FFB000]"
          aria-label={`Открыть профиль ${user.nick}`}
        >
          <PhotoAvatar src={avatars[user.id]} seed={user.seed} size={32} alt={user.nick} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-pixel truncate text-[9px] text-[#FFB000]">{user.nick}</p>
          <p className="font-pixel mt-0.5 text-[5px] text-[#8a6f3f]">
            {typing ? '● ЗАПИСЫВАЕТСЯ…' : user.online ? '● В СЕТИ' : '○ НЕ В СЕТИ'} · КАССЕТА
          </p>
        </div>
        <button
          onClick={() => setGiftPicker(true)}
          className="font-pixel shrink-0 border border-[#FFB000]/60 px-1.5 py-1 text-[6px] text-[#FFB000] hover:border-[#FFB000]"
          aria-label="Подарить подарок"
        >
          🎁 {gifts.length > 0 ? gifts.length : ''}
        </button>
      </header>

      <div ref={listRef} className="pixel-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <p className="font-pixel mb-3 text-center text-[5px] leading-relaxed text-[#5a4626]">
          ЛИЧНАЯ КАССЕТА · СООБЩЕНИЯ ВИДНЫ ТОЛЬКО ВАМ ДВОИМ
        </p>

        {messages.map((m) => {
          const mine = m.from === 'me'
          const burnable = mine && !!onBurn
          if (m.kind === 'sticker') {
            return (
              <div key={m.id} className={`mb-2.5 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <button
                  type="button"
                  onClick={burnable ? () => setBurnTarget(m) : undefined}
                  className={`flex flex-col items-center border-2 border-[#FFB000]/70 bg-[#1c0e00] px-4 py-2 ${burnable ? 'cursor-pointer transition-transform hover:-translate-y-[1px]' : 'cursor-default'}`}
                  title={burnable ? 'СЖЕЧЬ СТИКЕР' : m.text}
                  aria-label={burnable ? `Стикер ${m.text}. Нажать, чтобы сжечь` : `Стикер ${m.text}`}
                >
                  <span className="text-[34px] leading-none" aria-hidden="true">{m.emoji}</span>
                  <span className="font-pixel mt-1 text-[5px] text-[#8a6f3f]">{m.text}</span>
                  <span className="font-pixel mt-0.5 text-[4px] text-[#5a4626]">{m.time}</span>
                </button>
              </div>
            )
          }
          if (m.kind === 'gift') {
            return (
              <div key={m.id} className={`mb-2.5 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <button
                  type="button"
                  onClick={burnable ? () => setBurnTarget(m) : undefined}
                  className={`relative flex flex-col items-center border-2 border-[#FF00FF] bg-[#1c0e00] px-4 py-2 ${burnable ? 'cursor-pointer transition-transform hover:-translate-y-[1px]' : 'cursor-default'}`}
                  style={{ boxShadow: '0 0 18px #FF00FF33' }}
                  title={burnable ? 'СЖЕЧЬ ПОДАРОК' : m.text}
                  aria-label={burnable ? `Подарок ${m.text}. Нажать, чтобы сжечь` : `Подарок ${m.text}`}
                >
                  <span className="font-pixel absolute -top-1.5 left-1/2 -translate-x-1/2 border border-black bg-[#FF00FF] px-1 text-[4px] leading-[8px] text-black">ПОДАРОК</span>
                  <span className="text-[38px] leading-none" aria-hidden="true">{m.emoji}</span>
                  <span className="font-pixel mt-1 text-[5px] text-[#FFB000]">{m.text}</span>
                  <span className="font-pixel mt-0.5 text-[4px] text-[#5a4626]">{m.time}</span>
                </button>
              </div>
            )
          }
          return (
            <div key={m.id} className={`mb-2.5 flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && (
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="shrink-0 cursor-pointer border border-transparent hover:border-[#FFB000]"
                  aria-label={`Открыть профиль ${user.nick}`}
                >
                  <PhotoAvatar src={avatars[user.id]} seed={user.seed} size={22} alt={user.nick} />
                </button>
              )}
              <button
                type="button"
                onClick={
                  burnable
                    ? () => setBurnTarget(m)
                    : !mine && onExport
                      ? () => setExportTarget(m)
                      : undefined
                }
                className={`max-w-[78%] border-2 px-2.5 py-1.5 text-left ${
                  mine ? 'border-[#FFB000] bg-[#FFB000] text-[#140c04]' : 'border-[#5a3a00] bg-[#1c0e00] text-[#e8d9b0]'
                } ${
                  burnable
                    ? 'cursor-pointer transition-transform hover:-translate-y-[1px]'
                    : !mine && onExport
                      ? 'cursor-pointer border-dashed transition-colors hover:border-[#FF00FF]'
                      : 'cursor-default'
                }`}
                title={burnable ? 'СЖЕЧЬ КАДР' : !mine && onExport ? 'ЭКСПОРТ В МЭМ-ЭФИР' : undefined}
                aria-label={
                  burnable
                    ? `Кадр: ${m.text}. Нажать, чтобы сжечь`
                    : !mine && onExport
                      ? `Кадр соседа: ${m.text}. Нажать, чтобы выпустить в МЭМ-ЭФИР`
                      : m.text
                }
              >
                <p className="font-pixel break-words text-[7px] leading-relaxed">{m.text}</p>
                <p className={`font-pixel mt-1 text-right text-[5px] ${mine ? 'text-[#5a3a00]' : 'text-[#5a4626]'}`}>{m.time}</p>
              </button>
            </div>
          )
        })}

        {typing && <TypingRow avatar={avatars[user.id]} nick={user.nick} src={avatars[user.id]} seed={user.seed} />}

        {messages.length === 0 && !typing && (
          <p className="font-pixel mt-8 text-center text-[7px] leading-relaxed text-[#8a6f3f]">
            ТУТ ПОКА ТИХО. НАПИШИ ПЕРВЫМ.
          </p>
        )}
      </div>

      {stickers.length > 0 && (
        <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-t border-[#3d2a10] bg-[#0d0a06] px-2 py-1.5" aria-label="Стикеры">
          <span className="font-pixel shrink-0 pr-1 text-[5px] text-[#5a4626]">СТИКЕРЫ:</span>
          {stickers.map((s) => (
            <button
              key={s.id}
              onClick={() => onSendItem(s)}
              className="shrink-0 border border-[#5a3a00] bg-[#140c04] px-1.5 py-1 text-[16px] leading-none transition-transform hover:-translate-y-[1px] hover:border-[#FFB000]"
              title={s.name}
              aria-label={`Отправить стикер ${s.name}`}
            >
              {s.emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={send} className="border-t-2 border-[#6b4a00] bg-[#0d0a06] p-2">
        <div className="flex items-center gap-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            placeholder="НАПИСАТЬ НА ПЛЁНКУ..."
            className="font-pixel min-w-0 flex-1 border-2 border-[#5a3a00] bg-[#140c04] px-2 py-2 text-[7px] text-[#e8d9b0] placeholder:text-[#5a4626] focus:border-[#FFB000] focus:outline-none"
            aria-label="Сообщение"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="font-pixel shrink-0 border-2 border-[#FFB000] bg-[#FFB000] px-3 py-2 text-[9px] text-[#140c04] disabled:cursor-not-allowed disabled:border-[#5a3a00] disabled:bg-[#1c0e00] disabled:text-[#5a4626]"
            aria-label="Отправить"
          >
            ➤
          </button>
        </div>
        <p className="font-pixel mt-1 text-center text-[5px] text-[#3d3020]">В ДЕМО СООБЩЕНИЯ ЛОКАЛЬНЫЕ. НА ЭТАПЕ 2 — ЧЕРЕЗ СЕРВЕР.</p>
      </form>

      {burnTarget && (
        <Modal title="КАДР НА ПЛЁНКЕ" onClose={() => setBurnTarget(null)}>
          <div className="flex flex-col gap-3">
            <p className="font-pixel text-center text-[7px] leading-relaxed text-[#e8d9b0]">
              {burnTarget.kind === 'sticker' ? (
                <>
                  ЭТОТ СТИКЕР НАРИСОВАН ТОБОЙ НА ПЛЁНКЕ.
                  <br />
                  СЖЕЧЬ — И ОТ ЖАБЫ ОСТАНЕТСЯ ТОЛЬКО ДЫМ.
                </>
              ) : burnTarget.kind === 'gift' ? (
                <>
                  ЭТОТ ПОДАРОК УЖЕ ВРУЧЕН.
                  <br />
                  СЖЕЧЬ МОЖНО ТОЛЬКО КАДР-ВОСПОМИНАНИЕ.
                </>
              ) : (
                <>
                  ЭТОТ КАДР ЗАПИСАН ТОБОЙ.
                  <br />
                  СЖЕЧЬ — И ОТ НЕГО ОСТАНЕТСЯ ТОЛЬКО ДЫМ.
                </>
              )}
            </p>
            <div className="flex flex-col gap-1.5">
              <PxButton
                variant="danger"
                onClick={() => {
                  onBurn?.(burnTarget.id)
                  setBurnTarget(null)
                }}
              >
                СЖЕЧЬ КАДР
              </PxButton>
              <PxButton variant="ghost" onClick={() => setBurnTarget(null)}>
                ОСТАВИТЬ
              </PxButton>
            </div>
          </div>
        </Modal>
      )}

      {exportTarget && (
        <Modal title="КАДР СОСЕДА" onClose={() => setExportTarget(null)}>
          <div className="flex flex-col gap-3">
            <div className="border-2 border-[#5a3a00] bg-[#0d0a06] p-2">
              <p className="font-pixel break-words text-center text-[7px] leading-relaxed text-[#e8d9b0]">
                «{exportTarget.text}»
              </p>
              <p className="font-pixel mt-1 text-center text-[5px] text-[#5a4626]">
                ЗАПИСАНО НА КАССЕТЕ · {user.nick}
              </p>
            </div>
            <p className="font-pixel text-center text-[6px] leading-relaxed text-[#8a6f3f]">
              МОЖНО ВЫПУСТИТЬ КАДР В МЭМ-ЭФИР.
              <br />
              ЭФИР ПЛАТИТ ЗА КУРАТОРСТО +1 МЕМ-КОИН.
            </p>
            <div className="flex flex-col gap-1.5">
              <PxButton
                variant="green"
                onClick={() => {
                  onExport?.(exportTarget)
                  setExportTarget(null)
                }}
              >
                ВЫПУСТИТЬ В МЭМ-ЭФИР
              </PxButton>
              <PxButton variant="ghost" onClick={() => setExportTarget(null)}>
                ЗАКРЫТЬ
              </PxButton>
            </div>
          </div>
        </Modal>
      )}

      {giftPicker && (
        <Modal title="ПОДАРИТЬ ПОДАРОК" onClose={() => setGiftPicker(false)}>
          <div className="flex flex-col gap-1.5">
            {gifts.length === 0 ? (
              <>
                <p className="font-pixel text-center text-[7px] leading-relaxed text-[#8a6f3f]">
                  ПОДАРКОВ НЕТ. ЗАГЛЯНИ В ЛАВКУ — ТАМ РОЗЫ, ШОКОАД И РАДИОТОЧКА.
                </p>
                <PxButton variant="ghost" onClick={() => setGiftPicker(false)}>
                  ЗАКРЫТЬ
                </PxButton>
              </>
            ) : (
              <>
                {gifts.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      onSendItem(g)
                      setGiftPicker(false)
                    }}
                    className="flex items-center gap-2 border-2 border-[#5a3a00] bg-[#140c04] p-2 text-left hover:border-[#FFB000]"
                    aria-label={`Подарить ${g.name}`}
                  >
                    <span className="text-[22px]" aria-hidden="true">{g.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="font-pixel block truncate text-[7px] text-[#FFB000]">{g.name}</span>
                      <span className="font-pixel mt-0.5 block truncate text-[5px] text-[#8a6f3f]">{g.desc}</span>
                    </span>
                  </button>
                ))}
                <PxButton variant="ghost" onClick={() => setGiftPicker(false)}>
                  ОТМЕНА
                </PxButton>
              </>
            )}
          </div>
        </Modal>
      )}
      {profileOpen && (
        <UserModal
          user={user}
          avatars={avatars}
          hasCassette={false}
          onOpenCassette={() => setProfileOpen(false)}
          onClose={() => setProfileOpen(false)}
        />
      )}

    </div>
  )
}
