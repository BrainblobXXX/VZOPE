'use client'

import { useEffect, useRef, useState } from 'react'
import {
  REACTIONS,
  emptyChannelText,
  fmtTime,
  mockUsers,
  ME_ID,
  type Channel,
  type Message,
  type ReactionEmoji,
  type User,
} from '@/lib/tv/data'
import { playClick, playSend } from '@/lib/tv/sounds'
import { useLongPress } from '@/lib/tv/useLongPress'
import PixelAvatar from '../PixelAvatar'
import { IconClip } from '../ui'

// подсветка @упоминаний
export function renderText(text: string) {
  return text.split(/(@[A-ZА-ЯЁ0-9_]+)/g).map((p, i) =>
    p.startsWith('@') ? (
      <span key={i} className="mention">
        {p}
      </span>
    ) : (
      p
    ),
  )
}

export function ReactionPill({
  emoji,
  count,
  byMe,
  onClick,
}: {
  emoji: string
  count: number
  byMe?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`emoji-px flex items-center gap-1 border px-1.5 py-0.5 text-[9px] leading-none ${
        byMe ? 'border-[#FFB000] bg-[#FFB000]/15' : 'border-[#5a4626] bg-black/30'
      }`}
      aria-label={`Реакция ${emoji}, ${count}`}
    >
      <span>{emoji}</span>
      <span className={byMe ? 'text-[#FFB000]' : 'text-[#8a6f3f]'}>{count}</span>
    </button>
  )
}

export function MediaBlock({ m, onBanner }: { m: NonNullable<Message['media']>; onBanner?: (t: string) => void }) {
  if (m.kind === 'photo' && m.src) {
    return (
       
      <img
        src={m.src}
        alt="Фото из чата"
        className="mt-1.5 max-h-32 w-auto max-w-full cursor-pointer border-2 border-[#6b4a00] object-cover"
        style={{ imageRendering: 'pixelated' }}
        onClick={() => onBanner?.('ПРОСМОТР: КАДР НА ВЕСЬ ЭКРАН (В РАЗРАБОТКЕ)')}
      />
    )
  }
  if (m.kind === 'photo') {
    return (
      <div className="film-empty mt-1.5 flex h-24 w-full items-center justify-center bg-black/30">
        <span className="emoji-px text-3xl">📷</span>
      </div>
    )
  }
  if (m.kind === 'video') {
    return (
      <button className="film-empty mt-1.5 flex h-20 w-full items-center gap-3 bg-black/40 px-3" onClick={() => onBanner?.('ВИДЕОПЛЕЕР ПОЯВИТСЯ В СЛЕДУЮЩЕЙ ПЕРЕМОТКЕ')}>
        <span className="emoji-px text-2xl">📼</span>
        <span className="font-pixel text-[7px] text-[#8a6f3f]">ВИДЕО {m.duration ?? '0:07'} — ТАП: PLAY</span>
      </button>
    )
  }
  return (
    <button className="film-empty mt-1.5 flex h-14 w-full items-center gap-2 bg-black/40 px-3" onClick={() => onBanner?.('ГОЛОСОВОЕ ВОСПРОИЗВОДИТСЯ... ШШШ')}>
      <span className="text-[#FFB000]">▶</span>
      <span className="font-pixel text-[7px] text-[#8a6f3f]">ГОЛОСОВОЕ {m.duration ?? '0:12'}</span>
      <span className="flex flex-1 items-end justify-end gap-[2px]" aria-hidden="true">
        {[4, 9, 6, 12, 7, 3, 10, 5, 8, 4, 11, 6].map((h, i) => (
          <span key={i} className="w-[3px] bg-[#FFB000]/60" style={{ height: h }} />
        ))}
      </span>
    </button>
  )
}

export function MessageBody({ m, onBanner }: { m: Message; onBanner?: (t: string) => void }) {
  if (m.sticker) {
    return <div className="emoji-px mt-1 py-1 text-4xl leading-none">{m.sticker}</div>
  }
  return (
    <>
      {m.text && (
        <p className="mt-1 break-words text-[9px] leading-[1.9] text-[#e8d9b0]">{renderText(m.text)}</p>
      )}
      {m.media && <MediaBlock m={m.media} onBanner={onBanner} />}
    </>
  )
}

