'use client'

import { useEffect, useRef, useState } from 'react'
import { PxButton } from '../../tv/ui'
import type { S1Meme } from '../data'

/** карточка, уже улетающая за экран — кадр в ней заморожен на момент свайпа */
interface ExitingCard {
  id: number
  meme: S1Meme
  dir: -1 | 1
  fromX: number
  fromR: number
}

function MemeArt({ meme }: { meme: S1Meme }) {
  const [failed, setFailed] = useState(false)

  if (meme.src && !failed) {
    return (
      <img
        src={meme.src}
        alt={meme.caption}
        draggable={false}
        onError={() => setFailed(true)}
        className="relative max-h-full max-w-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    )
  }

  return (
    <div
      className="relative select-none text-center text-[110px] leading-none sm:text-[130px]"
      style={{ filter: 'saturate(.8) contrast(1.15)', textShadow: `0 0 24px ${meme.accent}55` }}
      aria-hidden="true"
    >
      {meme.emoji}
    </div>
  )
}

/** шапка + кадр — общий вид карточки для основной, под- и улетающей карточки */
function MemeCardFace({ meme, dimmed = false }: { meme: S1Meme; dimmed?: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between border-b-2 px-3 py-1.5" style={{ borderColor: `${meme.accent}66` }}>
        <span className="font-pixel text-[6px]" style={{ color: meme.accent }}>{meme.tag}</span>
        <span className={`font-pixel text-[6px] ${meme.exported ? 'px-blink text-[#FF00FF]' : 'text-[#5a4626]'}`}>
          {meme.exported ? 'ИЗ КАССЕТЫ' : 'DEMO MEME'}
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,176,0,.22) 0 1px, transparent 1px 4px), radial-gradient(circle at 50% 40%, rgba(255,176,0,.14), transparent 60%)',
          }}
          aria-hidden="true"
        />
        <MemeArt meme={meme} />
      </div>

      {dimmed && <div className="absolute inset-0 bg-black/50" aria-hidden="true" />}
    </>
  )
}

