'use client'

import { Modal, PxButton } from '../tv/ui'
import type { S1ShopItem } from './data'

export default function Stage1StickerPicker({
  items,
  onPick,
  onClose,
  onGoShop,
}: {
  items: S1ShopItem[]
  onPick: (item: S1ShopItem, x: number, y: number) => void
  onClose: () => void
  onGoShop: () => void
}) {
  return (
    <Modal title="НАКЛЕИТЬ СТИКЕР" onClose={onClose} wide>
      <div className="flex flex-col gap-2">
        <p className="font-pixel text-[6px] leading-relaxed text-[#8a6f3f]">
          ВЫБЕРИ СТИКЕР И ПЕРЕТАЩИ ЕГО НА КОРПУС ТЕЛЕВИЗОРА.
          <br />
          ОТПУСТИ НАД ДЕРЕВОМ — СТИКЕР ОСТАНЕТСЯ НА СЕССИЮ.
        </p>

        {items.length === 0 ? (
          <>
            <p className="font-pixel border border-dashed border-[#5a3a00] px-3 py-4 text-center text-[7px] leading-relaxed text-[#8a6f3f]">
              У ТЕБЯ ПОКА НЕТ СТИКЕРОВ.
              <br />
              КУПИ ИХ В ЛАВКЕ.
            </p>
            <PxButton variant="amber" onClick={onGoShop}>
              В ЛАВКУ
            </PxButton>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                onPointerDown={(e) => {
                  e.preventDefault()
                  onPick(item, e.clientX, e.clientY)
                }}
                className="flex cursor-grab touch-none select-none flex-col items-center gap-1 border-2 border-[#5a3a00] bg-[#140c04] p-2 text-center hover:border-[#FFB000] active:cursor-grabbing"
                role="button"
                tabIndex={0}
                aria-label={`Наклеить стикер ${item.name}`}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  onPick(item, window.innerWidth / 2, window.innerHeight / 2)
                }}
              >
                <span className="text-[32px] leading-none" aria-hidden="true">{item.emoji}</span>
                <span className="font-pixel line-clamp-2 text-[5px] leading-tight text-[#FFB000]">{item.name}</span>
              </div>
            ))}
          </div>
        )}

        <PxButton variant="ghost" onClick={onClose}>
          ЗАКРЫТЬ
        </PxButton>
      </div>
    </Modal>
  )
}
