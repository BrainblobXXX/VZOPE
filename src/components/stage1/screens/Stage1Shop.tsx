'use client'

import { useState } from 'react'
import { IconCart, IconCoin, PxButton } from '../../tv/ui'
import type { S1ShopItem } from '../data'

function ShopCard({
  item,
  coins,
  onBuy,
}: {
  item: S1ShopItem & { owned: boolean }
  coins: number
  onBuy: (item: S1ShopItem) => void
}) {
  const afford = coins >= item.price
  return (
    <div
      className="relative flex flex-col border-2 bg-[#140c04] p-2"
      style={{
        borderColor: item.owned ? '#33FF00' : item.rare ? '#FF00FF' : '#5a3a00',
        boxShadow: item.rare && !item.owned ? '0 0 14px #FF00FF22' : undefined,
      }}
    >
      {item.owned && (
        <span className="font-pixel absolute right-1 top-1 border border-black bg-[#33FF00] px-1 text-[5px] leading-[10px] text-black">✓</span>
      )}
      {!item.owned && item.rare && (
        <span className="px-blink-fast font-pixel absolute right-1 top-1 border border-black bg-[#FF00FF] px-1 text-[4px] leading-[10px] text-black">NEW</span>
      )}
      <div className="flex items-center gap-2">
        <span className={`text-[26px] leading-none ${item.owned ? '' : 'grayscale-0'}`} aria-hidden="true">
          {item.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`font-pixel block truncate text-[6px] ${item.owned ? 'text-[#33FF00]' : item.rare ? 'text-[#FF00FF]' : 'text-[#FFB000]'}`}>
            {item.name}
          </span>
          <span className="font-pixel mt-0.5 flex items-center gap-1 text-[6px] text-[#e8d9b0]">
            <IconCoin size={7} /> {item.price}
          </span>
        </span>
      </div>
      <p className="font-pixel mt-1.5 min-h-[24px] text-[5px] leading-relaxed text-[#8a6f3f]">{item.desc}</p>
      <PxButton
        variant={item.owned ? 'ghost' : afford ? (item.kind === 'sticker' ? 'green' : 'amber') : 'ghost'}
        className="mt-1 w-full py-1 text-[6px]"
        disabled={item.owned || !afford}
        onClick={() => onBuy(item)}
      >
        {item.owned ? (item.kind === 'sticker' ? 'В КАССЕТЕ' : 'В ИНВЕНТАРЕ') : afford ? (item.kind === 'sticker' ? 'КУПИТЬ' : 'КУПИТЬ В ПОДАРОК') : 'МАЛО КОИНОВ'}
      </PxButton>
    </div>
  )
}

export default function Stage1Shop({
  items,
  coins,
  onBuy,
}: {
  items: (S1ShopItem & { owned: boolean })[]
  coins: number
  onBuy: (item: S1ShopItem) => void
}) {
  const [tab, setTab] = useState<'stickers' | 'gifts'>('stickers')
  const list = items.filter((i) => (tab === 'stickers' ? i.kind === 'sticker' : i.kind === 'gift'))

  return (
    <div className="flex h-full flex-col">
      <header className="border-b-2 border-[#6b4a00] bg-[#1c0e00]/60 px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-[11px] text-[#FFB000]">ЛАВКА</h2>
          <span className="font-pixel flex items-center gap-1 text-[8px] text-[#FFB000]">
            <IconCoin size={10} /> {coins}
          </span>
        </div>
        <div className="mt-1.5 flex gap-1.5" role="tablist" aria-label="Разделы лавки">
          {(
            [
              ['stickers', 'СТИКЕРЫ'],
              ['gifts', 'ПОДАРКИ'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`font-pixel border-2 px-2 py-1 text-[6px] ${
                tab === key ? 'border-[#FFB000] bg-[#FFB000] text-[#140c04]' : 'border-[#5a3a00] text-[#8a6f3f] hover:border-[#FFB000] hover:text-[#FFB000]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="pixel-scroll min-h-0 flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {list.map((item) => (
            <ShopCard key={item.id} item={item} coins={coins} onBuy={onBuy} />
          ))}
        </div>

        <p className="font-pixel mt-3 text-center text-[5px] leading-relaxed text-[#3d3020]">
          СТИКЕРЫ — МНОГОРАЗОВЫЕ, ЛЕГКОТ В ЛЮБУЮ КАССЕТУ.
          <br />
          ПОДАРКИ — ОДНОРАЗОВЫЕ, ВРУЧАЮТСЯ ЧЕРЕЗ ШАПКУ КАССЕТЫ (🎁).
          <br />
          КОИНЫ КАПАЮТ ЗА ЛАЙКИ В МЕМ-ЭФИРЕ.
        </p>
      </div>

      <div className="overflow-hidden border-t border-[#5a3a00] bg-[#0d0a06] py-1" aria-hidden="true">
        <span className="marquee-track font-pixel text-[6px] text-[#33FF00]">
          АКЦИЯ!!! ПОДАРКИ И СКИДКИ! НО ПОТОМ. ★ СТИКЕРЫ — МНОГОРАЗОВЫЕ. ★ ЛАЙКИ КАПАЮТ КОИНАМИ. ★ НЕ ЗАБЫВАЙ ПЕРЕМАТЫВАТЬ.
        </span>
      </div>
    </div>
  )
}
