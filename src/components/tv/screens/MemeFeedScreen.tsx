'use client'

import { useEffect, useRef, useState } from 'react'
import type { Meme, MemeVerdict, User } from '@/lib/tv/data'
import * as snd from '@/lib/tv/sounds'
import PixelAvatar from '../PixelAvatar'
import SnowOverlay from '../SnowOverlay'

export interface MatchPopup {
  userId: string
  memeIds: string[]
}

// ── Телетекст-окно («помехи по краям», раздел 4.3 п.3 диз-дока v2.0) ──

function Teletext({
  title,
  border = '#33FF00',
  children,
}: {
  title: string
  border?: string
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 z-[45] flex items-center justify-center bg-black/85 p-3" role="dialog" aria-modal="true" aria-label={title}>
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <SnowOverlay active />
      </div>
      <div
        className="relative w-full max-w-[320px] border-2 bg-black px-3 py-3"
        style={{ borderColor: border, boxShadow: `0 0 18px ${border}66` }}
      >
        <p className="font-pixel glow-green mb-2 text-center text-[7px] leading-relaxed text-[#33FF00]">▓▒░ {title} ░▒▓</p>
        {children}
        <p className="font-pixel mt-2 text-center text-[6px] text-[#1c5a10]" aria-hidden="true">
          ▒▓░ 100 200 300 ░▓▒
        </p>
      </div>
    </div>
  )
}

// ── карточка мема (свайп-карта) ──────────────────────────────

function MemeCard({
  meme,
  frame,
  dx = 0,
  dy = 0,
  exiting,
  behind = false,
}: {
  meme: Meme
  frame: number
  dx?: number
  dy?: number
  exiting?: boolean
  behind?: boolean
}) {
  const rot = exiting ? (dx >= 0 ? 14 : -14) : dx / 16
  const likeOp = Math.min(1, Math.max(0, dx / 80))
  const disOp = Math.min(1, Math.max(0, -dx / 80))
  return (
    <div
      className={`absolute inset-x-3 top-1 bottom-[64px] select-none sm:inset-x-5 ${behind ? 'scale-[0.97] opacity-40' : ''}`}
      style={
        behind
          ? undefined
          : {
              transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
              transition: exiting ? 'transform 0.24s steps(6), opacity 0.24s steps(6)' : 'none',
              opacity: exiting ? 0 : 1,
            }
      }
      aria-hidden={behind}
    >
      <div className="film-frame relative flex h-full flex-col overflow-hidden border-2 border-[#6b4a00] bg-black">
        <img
          src={meme.img}
          alt={meme.caption}
          draggable={false}
          className="min-h-0 w-full flex-1 object-cover"
          style={{ imageRendering: 'pixelated', filter: 'contrast(1.06) saturate(0.92)' }}
        />
        {/* шапка кадра */}
        <span className="font-pixel absolute left-1.5 top-1.5 border border-[#6b4a00] bg-black/75 px-1.5 py-[3px] text-[5px] text-[#FFB000]">
          МЭМ-ЭФИР · КАДР {frame}
        </span>
        {/* штампы вердикта */}
        <span
          className="font-pixel pointer-events-none absolute left-2 top-8 border-2 border-[#33FF00] bg-black/70 px-1.5 py-1 text-[8px] text-[#33FF00]"
          style={{ opacity: likeOp }}
          aria-hidden="true"
        >
          ▲ ЛАЙК
        </span>
        <span
          className="font-pixel pointer-events-none absolute right-2 top-8 border-2 border-[#FF4A4A] bg-black/70 px-1.5 py-1 text-[8px] text-[#FF4A4A]"
          style={{ opacity: disOp }}
          aria-hidden="true"
        >
          ▼ ДИЗЛАЙК
        </span>
        {/* подпись — VHS-субтитр */}
        <div className="shrink-0 border-t-2 border-[#6b4a00] bg-black px-2 py-2">
          <p className="font-pixel text-center text-[7px] leading-[1.7] text-[#e8d9b0]">{meme.caption}</p>
        </div>
      </div>
    </div>
  )
}

// ── Экран 1: МЭМ-ЭФИР (диз-док v2.0, раздел 4.3) ─────────────

