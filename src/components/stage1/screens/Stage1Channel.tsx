'use client'

import { useEffect, useRef, useState } from 'react'
import PhotoAvatar from '../PhotoAvatar'
import { LIVE_INCOMING, LIVE_MESSAGES, REPLY_ACKS, VIEWERS } from '../data'

interface LiveMsg {
  id: string
  userId: string
  nick: string
  seed: string
  text: string
  time: string
  likes: number
  mine?: boolean
  /** цитата: ответ на конкретный кадр эфира */
  replyTo?: { id: string; nick: string; text: string }
}

const ONLINE_MIN = 4
const ONLINE_MAX = 8
const POST_MAX = 300
const QUOTE_MAX = 46

function toLive(m: (typeof LIVE_MESSAGES)[number]): LiveMsg {
  return { ...m, likes: 2 }
}

export default function Stage1Channel({ avatars, online }: { avatars: Record<string, string>; online: boolean }) {
  const [msgs, setMsgs] = useState<LiveMsg[]>(() => [...LIVE_MESSAGES.map(toLive)])
  const [onlineCount, setOnlineCount] = useState(5)
  const [atBottom, setAtBottom] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; nick: string; text: string } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const idxRef = useRef(0)
  const ackTimersRef = useRef<number[]>([])

  // живой эфир: новые кадры каждые 9–16с + гуляющий онлайн + случайные лайки
  useEffect(() => {
    const feed = window.setInterval(() => {
      const src = LIVE_INCOMING[idxRef.current % LIVE_INCOMING.length]
      idxRef.current += 1
      const user = VIEWERS.find((u) => u.id === src.userId)
      if (!user) return
      setMsgs((prev) => [
        ...prev,
        {
          id: `live-${Date.now()}`,
          userId: user.id,
          nick: user.nick,
          seed: user.seed,
          text: src.text,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          likes: 0,
        },
      ])
    }, 11000)

    const presence = window.setInterval(() => {
      setOnlineCount((prev) => {
        const next = prev + (Math.random() > 0.5 ? 1 : -1)
        return Math.min(ONLINE_MAX, Math.max(ONLINE_MIN, next))
      })
    }, 7000)

    const likes = window.setInterval(() => {
      setMsgs((prev) => {
        if (prev.length === 0) return prev
        const i = Math.floor(Math.random() * prev.length)
        const next = [...prev]
        next[i] = { ...next[i], likes: next[i].likes + 1 }
        return next
      })
    }, 5200)

    return () => {
      window.clearInterval(feed)
      window.clearInterval(presence)
      window.clearInterval(likes)
      ackTimersRef.current.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  // автоскролл вниз, если зритель у нижнего края
  useEffect(() => {
    const el = listRef.current
    if (el && atBottom) el.scrollTop = el.scrollHeight
  }, [msgs, atBottom, replyTo])

  const onScroll = () => {
    const el = listRef.current
    if (!el) return
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setAtBottom(bottom)
  }

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      const was = next.has(id)
      if (was) next.delete(id)
      else next.add(id)
      setMsgs((ms) => ms.map((m) => (m.id === id ? { ...m, likes: m.likes + (was ? -1 : 1) } : m)))
      return next
    })
  }

  // переход к оригинальному кадру по цитате + янтарная вспышка
  const jumpTo = (id: string) => {
    const el = document.getElementById(`ch1-${id}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.remove('px-flash')
    void el.offsetWidth
    el.classList.add('px-flash')
    const t = window.setTimeout(() => el.classList.remove('px-flash'), 1000)
    ackTimersRef.current.push(t)
  }

  const post = (e: React.FormEvent) => {
    e.preventDefault()
    const value = draft.trim()
    if (!value || !online) return
    const id = `mine-${Date.now()}`
    setMsgs((prev) => [
      ...prev,
      {
        id,
        userId: 'me',
        nick: 'ТЕЛЕПУЗИК',
        seed: 'telepuzik',
        text: value.slice(0, POST_MAX),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        likes: 0,
        mine: true,
        replyTo: replyTo ? { ...replyTo } : undefined,
      },
    ])
    setDraft('')
    setReplyTo(null)
    setAtBottom(true)
    // кто-то из эфира может отреагировать на свежий кадр
    if (Math.random() < 0.45) {
      const onlineUsers = VIEWERS.filter((u) => u.online)
      const who = onlineUsers[Math.floor(Math.random() * onlineUsers.length)]
      if (who) {
        const t = window.setTimeout(() => {
          setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m)))
        }, 2600 + Math.floor(Math.random() * 4400))
        ackTimersRef.current.push(t)
      }
    }
    // а иногда — личный @ответ на мой кадр
    if (Math.random() < 0.4) {
      const onlineUsers = VIEWERS.filter((u) => u.online && u.id !== replyTo?.id)
      const who = onlineUsers[Math.floor(Math.random() * onlineUsers.length)]
      if (who) {
        const t = window.setTimeout(() => {
          setMsgs((prev) => [
            ...prev,
            {
              id: `ack-${Date.now()}`,
              userId: who.id,
              nick: who.nick,
              seed: who.seed,
              text: REPLY_ACKS[Math.floor(Math.random() * REPLY_ACKS.length)],
              time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
              likes: 0,
              replyTo: { id, nick: 'ТЕЛЕПУЗИК', text: value.slice(0, QUOTE_MAX) },
            },
          ])
        }, 3200 + Math.floor(Math.random() * 5200))
        ackTimersRef.current.push(t)
      }
    }
  }

  const quoteOf = (m: LiveMsg) => (m.replyTo ? `↳ ${m.replyTo.nick}: ${m.replyTo.text}` : '')

  return (
    <div className="relative flex h-full flex-col">
      <header className="border-b-2 border-[#6b4a00] bg-[#1c0e00]/60 px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-[11px] text-[#FFB000]">CH 1 · ФЛУДИЛКА</h2>
          <span className="font-pixel text-[7px] text-[#33FF00]">● {onlineCount}/{VIEWERS.length + 1}</span>
        </div>
        <p className="font-pixel mt-1 text-[6px] text-[#8a6f3f]">
          ГЛАВНЫЙ КАНАЛ. ТУТ БОЛТАЕМ ОБО ВСЁМ. {online ? '' : '· СИГНАЛ ПОТЕРЯН'}
        </p>
      </header>

      <div ref={listRef} onScroll={onScroll} className="pixel-scroll min-h-0 flex-1 overflow-y-auto">
        {msgs.map((m) => {
          const liked = likedIds.has(m.id)
          return (
            <div key={m.id} id={`ch1-${m.id}`} className="border-b border-[#3d2a10] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="shrink-0" aria-hidden="true">
                  <PhotoAvatar src={avatars[m.userId]} seed={m.seed} size={26} alt={m.nick} />
                </span>
                <span className={`font-pixel text-[7px] ${m.mine ? 'text-[#FFB000]' : 'text-[#33FF00]'}`}>
                  {m.mine ? '*' : '>'} {m.nick}
                  {m.mine && <span className="text-[#8a6f3f]"> (ЭТО ВЫ)</span>}
                </span>
                <span className="font-pixel ml-auto text-[5px] text-[#5a4626]">{m.time}</span>
              </div>

              {m.replyTo && (
                <button
                  type="button"
                  onClick={() => {
                    const rt = m.replyTo
                    if (rt) jumpTo(rt.id)
                  }}
                  className="font-pixel mt-1.5 ml-8 block max-w-full truncate border-l-2 border-[#5a3a00] pl-1.5 text-left text-[5px] text-[#8a6f3f] transition-colors hover:border-[#FFB000] hover:text-[#FFB000]"
                  title="Перейти к оригинальному кадру"
                  aria-label={`Цитата: ${quoteOf(m)}. Нажать, чтобы перейти к кадру`}
                >
                  {quoteOf(m)}
                </button>
              )}

              <p className={`font-pixel mt-1.5 pl-8 text-[8px] leading-relaxed ${m.mine ? 'text-[#FFB000]' : 'text-[#e8d9b0]'}`}>{m.text}</p>
              <div className="mt-1 flex gap-1 pl-8">
                <button
                  onClick={() => toggleLike(m.id)}
                  aria-pressed={liked}
                  aria-label={liked ? 'Убрать лайк' : 'Лайкнуть кадр'}
                  className={`font-pixel border px-1.5 py-0.5 text-[6px] transition-colors ${
                    liked
                      ? 'border-[#FFB000] bg-[#FFB000]/15 text-[#FFB000]'
                      : 'border-[#5a3a00] text-[#8a6f3f] hover:border-[#FFB000] hover:text-[#FFB000]'
                  }`}
                >
                  👍 {m.likes}{liked ? ' ✓' : ''}
                </button>
                <button
                  onClick={() => {
                    setReplyTo({ id: m.id, nick: m.nick, text: m.text.slice(0, QUOTE_MAX) })
                    setAtBottom(true)
                  }}
                  aria-label={`Ответить на кадр ${m.nick}`}
                  className={`font-pixel border px-1.5 py-0.5 text-[6px] transition-colors ${
                    replyTo?.id === m.id
                      ? 'border-[#33FF00] bg-[#33FF00]/15 text-[#33FF00]'
                      : 'border-[#5a3a00] text-[#8a6f3f] hover:border-[#33FF00] hover:text-[#33FF00]'
                  }`}
                >
                  ↩ ОТВЕТИТЬ
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {!atBottom && (
        <button
          onClick={() => {
            const el = listRef.current
            if (el) el.scrollTop = el.scrollHeight
            setAtBottom(true)
          }}
          className="px-blink font-pixel absolute bottom-[86px] left-1/2 -translate-x-1/2 border border-[#FFB000] bg-[#1c0e00] px-2 py-1 text-[6px] text-[#FFB000]"
          aria-label="Прокрутить к новым кадрам"
        >
          ↓ НОВЫЕ КАДРЫ
        </button>
      )}

      <form onSubmit={post} className="border-t-2 border-[#6b4a00] bg-[#140c04] p-2">
        {replyTo && (
          <div className="mb-1.5 flex items-center gap-1.5 border-l-2 border-[#33FF00] bg-[#33FF00]/5 px-1.5 py-1">
            <span className="font-pixel min-w-0 flex-1 truncate text-[5px] text-[#33FF00]">
              ↩ ОТВЕТ {replyTo.nick}: {replyTo.text}
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="font-pixel shrink-0 border border-[#5a3a00] px-1 text-[6px] text-[#8a6f3f] hover:border-[#FF4A4A] hover:text-[#FF4A4A]"
              aria-label="Отменить ответ"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={POST_MAX}
            disabled={!online}
            placeholder={online ? (replyTo ? `ОТВЕТ ${replyTo.nick}...` : 'СКАЖИ СВОЁ В ЭФИР...') : 'НЕТ СИГНАЛА. КАДР НЕ УЙДЁТ.'}
            className="font-pixel min-w-0 flex-1 border-2 border-[#5a3a00] bg-[#0d0a06] px-2 py-2 text-[7px] text-[#e8d9b0] placeholder:text-[#5a4626] focus:border-[#FFB000] focus:outline-none disabled:opacity-60"
            aria-label="Сообщение в эфир"
          />
          <button
            type="submit"
            disabled={!draft.trim() || !online}
            className="font-pixel flex shrink-0 items-center gap-1 border-2 border-[#FF4A4A] bg-[#FF4A4A]/15 px-2.5 py-2 text-[7px] text-[#FF4A4A] transition-colors hover:bg-[#FF4A4A] hover:text-[#140c04] disabled:cursor-not-allowed disabled:border-[#5a3a00] disabled:bg-transparent disabled:text-[#5a4626]"
            aria-label="В эфир"
          >
            <span className={`inline-block h-[6px] w-[6px] rounded-full ${online && draft.trim() ? 'bg-[#FF4A4A] led' : 'bg-[#5a4626]'}`} aria-hidden="true" />
            В ЭФИР
          </button>
        </div>
        <p className="font-pixel mt-1 text-center text-[5px] text-[#3d3020]">
          {online ? 'КАДР УХОДИТ В ЭФИР. ЭФИР ВИДИТ ВСЁ.' : 'ANT ВЫКЛ. КАДРЫ НЕ УХОДЯТ.'}
        </p>
      </form>
    </div>
  )
}