export default function Stage1Feed({
  memes,
  matchBadge = 0,
  onOpenMatches,
  onLike,
  onRefresh,
  onSwipe,
  initialIndex = 0,
  onIndexChange,
}: {
  memes: S1Meme[]
  matchBadge?: number
  onOpenMatches?: () => void
  onLike: () => void
  onRefresh?: () => void
  onSwipe?: (dir: -1 | 1) => void
  initialIndex?: number
  onIndexChange?: (index: number) => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const [swiped, setSwiped] = useState(0)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [exiting, setExiting] = useState<ExitingCard[]>([])

  const startX = useRef<number | null>(null)
  const startTime = useRef(0)
  const dragRef = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const exitId = useRef(0)
  const timersRef = useRef<number[]>([])

  const current = memes[index]
  const next = memes[index + 1]

  // предзагрузка следующих кадров — замена происходит без задержки на загрузку
  useEffect(() => {
    for (const m of memes.slice(index + 1, index + 4)) {
      if (m.src) {
        const img = new window.Image()
        img.src = m.src
      }
    }
  }, [memes, index])

  // страховка: сносим улетающие карточки и таймеры при размонтировании
  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  /**
   * Мгновенный коммит свайпа: индекс меняется СРАЗУ (кадр заменяется в тот же кадр),
   * а старая карточка снимается в оверлей и улетает за экран независимо.
   * Никакой задержки между свайпом и заменой картинки.
   */
  const commitSwipe = (dir: -1 | 1, fromX?: number) => {
    if (!current) return
    const fx = fromX ?? dragRef.current
    const id = ++exitId.current
    setExiting((list) => [...list.slice(-2), { id, meme: current, dir, fromX: fx, fromR: fx / 22 }])
    timersRef.current.push(window.setTimeout(() => dropExiting(id), 700))
    const nextIndex = index + 1
    setIndex(nextIndex)
    onIndexChange?.(nextIndex)
    setSwiped((s) => s + 1)
    setDrag(0)
    dragRef.current = 0
    startX.current = null
    setDragging(false)
    onSwipe?.(dir)
    if (dir === 1) onLike()
  }

  const dropExiting = (id: number) => {
    setExiting((list) => list.filter((e) => e.id !== id))
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!current) return
    startX.current = e.clientX
    startTime.current = Date.now()
    dragRef.current = 0
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return
    dragRef.current = e.clientX - startX.current
    setDrag(dragRef.current)
    // карточка вытолкнута за область экрана — меняем кадр немедленно, не дожидаясь отпускания пальца
    const cardW = cardRef.current?.clientWidth ?? 320
    const contW = cardRef.current?.parentElement?.clientWidth ?? cardW + 24
    if (Math.abs(dragRef.current) > (contW + cardW) / 2) {
      commitSwipe(dragRef.current > 0 ? 1 : -1)
    }
  }

  const finish = () => {
    if (startX.current === null) return
    const elapsed = Math.max(1, Date.now() - startTime.current)
    const distance = dragRef.current
    const velocity = Math.abs(distance) / elapsed
    const width = cardRef.current?.clientWidth ?? 320
    const passed = Math.abs(distance) > width * 0.3 || velocity > 0.8
    startX.current = null
    setDragging(false)
    if (!passed || Math.abs(distance) < 8) {
      dragRef.current = 0
      setDrag(0)
      return
    }
    commitSwipe(distance > 0 ? 1 : -1, distance)
  }

  const transform = `translateX(${drag}px) rotate(${drag / 22}deg)`

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#5a3a00] bg-[#1c0e00]/60 px-3 py-1.5">
        <span className="font-pixel text-[7px] text-[#FFB000]">МЕМ-ЭФИР</span>
        <div className="flex items-center gap-2">
          {onOpenMatches && (
            <button
              onClick={onOpenMatches}
              className="font-pixel relative border border-[#FFB000]/50 px-1.5 py-0.5 text-[6px] text-[#FFB000] transition-colors hover:border-[#FFB000] hover:bg-[#FFB000]/10"
              aria-label={`Мои мэтчи${matchBadge > 0 ? `, новых ${matchBadge}` : ''}`}
            >
              МОИ МЭТЧИ
              {matchBadge > 0 && (
                <span className="px-blink-fast font-pixel absolute -right-1.5 -top-1.5 min-w-[12px] border border-black bg-[#FF4A4A] px-[2px] text-center text-[6px] leading-[12px] text-black">
                  {matchBadge > 9 ? '9+' : matchBadge}
                </span>
              )}
            </button>
          )}
          <span className="font-pixel text-[7px] text-[#8a6f3f]">
            {Math.min(index + 1, memes.length)} / {memes.length}
          </span>
        </div>
      </div>
      <div className="h-[3px] shrink-0 bg-[#1c0e00]" aria-hidden="true">
        <div
          className="h-full bg-[#FFB000] transition-all duration-200"
          style={{ width: `${memes.length ? Math.min(100, (Math.min(index + 1, memes.length) / memes.length) * 100) : 0}%`, boxShadow: '0 0 8px #FFB00066' }}
        />
      </div>

      <div className="relative min-h-0 flex-1 p-3" style={{ touchAction: 'none' }}>
        {!current ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
            <div className="font-pixel text-[16px] text-[#FFB000]">МЕМЫ ЗАКОНЧИЛИСЬ</div>
            <p className="font-pixel text-[7px] leading-relaxed text-[#8a6f3f]">НОВЫЕ БУДЕТ ЗАВОЗИТЬ АДМИН. ПОКА МОЖНО ПЕРЕСМОТРЕТЬ.</p>
            <PxButton
              onClick={() => {
                onRefresh?.()
                setIndex(0)
                onIndexChange?.(0)
                setSwiped(0)
                setDrag(0)
                dragRef.current = 0
                setExiting([])
              }}
            >
              ОБНОВИТЬ
            </PxButton>
          </div>
        ) : (
          <>
            {/* под-карточка: следующий кадр виден заранее и уже загружен */}
            {next && (
              <div
                className="pointer-events-none absolute inset-x-5 inset-y-6 flex select-none flex-col overflow-hidden border-2 bg-[#140c04]"
                style={{ borderColor: `${next.accent}55`, transform: 'rotate(-1.4deg) scale(.965)' }}
                aria-hidden="true"
              >
                <MemeCardFace meme={next} dimmed />
              </div>
            )}

            {/* основная карточка — кадр меняется в момент коммита свайпа */}
            <div
              key={current.id}
              className="absolute inset-3"
              style={{ animation: 's1-card-in 200ms ease-out' }}
            >
              <div
                ref={cardRef}
                role="group"
                aria-label={`Мем ${index + 1}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={finish}
                onPointerCancel={finish}
                className="relative flex h-full w-full select-none flex-col overflow-hidden border-2 bg-[#140c04]"
                style={{
                  borderColor: current.accent,
                  transform,
                  transition: dragging ? 'none' : 'transform 150ms ease-out',
                  boxShadow: `0 0 24px ${current.accent}22`,
                }}
              >
                <MemeCardFace meme={current} />

                <div
                  className="flex items-center justify-between gap-2 border-t-2 px-3 py-2.5"
                  style={{ borderColor: `${current.accent}66` }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <PxButton variant="danger" className="flex-1" onClick={() => commitSwipe(-1, 0)}>
                    ◀ ДИЗЛАЙК
                  </PxButton>
                  <PxButton variant="green" className="flex-1" onClick={() => commitSwipe(1, 0)}>
                    ЛАЙК ▶
                  </PxButton>
                </div>
              </div>
            </div>
          </>
        )}

        {/* улетающие карточки: старый кадр уходит за экран поверх уже заменённого */}
        {exiting.map((ex) => (
          <div
            key={ex.id}
            className="pointer-events-none absolute inset-3 z-10 flex select-none flex-col overflow-hidden border-2 bg-[#140c04]"
            style={{
              borderColor: ex.meme.accent,
              boxShadow: `0 0 24px ${ex.meme.accent}33`,
              willChange: 'transform',
              animation: 's1-fly-out 230ms cubic-bezier(.25,.6,.3,1) forwards',
              '--fx': `${ex.fromX}px`,
              '--fr': `${ex.fromR}deg`,
              '--tx': `calc(${ex.dir * 50}vw + ${ex.dir * 140}px)`,
              '--tr': `${ex.dir * 14}deg`,
            } as React.CSSProperties}
            onAnimationEnd={() => dropExiting(ex.id)}
            aria-hidden="true"
          >
            <MemeCardFace meme={ex.meme} />
          </div>
        ))}
      </div>

      <div className="px-3 pb-2 text-center">
        <p className="font-pixel text-[6px] text-[#5a4626]">
          {swiped === 0 ? 'СВАЙП ВПРАВО — ЛАЙК. ВЛЕВО — ДИЗЛАЙК.' : 'ЛИСТАЙ ДАЛЬШЕ. МЭТЧ ПРИДЁТ СЛУЧАЙНО.'}
        </p>
      </div>
    </div>
  )
}