export default function MemeFeedScreen({
  me,
  users,
  feed,
  swipeCount,
  matchHint,
  matchPopup,
  incoming,
  onSwipe,
  onSendRequest,
  onSkipMatch,
  onAcceptIncoming,
  onDeclineIncoming,
  onOpenProfile,
}: {
  me: User
  users: User[]
  feed: Meme[]
  swipeCount: number
  matchHint: 'scan' | 'close'
  matchPopup: MatchPopup | null
  incoming: MatchPopup | null
  onSwipe: (memeId: string, verdict: MemeVerdict) => void
  onSendRequest: (userId: string) => void
  onSkipMatch: () => void
  onAcceptIncoming: () => void
  onDeclineIncoming: () => void
  onOpenProfile: (userId: string) => void
}) {
  const [idx, setIdx] = useState(() => Math.min(swipeCount, feed.length - 2))
  const [drag, setDrag] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const [exit, setExit] = useState<'left' | 'right' | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const busyRef = useRef(false)
  const idxRef = useRef(idx)
  useEffect(() => {
    idxRef.current = idx
  }, [idx])

  const current = feed[idx % feed.length]
  const next = feed[(idx + 1) % feed.length]
  const matchUser = users.find((u) => u.id === matchPopup?.userId) ?? null
  const incomingUser = users.find((u) => u.id === incoming?.userId) ?? null

  const commitRef = useRef<(v: MemeVerdict) => void>(() => {})
  const commit = (verdict: MemeVerdict) => {
    if (busyRef.current || exit) return
    const meme = feed[idxRef.current % feed.length]
    if (!meme) return
    busyRef.current = true
    const dir = verdict === 'like' ? 'right' : 'left'
    snd.playSwipe(dir)
    setExit(dir)
    setTimeout(() => {
      onSwipe(meme.id, verdict)
      setExit(null)
      setDrag({ dx: 0, dy: 0 })
      setIdx((i) => (i + 1 >= feed.length ? 0 : i + 1))
      busyRef.current = false
    }, 240)
  }
  useEffect(() => {
    commitRef.current = commit
  })

  // клавиатура (desktop): ← дизлайк, → лайк
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (matchPopup || incoming) return
      if (e.key === 'ArrowRight') commitRef.current('like')
      else if (e.key === 'ArrowLeft') commitRef.current('dislike')
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [matchPopup, incoming])

  return (
    <div className="relative flex h-full flex-col">
      {/* шапка */}
      <header className="flex shrink-0 items-center justify-between border-b-2 border-[#6b4a00] bg-[#1c0e00]/60 px-3 py-2">
        <h2 className="font-pixel glow-amber text-[11px] text-[#FFB000]">МЭМ-ЭФИР</h2>
        <span className="font-pixel text-[7px] text-[#8a6f3f]" aria-label="свайпано">
          СВАЙПАНО: {swipeCount}
        </span>
      </header>

      {/* строка мэтчинга */}
      <p className="font-pixel shrink-0 border-b border-[#3d2a10] bg-black/40 px-3 py-1.5 text-center text-[6px] leading-relaxed text-[#33FF00]">
        {matchHint === 'close' ? (
          <span className="px-blink">СИГНАЛ РОДСТВЕННОЙ ДУШИ... ДОПРОВЕРЯЮ ВКУСЫ</span>
        ) : (
          <span className="px-blink">МАТЧИНГ ФОНА: СРАВНИВАЮ ТВОИ РЕАКЦИИ С ЭФИРОМ</span>
        )}
      </p>

      {/* лента (стопка карт) */}
      <div className="relative min-h-0 flex-1">
        {next && <MemeCard meme={next} frame={idx + 2} behind />}
        {current && (
          <div
            className="absolute inset-0 touch-none"
            onPointerDown={(e) => {
              if (matchPopup || incoming) return
              startRef.current = { x: e.clientX, y: e.clientY }
              try {
                e.currentTarget.setPointerCapture(e.pointerId)
              } catch {
                /* указатель не каптурится — не страшно */
              }
            }}
            onPointerMove={(e) => {
              if (!startRef.current || matchPopup || incoming) return
              setDrag({ dx: e.clientX - startRef.current.x, dy: e.clientY - startRef.current.y })
            }}
            onPointerUp={() => {
              if (!startRef.current) return
              const { dx } = drag
              startRef.current = null
              if (dx > 90) commit('like')
              else if (dx < -90) commit('dislike')
              else setDrag({ dx: 0, dy: 0 })
            }}
            onPointerCancel={() => {
              startRef.current = null
              setDrag({ dx: 0, dy: 0 })
            }}
          >
            <MemeCard meme={current} frame={idx + 1} dx={drag.dx} dy={drag.dy} exiting={!!exit} />
          </div>
        )}
      </div>

      {/* кнопки вердикта */}
      <div className="flex shrink-0 items-stretch justify-center gap-2 px-3 pb-2 pt-1.5">
        <button
          onClick={() => commit('dislike')}
          disabled={!!matchPopup || !!incoming}
          className="font-pixel min-h-[44px] flex-1 border-2 border-[#FF4A4A] bg-[#1a0f05] text-[8px] text-[#FF4A4A] hover:bg-[#FF4A4A] hover:text-[#1a0f05] active:translate-y-[1px] disabled:opacity-40"
          aria-label="Дизлайк (свайп влево)"
        >
          ▼ ДИЗЛАЙК
        </button>
        <button
          onClick={() => commit('like')}
          disabled={!!matchPopup || !!incoming}
          className="font-pixel min-h-[44px] flex-1 border-2 border-[#33FF00] bg-[#1a0f05] text-[8px] text-[#33FF00] hover:bg-[#33FF00] hover:text-[#1a0f05] active:translate-y-[1px] disabled:opacity-40"
          aria-label="Лайк (свайп вправо)"
        >
          ▲ ЛАЙК
        </button>
      </div>

      <p className="font-pixel shrink-0 pb-1.5 text-center text-[5px] text-[#5a4626]">
        СВАЙП ПО МЕМАМ — ЗАЯВКА НА РОДСТВЕННУЮ ДУШУ. ЭФИР НЕ ЗАКРЫВАЕТСЯ.
      </p>

      {/* всплывающее окно мэтча (поверх текущего мема) */}
      {matchPopup && matchUser && (
        <Teletext title="ТЕЛЕТЕКСТ · ВНИМАНИЕ">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                snd.playClick()
                onOpenProfile(matchUser.id)
              }}
              className="flex flex-col items-center gap-1.5"
              aria-label={`Профиль ${matchUser.nick}`}
            >
              <PixelAvatar seed={matchUser.avatarSeed} size={44} />
              <span className="font-pixel text-[9px] text-[#FFB000]">{matchUser.nick}</span>
            </button>
            <p className="font-pixel text-center text-[8px] leading-[1.8] text-[#33FF00]">
              СОВПАДЕНИЕ ВКУСОВ! ВЫ ОБА УГОРЕЛИ С ОДНИХ И ТЕХ ЖЕ МЕМОВ.
            </p>
            <div className="flex justify-center gap-1.5">
              {matchPopup.memeIds.slice(0, 3).map((id) => {
                const m = feed.find((x) => x.id === id)
                if (!m) return null
                return (
                  <img
                    key={id}
                    src={m.img}
                    alt={`Общий мем: ${m.caption}`}
                    className="h-12 w-12 border border-[#33FF00]/60 object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )
              })}
            </div>
            <div className="mt-1 flex w-full flex-col gap-1.5">
              <button
                onClick={() => onSendRequest(matchUser.id)}
                className="font-pixel min-h-[40px] w-full border-2 border-[#33FF00] bg-black text-[8px] text-[#33FF00] hover:bg-[#33FF00] hover:text-black active:translate-y-[1px]"
              >
                ▶ ОТПРАВИТЬ ЗАЯВКУ
              </button>
              <button
                onClick={onSkipMatch}
                className="font-pixel min-h-[40px] w-full border-2 border-[#7a5a00] bg-black text-[7px] text-[#8a6f3f] hover:border-[#FFB000] hover:text-[#FFB000] active:translate-y-[1px]"
              >
                ПРОПУСТИТЬ
              </button>
            </div>
          </div>
        </Teletext>
      )}

      {/* входящая заявка на общение (п.4) */}
      {incoming && incomingUser && (
        <Teletext title="ТЕЛЕТЕКСТ · ЗАЯВКА" border="#FFB000">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                snd.playClick()
                onOpenProfile(incomingUser.id)
              }}
              className="flex flex-col items-center gap-1.5"
              aria-label={`Профиль ${incomingUser.nick}`}
            >
              <PixelAvatar seed={incomingUser.avatarSeed} size={44} />
              <span className="font-pixel text-[9px] text-[#FFB000]">{incomingUser.nick}</span>
            </button>
            <p className="font-pixel text-center text-[8px] leading-[1.8] text-[#FFB000]">
              ХОЧЕТ ПО-ОБЩАТЬСЯ. ВЫ СОВПАЛИ ПО МЕМАМ.
            </p>
            <div className="flex justify-center gap-1.5">
              {incoming.memeIds.slice(0, 3).map((id) => {
                const m = feed.find((x) => x.id === id)
                if (!m) return null
                return (
                  <img
                    key={id}
                    src={m.img}
                    alt={`Общий мем: ${m.caption}`}
                    className="h-12 w-12 border border-[#FFB000]/60 object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )
              })}
            </div>
            <div className="mt-1 flex w-full gap-2">
              <button
                onClick={onAcceptIncoming}
                className="font-pixel min-h-[40px] flex-1 border-2 border-[#33FF00] bg-black text-[8px] text-[#33FF00] hover:bg-[#33FF00] hover:text-black active:translate-y-[1px]"
              >
                ПРИНЯТЬ
              </button>
              <button
                onClick={onDeclineIncoming}
                className="font-pixel min-h-[40px] flex-1 border-2 border-[#FF4A4A] bg-black text-[8px] text-[#FF4A4A] hover:bg-[#FF4A4A] hover:text-black active:translate-y-[1px]"
              >
                ОТКЛОНИТЬ
              </button>
            </div>
          </div>
        </Teletext>
      )}

      {/* счётчик онлайна как у всех корневых */}
      <span className="font-pixel pointer-events-none absolute right-2.5 top-2 text-[10px] text-[#33FF00] opacity-70" aria-hidden="true">
        ● {users.filter((u) => u.online).length + 1}
      </span>

      {/* (Это вы) в шапке не нужен — юзер знает себя по нику */}
      <span className="sr-only">Мем-эфир пользователя {me.nick}. Свайпайте мемы, лайкайте или дизлайкайте.</span>
    </div>
  )
}
