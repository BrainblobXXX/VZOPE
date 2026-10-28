'use client'

import { useEffect, useRef, useState } from 'react'
import {
  REACTIONS,
  fmtTape,
  fmtTime,
  ME_ID,
  shopItems,
  type Cassette,
  type Message,
  type ReactionEmoji,
  type User,
} from '@/lib/tv/data'
import { playClick, playSend } from '@/lib/tv/sounds'
import { IconCassette, IconClip } from '../ui'
import { MediaBlock, ReactionPill, renderText } from './ChannelScreen'

export default function PrivateChatScreen({
  cassette,
  me,
  companion,
  online,
  locked = false,
  stickerCounts,
  value: input,
  onValueChange: setInput,
  context,
  onCancelContext,
  onSend,
  onReact,
  onMsgMenu,
  onBanner,
  onCassetteMenu,
  onUseSticker,
  onGift,
}: {
  cassette: Cassette
  me: User
  companion: User
  online: boolean
  locked?: boolean
  stickerCounts: Record<string, number>
  value: string
  onValueChange: (v: string) => void
  context: { kind: 'reply'; nick: string; text: string } | { kind: 'edit'; text: string } | null
  onCancelContext: () => void
  onSend: (payload: { text?: string; media?: Message['media']; sticker?: string }) => void
  onReact: (msgId: string, emoji: ReactionEmoji) => void
  onMsgMenu: (msgId: string) => void
  onBanner: (text: string) => void
  onCassetteMenu: () => void
  onUseSticker: (itemId: string) => void
  onGift: () => void
}) {
  const [panel, setPanel] = useState<'none' | 'stickers' | 'attach'>('none')
  const [tapeLabel, setTapeLabel] = useState(() => fmtTape(cassette.createdAt))
  const listRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(true)
  const prevCount = useRef(cassette.messages.length)

  const meShort = me.nick.slice(0, 8)
  const friendShort = companion.nick.slice(0, 8)

  const scrollBottom = (smooth = false) => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    nearBottomRef.current = true
  }

  useEffect(() => {
    scrollBottom()
  }, [])

  useEffect(() => {
    if (cassette.messages.length === prevCount.current) return
    prevCount.current = cassette.messages.length
    if (nearBottomRef.current) requestAnimationFrame(() => scrollBottom(true))
     
  }, [cassette.messages.length])

  // счётчик ленты обновляется при каждом сообщении и по таймеру
  useEffect(() => {
    const t = setInterval(() => setTapeLabel(fmtTape(cassette.createdAt)), 30_000)
    return () => clearInterval(t)
  }, [cassette.createdAt])

  const onScroll = () => {
    const el = listRef.current
    if (!el) return
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90
  }

  const send = () => {
    if (locked) return
    const text = input.trim()
    if (!text) return
    if (text.length > 500) return onBanner('МНОГО БУКВ')
    playSend()
    onSend({ text })
    setInput('')
    requestAnimationFrame(() => scrollBottom(true))
  }

  const ownedStickers = shopItems.filter((i) => i.category === 'stickers' && (stickerCounts[i.id] ?? 0) > 0)

  const sendSticker = (itemId: string, icon: string) => {
    playClick()
    onUseSticker(itemId)
    onSend({ sticker: icon })
    setPanel('none')
    requestAnimationFrame(() => scrollBottom(true))
  }

  return (
    <div className="flex h-full flex-col bg-[#1c1206]/40">
      {/* шапка: REC + счётчик ленты */}
      <header className="flex items-center justify-between border-b border-[#6b4a00] bg-black/40 px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span className="px-blink-fast inline-block h-2 w-2 rounded-full bg-[#FF4A4A]" style={{ boxShadow: '0 0 6px #FF4A4A' }} />
          <span className="font-pixel glow-red text-[9px] text-[#FF4A4A]">REC</span>
        </span>
        <span className="font-pixel text-[7px] text-[#FFB000]">{tapeLabel}</span>
      </header>

      {/* лента плёнки */}
      <div className="relative min-h-0 flex-1">
        <div ref={listRef} onScroll={onScroll} className="pixel-scroll absolute inset-0 overflow-y-auto">
          <div className="perf h-3 w-full opacity-50" aria-hidden="true" />
          <ul className="flex flex-col gap-2 px-2 py-1">
            {cassette.messages.map((m, idx) => {
              const mine = m.authorId === ME_ID
              const prev = cassette.messages[idx - 1]
              const showAuthor = !prev || prev.authorId !== m.authorId
              return (
                <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`film-frame relative max-w-[85%] px-2.5 py-1.5 ${mine ? 'mine' : 'theirs'}`}>
                    {/* перфорация по бокам кадра */}
                    <span className={`perf absolute inset-y-0 ${mine ? 'right-0' : 'left-0'} w-1.5 opacity-60`} aria-hidden="true" />
                    <div className={mine ? 'pr-2' : 'pl-2'}>
                      {showAuthor && (
                        <p className={`font-pixel mb-0.5 text-[6px] ${mine ? 'text-[#FFB000]/70' : 'text-[#33FF00]/70'}`}>
                          {mine ? meShort : friendShort}
                        </p>
                      )}
                      {m.replyTo && (
                        <p className="mb-1 truncate border-l-2 border-[#5a4626] pl-2 text-[7px] text-[#8a6f3f]">
                          ↩ {m.replyTo.authorNick}: {m.replyTo.text}
                        </p>
                      )}
                      {m.sticker ? (
                        <div className="emoji-px py-1 text-4xl leading-none">{m.sticker}</div>
                      ) : (
                        <>
                          {m.text && <p className="break-words text-[9px] leading-[1.9] text-[#e8d9b0]">{renderText(m.text)}</p>}
                          {m.media && <MediaBlock m={m.media} onBanner={onBanner} />}
                        </>
                      )}
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="font-pixel text-[6px] text-[#6b5a36]">
                          {fmtTime(m.time)}
                          {m.edited ? ' · ИЗМ' : ''}
                          {m.status === 'queued' ? ' · ⏳' : ''}
                        </span>
                        <div className="flex gap-1">
                          {m.reactions.map((r) => (
                            <ReactionPill key={r.emoji} emoji={r.emoji} count={r.count} byMe={r.byMe} onClick={() => onReact(m.id, r.emoji)} />
                          ))}
                          {!m.reactions.length && (
                            <button
                              onClick={() => onMsgMenu(m.id)}
                              className="font-pixel border border-dashed border-[#3d3020] px-1 text-[6px] text-[#5a4626] hover:border-[#FFB000] hover:text-[#FFB000]"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="perf h-3 w-full opacity-50" aria-hidden="true" />
        </div>
      </div>

      {/* трекинг-шум */}
      <div className="tracking-noise h-2.5 w-full shrink-0 opacity-70" aria-hidden="true" />

      {/* панель стикеров / меню вложений */}
      {panel === 'stickers' && (
        <div className="shrink-0 border-t-2 border-[#FFB000] bg-[#0d0a06] p-2">
          {ownedStickers.length === 0 ? (
            <div className="flex items-center justify-between gap-2 px-1 py-2">
              <p className="font-pixel text-[7px] leading-relaxed text-[#8a6f3f]">КАРМАНЫ ПУСТЫ. ИДИ ЛОВИ ЛАЙКИ</p>
              <button onClick={() => { playClick(); setPanel('none'); onGift() }} className="font-pixel border-2 border-[#FFB000] px-2 py-1.5 text-[7px] text-[#FFB000]">
                В МАГАЗИН
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-1.5">
              {ownedStickers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => sendSticker(s.id, s.icon)}
                  className="relative flex h-14 items-center justify-center border-2 border-[#6b4a00] bg-black/40 hover:border-[#FFB000]"
                  aria-label={`Стикер ${s.name}, осталось ${stickerCounts[s.id]}`}
                >
                  <span className="emoji-px text-2xl">{s.icon}</span>
                  <span className="font-pixel absolute right-0.5 top-0.5 text-[6px] text-[#8a6f3f]">{stickerCounts[s.id]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {panel === 'attach' && (
        <div className="shrink-0 border-t-2 border-[#FFB000] bg-[#0d0a06] p-2">
          <div className="grid grid-cols-3 gap-1.5">
            {([
              ['📷', 'ФОТО', () => { setPanel('none'); onSend({ media: { kind: 'photo' } }) }],
              ['🎞', 'СТИКЕР', () => { setPanel('stickers') }],
              ['🎁', 'ПОДАРОК', () => { setPanel('none'); onGift() }],
            ] as const).map(([icon, label, fn]) => (
              <button
                key={label}
                onClick={() => { playClick(); fn() }}
                className="font-pixel flex flex-col items-center gap-1 border-2 border-[#6b4a00] px-1 py-2.5 text-[6px] text-[#FFB000] hover:border-[#FFB000]"
              >
                <span className="emoji-px text-lg">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ввод + кассета */}
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
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <span className="font-pixel text-[6px] text-[#5a4626]">ПРИВАТНАЯ ПЛЁНКА · БЕЗ СЛЕЖКИ</span>
          <span className="font-pixel text-[5px] text-[#3d3020]">ENTER — ОТПРАВКА</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onCassetteMenu}
            className="flex shrink-0 flex-col items-center gap-0.5 border-2 border-[#6b4a00] px-2 py-1 hover:border-[#FFB000]"
            aria-label="Кассета: меню удаления"
          >
            <IconCassette size={22} color="#FFB000" />
            <span className="font-pixel text-[5px] text-[#8a6f3f]">{meShort}×{friendShort}</span>
          </button>
          <button
            onClick={() => { playClick(); setPanel(panel === 'stickers' ? 'none' : 'stickers') }}
            disabled={locked}
            className={`shrink-0 border-2 p-2 ${panel === 'stickers' ? 'border-[#FFB000] text-[#FFB000]' : 'border-[#6b4a00] text-[#FFB000]'} disabled:opacity-40`}
            aria-label="Стикеры"
          >
            <span className="emoji-px text-sm">🎞</span>
          </button>
          <button
            onClick={() => { playClick(); setPanel(panel === 'attach' ? 'none' : 'attach') }}
            disabled={locked}
            className={`shrink-0 border-2 p-2 ${panel === 'attach' ? 'border-[#FFB000]' : 'border-[#6b4a00]'} text-[#FFB000] disabled:opacity-40`}
            aria-label="Меню вложений"
          >
            <IconClip size={14} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 500))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              } else if (e.key.length === 1 && input.length >= 500) {
                onBanner('МНОГО БУКВ')
              }
            }}
            className="font-pixel px-input min-w-0 flex-1 px-2 py-2.5 text-[9px]"
            placeholder={locked ? 'КАССЕТА ЗАЖЕВАНА...' : online ? 'Шепни на плёнку...' : 'АНТЕННА ОТВАЛИЛАСЬ...'}
            maxLength={500}
            disabled={locked}
            aria-label="Сообщение в личный чат"
          />
          <button
            onClick={send}
            disabled={!input.trim() || locked}
            className="font-pixel flex h-[38px] w-[38px] shrink-0 items-center justify-center border-2 border-[#FF4A4A] text-[#FF4A4A] hover:bg-[#FF4A4A] hover:text-black disabled:border-[#6b4a00] disabled:text-[#6b4a00] disabled:hover:bg-transparent"
            aria-label="Отправить на плёнку"
          >
            ●
          </button>
        </div>
      </div>
    </div>
  )
}