// строка сообщения флудилки (компонент — чтобы использовать хук долгого тапа)
function FloodMessageRow({
  m,
  me,
  users,
  isBanned,
  onOpenProfile,
  onMsgMenu,
  onReact,
  onBanner,
}: {
  m: Message
  me: User
  users: User[]
  isBanned?: boolean
  onOpenProfile: (userId: string) => void
  onMsgMenu: (msgId: string) => void
  onReact: (msgId: string, emoji: ReactionEmoji) => void
  onBanner: (text: string) => void
}) {
  const author = m.authorId === ME_ID ? me : users.find((u) => u.id === m.authorId)
  const mine = m.authorId === ME_ID
  const marker = mine ? '*' : '>'
  // забанен админом: ник серый, аватар — заглушка (краевой случай 8.11)
  const nickColor = isBanned ? 'text-[#5a5148]' : mine ? 'text-[#FFB000]' : 'text-[#33FF00]'
  // долгий тап (мобиль) или тап по телу сообщения — меню
  const longPress = useLongPress(() => onMsgMenu(m.id), () => onMsgMenu(m.id))

  return (
    <li className="msg-line">
      {m.replyTo && (
        <p className="mb-1 truncate border-l-2 border-[#5a4626] pl-2 text-[7px] text-[#8a6f3f]">
          ↩ {m.replyTo.authorNick}: {m.replyTo.text}
        </p>
      )}
      <div className="msg-row flex gap-2 px-3 py-2" {...longPress}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenProfile(m.authorId)
          }}
          className="mt-0.5 shrink-0"
          aria-label={`Профиль ${author?.nick ?? '???'}`}
        >
          <PixelAvatar seed={author?.avatarSeed ?? 'unknown'} size={26} dim={isBanned || (!author?.online && !mine)} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenProfile(m.authorId)
              }}
              className={`font-pixel truncate text-[8px] ${nickColor} hover:underline`}
            >
              {marker} {author?.nick ?? 'УДАЛЁН'}
              {isBanned && <span className="ml-1 text-[5px] text-[#FF4A4A]/70">[КАНАЛ ОТКЛЮЧЁН]</span>}
            </button>
            <span className="font-pixel shrink-0 text-[6px] text-[#6b5a36]">
              {fmtTime(m.time)}
              {m.edited ? ' · ИЗМ' : ''}
              {m.status === 'queued' ? ' · ⏳' : ''}
            </span>
          </div>
          <MessageBody m={m} onBanner={onBanner} />
          {/* реакции */}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {m.reactions.map((r) => (
              <span
                key={r.emoji}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  onReact(m.id, r.emoji)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                    onReact(m.id, r.emoji)
                  }
                }}
              >
                <ReactionPill emoji={r.emoji} count={r.count} byMe={r.byMe} />
              </span>
            ))}
            {!m.reactions.length && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  onMsgMenu(m.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                    onMsgMenu(m.id)
                  }
                }}
              >
                <span className="font-pixel cursor-pointer border border-dashed border-[#3d3020] px-1.5 py-0.5 text-[6px] text-[#5a4626] hover:border-[#FFB000] hover:text-[#FFB000]">
                  + РЕАКЦИЯ
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export default function ChannelScreen({
  channel,
  me,
  users,
  bannedIds = [],
  online,
  canLoadOlder,
  value: input,
  onValueChange: setInput,
  context,
  onCancelContext,
  onSend,
  onReact,
  onOpenProfile,
  onMsgMenu,
  onLoadOlder,
  onBanner,
}: {
  channel: Channel
  me: User
  users: User[]
  bannedIds?: string[]
  online: boolean
  canLoadOlder: boolean
  value: string
  onValueChange: (v: string) => void
  context: { kind: 'reply'; nick: string; text: string } | { kind: 'edit'; text: string } | null
  onCancelContext: () => void
  onSend: (payload: { text?: string; media?: Message['media'] }) => void
  onReact: (msgId: string, emoji: ReactionEmoji) => void
  onOpenProfile: (userId: string) => void
  onMsgMenu: (msgId: string) => void
  onLoadOlder: () => void
  onBanner: (text: string) => void
}) {
  const [attachOpen, setAttachOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [newBelow, setNewBelow] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(true)
  const filePhoto = useRef<HTMLInputElement>(null)
  const fileVideo = useRef<HTMLInputElement>(null)
  const prevCount = useRef(channel.messages.length)
  const loadingOlder = useRef(false)

  const onlineCount = users.filter((u) => u.online).length + 1

  const scrollBottom = (smooth = false) => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    nearBottomRef.current = true
    setNewBelow(0)
  }

  const domScrollBottom = (smooth = false) => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    nearBottomRef.current = true
  }

  useEffect(() => {
    domScrollBottom()
    const t = setTimeout(() => setNewBelow(0), 0)
    return () => clearTimeout(t)
  }, [channel.id])

  // новое сообщение: автоскролл если внизу, иначе счётчик «↓ новое»
  useEffect(() => {
    if (channel.messages.length === prevCount.current) return
    const addedOlder = channel.messages.length > prevCount.current + 1
    prevCount.current = channel.messages.length
    if (addedOlder) return
    if (nearBottomRef.current) {
      const raf = requestAnimationFrame(() => domScrollBottom(true))
      return () => cancelAnimationFrame(raf)
    }
    const t = setTimeout(() => setNewBelow((n) => n + 1), 0)
    return () => clearTimeout(t)
  }, [channel.messages.length])

  const onScroll = () => {
    const el = listRef.current
    if (!el) return
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90
    if (nearBottomRef.current && newBelow) setNewBelow(0)
    if (el.scrollTop < 70 && canLoadOlder && !loadingOlder.current) {
      loadingOlder.current = true
      onLoadOlder()
      setTimeout(() => (loadingOlder.current = false), 800)
    }
  }

  // упоминания
  const detectMention = (value: string) => {
    const m = /@([\wА-ЯЁа-яё]*)$/.exec(value)
    setMentionQuery(m ? m[1].toLowerCase() : null)
  }
  const mentionCandidates = mentionQuery === null ? [] : mockUsers
    .filter((u) => u.online && u.nick.toLowerCase().includes(mentionQuery))
    .slice(0, 4)

  const insertMention = (nick: string) => {
    setInput((v) => v.replace(/@([\wА-ЯЁа-яё]*)$/, `@${nick} `))
    setMentionQuery(null)
    playClick()
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    if (text.length > 500) return onBanner('МНОГО БУКВ')
    playSend()
    onSend({ text })
    setInput('')
    setMentionQuery(null)
    requestAnimationFrame(() => scrollBottom(true))
  }

  const pickPhoto = (f: File | undefined) => {
    setAttachOpen(false)
    if (!f) return
    if (f.size > 5 * 1024 * 1024) return onBanner('ФОТКА СЛИШКОМ ЖИРНАЯ. СОЖМИ')
    const reader = new FileReader()
    reader.onload = () => {
      playSend()
      onSend({ media: { kind: 'photo', src: String(reader.result) } })
      requestAnimationFrame(() => scrollBottom(true))
    }
    reader.readAsDataURL(f)
  }

  const openPhotoPicker = () => filePhoto.current?.click()
  const openVideoPicker = () => fileVideo.current?.click()
  const sendCameraMock = () => {
    setAttachOpen(false)
    onSend({ media: { kind: 'photo' } })
  }
  const sendVoiceMock = () => {
    setAttachOpen(false)
    onSend({ media: { kind: 'voice', duration: `0:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}` } })
  }

  return (
    <div className="flex h-full flex-col">
      {/* шапка канала */}
      <header className="flex items-start justify-between gap-2 border-b-2 border-[#6b4a00] bg-[#1c0e00]/60 px-3 py-2">
        <div className="min-w-0">
          <h2 className="font-pixel glow-amber text-[10px] text-[#FFB000]">
            {channel.id}. {channel.name}
          </h2>
          <p className="font-pixel mt-1 truncate text-[6px] text-[#8a6f3f]">{channel.topic}</p>
        </div>
        <span className="font-pixel mt-0.5 shrink-0 text-[7px] text-[#33FF00]" aria-label={`онлайн: ${onlineCount}`}>
          ● {onlineCount}
        </span>
      </header>

      {/* лента */}
      <div className="relative min-h-0 flex-1">
        <div ref={listRef} onScroll={onScroll} className="pixel-scroll absolute inset-0 overflow-y-auto">
          {canLoadOlder && (
            <p className="font-pixel py-2 text-center text-[6px] text-[#5a4626]">▼ КРУТИ ВВЕРХ — ПОДГРУЗИМ СТАРОЕ ▼</p>
          )}
          {channel.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <div
                className="h-16 w-24 border-2 border-[#5a4626] bg-black/40"
                style={{ backgroundImage: 'repeating-conic-gradient(#3a2a10 0% 25%, #241800 0% 50%)', backgroundSize: '8px 8px', imageRendering: 'pixelated' }}
                aria-hidden="true"
              />
              <p className="font-pixel text-[8px] leading-relaxed text-[#8a6f3f]">{emptyChannelText}</p>
              <p className="font-pixel text-[6px] text-[#5a4626]">ЭЛТ-ШУМ ТИХИЙ · ГУЛ ФОНОВЫЙ</p>
            </div>
          ) : (
            <ul>
              {channel.messages.map((m) => (
                <FloodMessageRow
                  key={m.id}
                  m={m}
                  me={me}
                  users={users}
                  isBanned={bannedIds.includes(m.authorId)}
                  onOpenProfile={onOpenProfile}
                  onMsgMenu={onMsgMenu}
                  onReact={onReact}
                  onBanner={onBanner}
                />
              ))}
            </ul>
          )}
        </div>

        {/* плашка «новое сообщение» */}
        {newBelow > 0 && (
          <button
            onClick={() => scrollBottom(true)}
            className="font-pixel absolute bottom-3 left-1/2 z-20 -translate-x-1/2 border-2 border-[#FFB000] bg-[#0d0a06] px-3 py-2 text-[7px] text-[#FFB000]"
            style={{ boxShadow: '0 0 12px rgba(255,176,0,.35)' }}
          >
            ↓ НОВОЕ СООБЩЕНИЕ{newBelow > 1 ? ` ×${newBelow}` : ''}
          </button>
        )}

        {/* меню прикрепления */}
        {attachOpen && (
          <div className="absolute bottom-0 left-0 right-0 z-20 border-t-2 border-[#FFB000] bg-[#0d0a06] p-2" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => { playClick(); openPhotoPicker() }}
                className="font-pixel flex flex-col items-center gap-1 border-2 border-[#6b4a00] px-1 py-2 text-[6px] text-[#FFB000] hover:border-[#FFB000]"
              >
                <span className="emoji-px text-lg">📷</span>
                ФОТО
              </button>
              <button
                onClick={() => { playClick(); sendCameraMock() }}
                className="font-pixel flex flex-col items-center gap-1 border-2 border-[#6b4a00] px-1 py-2 text-[6px] text-[#FFB000] hover:border-[#FFB000]"
              >
                <span className="emoji-px text-lg">📸</span>
                КАМЕРА
              </button>
              <button
                onClick={() => { playClick(); openVideoPicker() }}
                className="font-pixel flex flex-col items-center gap-1 border-2 border-[#6b4a00] px-1 py-2 text-[6px] text-[#FFB000] hover:border-[#FFB000]"
              >
                <span className="emoji-px text-lg">📼</span>
                ВИДЕО
              </button>
              <button
                onClick={() => { playClick(); sendVoiceMock() }}
                className="font-pixel flex flex-col items-center gap-1 border-2 border-[#6b4a00] px-1 py-2 text-[6px] text-[#FFB000] hover:border-[#FFB000]"
              >
                <span className="emoji-px text-lg">🎙</span>
                ГОЛОС
              </button>
            </div>
          </div>
        )}
      </div>

      {/* поле ввода */}
      <div className="shrink-0 border-t-2 border-[#6b4a00] bg-[#1c0e00]/80 px-2 py-2">
        {/* контекст: ответ / правка */}
        {context && (
          <div className="mb-1.5 flex items-center gap-2 border-2 border-[#6b4a00] bg-black/40 px-2 py-1.5">
            <span className="font-pixel min-w-0 flex-1 truncate text-[7px] text-[#8a6f3f]">
              {context.kind === 'reply' ? `↩ ${context.nick}: ${context.text}` : `✎ ПРАВКА: ${context.text}`}
            </span>
            <button onClick={onCancelContext} className="font-pixel px-1 text-[8px] text-[#FFB000]" aria-label="Отменить">✕</button>
          </div>
        )}
        {/* кандидаты упоминаний */}
        {mentionCandidates.length > 0 && (
          <div className="mb-1.5 flex flex-col gap-0.5">
            {mentionCandidates.map((u) => (
              <button
                key={u.id}
                onClick={() => insertMention(u.nick)}
                className="font-pixel flex items-center gap-2 px-2 py-1.5 text-left text-[8px] text-[#FFB000] hover:bg-[#FFB000]/10"
              >
                <PixelAvatar seed={u.avatarSeed} size={16} />
                @{u.nick}
                <span className="ml-auto text-[6px] text-[#5a4626]">ВСТАВИТЬ</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { playClick(); setAttachOpen((v) => !v) }}
            className="shrink-0 border-2 border-[#6b4a00] p-2 text-[#FFB000] hover:border-[#FFB000]"
            aria-label="Прикрепить медиа"
          >
            <IconClip size={14} />
          </button>
          <input
            value={input}
            onChange={(e) => {
              const v = e.target.value.slice(0, 500)
              setInput(v)
              detectMention(v)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              } else if (e.key.length === 1 && input.length >= 500) {
                onBanner('МНОГО БУКВ')
              }
            }}
            className="font-pixel px-input min-w-0 flex-1 px-2 py-2.5 text-[9px]"
            placeholder={online ? 'Скажи что-нибудь...' : 'АНТЕННА ОТВАЛИЛАСЬ...'}
            maxLength={500}
            aria-label="Текст сообщения"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="font-pixel flex h-[38px] w-[38px] shrink-0 items-center justify-center border-2 border-[#FF4A4A] text-[#FF4A4A] hover:bg-[#FF4A4A] hover:text-black disabled:border-[#6b4a00] disabled:text-[#6b4a00] disabled:hover:bg-transparent"
            aria-label="Отправить (запись на кассету)"
            title="Отправить"
          >
            ●
          </button>
        </div>
        <div className="mt-1 flex justify-between px-0.5">
          <span className="font-pixel text-[5px] text-[#5a4626]">ENTER — ОТПРАВКА · @ — УПОМЯНУТЬ</span>
          <span className={`font-pixel text-[5px] ${input.length > 450 ? 'text-[#FF4A4A]' : 'text-[#3d3020]'}`}>{input.length}/500</span>
        </div>
      </div>

      {/* скрытые инпуты файлов */}
      <input ref={filePhoto} type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(e.target.files?.[0])} />
      <input
        ref={fileVideo}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          setAttachOpen(false)
          const f = e.target.files?.[0]
          if (f && f.size > 30 * 1024 * 1024) return onBanner('ВИДЕО СЛИШКОМ ДЛИННОЕ. ОБРЕЖЬ')
          playSend()
          onSend({ media: { kind: 'video', duration: `0:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, '0')}` } })
          requestAnimationFrame(() => scrollBottom(true))
        }}
      />
    </div>
  )
}
