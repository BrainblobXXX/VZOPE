'use client'

import PixelAvatar from '../PixelAvatar'

// Плёнка на 4 кадра (35мм, перфорация по краям)
// src может быть dataURL или 'pixel:<seed>' — мок-кадр из пиксель-аватара
export default function FilmStrip({
  photos,
  editable,
  onFrameClick,
}: {
  photos: Array<{ src: string | null }>
  editable: boolean
  onFrameClick: (index: number) => void
}) {
  const slots = [0, 1, 2, 3]
  return (
    <div className="mx-2 border-y-4 border-[#0d0a06] bg-[#140c04] px-1 py-1" aria-label="Плёнка из четырёх кадров">
      {/* перфорация сверху */}
      <div className="perf mb-1 h-2 w-full opacity-70" aria-hidden="true" />
      <div className="flex gap-1.5">
        {slots.map((i) => {
          const photo = photos[i]
          const filled = photo?.src
          return (
            <button
              key={i}
              onClick={() => onFrameClick(i)}
              className={`relative aspect-square flex-1 overflow-hidden ${filled ? 'border border-[#6b4a00] bg-black' : 'film-empty bg-black/30'}`}
              aria-label={filled ? `Кадр ${i + 1}, просмотр` : editable ? `Кадр ${i + 1}, пустой — загрузить` : `Кадр ${i + 1}, пустой`}
            >
              {filled ? (
                filled.startsWith('pixel:') ? (
                  <span className="flex h-full w-full items-center justify-center bg-black p-0.5">
                    <PixelAvatar seed={filled.slice(6)} size={80} className="h-full w-full" />
                  </span>
                ) : (
                   
                  <img src={filled} alt={`Кадр ${i + 1}`} className="h-full w-full object-cover" style={{ imageRendering: 'pixelated' }} />
                )
              ) : (
                <span className="font-pixel absolute inset-0 flex items-center justify-center text-[12px] text-[#5a4626]">
                  {editable ? '+' : ''}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {/* перфорация снизу */}
      <div className="perf mt-1 h-2 w-full opacity-70" aria-hidden="true" />
    </div>
  )
}
