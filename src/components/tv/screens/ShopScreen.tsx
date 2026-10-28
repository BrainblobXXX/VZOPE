'use client'

import { useMemo, useState } from 'react'
import { ERR, shopItems, mockUsers, ME_ID, type ShopItem, type User } from '@/lib/tv/data'
import { playClick } from '@/lib/tv/sounds'
import { IconCoin, Modal, PxButton } from '../ui'

type Tab = 'stickers' | 'gifts' | 'inventory'

export default function ShopScreen({
  coins,
  inventory,
  giftTarget,
  onBuy,
  onGift,
  onUseStickerInChat,
  onBack,
}: {
  coins: number
  inventory: Record<string, number>
  giftTarget: User | null
  onBuy: (itemId: string) => void
  onGift: (itemId: string, targetId: string | null) => void
  onUseStickerInChat: (itemId: string) => void
  onBack: () => void
}) {
  const [tab, setTab] = useState<Tab>('stickers')
  const [selected, setSelected] = useState<ShopItem | null>(null)
  const [mode, setMode] = useState<'view' | 'confirmBuy' | 'pickTarget' | 'confirmGift'>('view')
  const [targetId, setTargetId] = useState<string | null>(null)

  const ownedIds = useMemo(() => new Set(Object.keys(inventory).filter((k) => (inventory[k] ?? 0) > 0)), [inventory])

  const items = shopItems.filter((i) => i.category === tab)
  const target = mockUsers.find((u) => u.id === targetId) ?? null

  const openItem = (item: ShopItem) => {
    playClick()
    setSelected(item)
    setMode('view')
  }

  const startGift = (item: ShopItem) => {
    // из инвентаря — не списываем коины; из магазина — купим и подарим
    const fromInventory = tab === 'inventory' || (inventory[item.id] ?? 0) > 0
    if (!fromInventory && coins < item.price) return
    if (giftTarget) {
      setTargetId(giftTarget.id)
      setMode('confirmGift')
    } else {
      setMode('pickTarget')
    }
  }

  const invList = shopItems.filter((i) => (inventory[i.id] ?? 0) > 0)

  return (
    <div className="flex h-full flex-col">
      {/* шапка */}
      <header className="flex items-center justify-between border-b-2 border-[#6b4a00] bg-[#1c0e00]/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <h2 className="font-pixel chroma text-[11px] text-[#FFB000]">ЛАВКА</h2>
          <button onClick={() => { playClick(); onBack() }} className="font-pixel border-2 border-[#6b4a00] px-1.5 py-1 text-[6px] text-[#8a6f3f] hover:border-[#FFB000]">
            ← ФЛУДИЛКА
          </button>
        </div>
        <span className="font-pixel flex items-center gap-1.5 border-2 border-[#FFB000]/60 bg-black/50 px-2 py-1.5 text-[9px] text-[#FFB000]" aria-label={`Баланс: ${coins} мем-коинов`}>
          <IconCoin size={14} color="#FFB000" /> {coins}
        </span>
      </header>

      {/* табы */}
      <div className="flex shrink-0" role="tablist" aria-label="Категории магазина">
        {([['stickers', 'СТІКЕРЫ'], ['gifts', 'ПОДАРКИ'], ['inventory', 'МОЁ']] as const).map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => { playClick(); setTab(t) }}
            className={`font-pixel flex-1 border-b-2 px-1 py-2.5 text-[7px] ${
              tab === t ? 'border-[#FFB000] bg-[#FFB000]/10 text-[#FFB000]' : 'border-[#6b4a00] text-[#8a6f3f]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* сетка / инвентарь */}
      <div className="pixel-scroll min-h-0 flex-1 overflow-y-auto p-2">
        {tab !== 'inventory' ? (
          items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="emoji-px text-4xl">🕸</span>
              <p className="font-pixel text-[8px] text-[#8a6f3f]">ПОЛКИ ПУСТЫ. ЗАВОЗА НЕ БУДЕТ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => {
                const owned = ownedIds.has(item.id)
                const afford = coins >= item.price
                return (
                  <button
                    key={item.id}
                    onClick={() => openItem(item)}
                    className="relative flex flex-col items-center gap-1.5 border-2 border-[#6b4a00] bg-black/30 p-3 text-center hover:border-[#FFB000]"
                  >
                    {item.rare && !owned && (
                      <span className="font-pixel px-blink-fast absolute left-1 top-1 text-[5px] text-[#FF00FF]">NEW</span>
                    )}
                    {owned && (
                      <span className="font-pixel absolute right-1 top-1 text-[8px] text-[#33FF00]" title="В инвентаре">✓</span>
                    )}
                    <span className="emoji-px text-3xl leading-none">{item.icon}</span>
                    <span className="font-pixel line-clamp-1 text-[7px] leading-relaxed text-[#e8d9b0]">{item.name}</span>
                    <span className={`font-pixel flex items-center gap-1 text-[8px] ${afford || owned ? 'text-[#FFB000]' : 'text-[#FF4A4A]'}`}>
                      <IconCoin size={10} color="currentColor" /> {item.price}
                    </span>
                  </button>
                )
              })}
            </div>
          )
        ) : invList.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="emoji-px text-4xl">🧺</span>
            <p className="font-pixel text-[8px] text-[#8a6f3f]">КАРМАНЫ ПУСТЫ. ИДИ ЛОВИ ЛАЙКИ</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {invList.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5 border-2 border-[#6b4a00] bg-black/30 p-2">
                <span className="emoji-px text-2xl">{item.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-pixel block truncate text-[8px] text-[#e8d9b0]">
                    {item.name} <span className="text-[#FFB000]">×{inventory[item.id]}</span>
                  </span>
                  <span className="font-pixel mt-0.5 block text-[6px] text-[#5a4626]">
                    {item.category === 'stickers' ? 'СТИКЕР' : 'ПОДАРОК'}
                  </span>
                </span>
                <div className="flex shrink-0 flex-col gap-1">
                  {item.category === 'stickers' ? (
                    <PxButton onClick={() => onUseStickerInChat(item.id)} className="!px-2 !py-1.5 !text-[6px]">
                      В ЧАТ
                    </PxButton>
                  ) : (
                    <PxButton
                      onClick={() => { setSelected(item); startGift(item) }}
                      className="!px-2 !py-1.5 !text-[6px]"
                    >
                      ПОДАРИТЬ
                    </PxButton>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* бегущая строка */}
      <div className="shrink-0 overflow-hidden border-t-2 border-[#6b4a00] bg-[#331A00] py-1.5" aria-hidden="true">
        <span className="marquee-track font-pixel text-[7px] text-[#FFB000]">
          АКЦИЯ!!! ПОДАРКИ! СКИДКИ! СГУЩЁНКА ПО ЦЕНЕ ПЛЕДКИ! ГИРЛЯНДА МИГАЕТ БЕСПЛАТНО! ЛОВИ ЛАЙКИ — ЛОВИ КОИНЫ! АКЦИЯ!!!
        </span>
      </div>

      {/* карточка товара */}
      {selected && mode === 'view' && (
        <Modal title="ТОВАР" onClose={() => setSelected(null)}>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="emoji-px text-5xl">{selected.icon}</span>
            <h3 className="font-pixel text-[9px] leading-relaxed text-[#FFB000]">{selected.name}</h3>
            <p className="font-pixel text-[7px] leading-relaxed text-[#e8d9b0]">{selected.desc}</p>
            <p className="font-pixel flex items-center gap-1.5 text-[10px] text-[#FFB000]">
              <IconCoin size={14} color="#FFB000" /> {selected.price}
            </p>
            {giftTarget && tab === 'gifts' && (
              <p className="font-pixel text-[6px] text-[#33FF00]">ДАРЕНИЕ ДЛЯ: {giftTarget.nick}</p>
            )}
            {ownedIds.has(selected.id) && (
              <p className="font-pixel text-[6px] text-[#33FF00]">✓ {ERR.ALREADY_HAVE} (МОЖНО ПОДАРИТЬ КОПИЮ)</p>
            )}
            <div className="mt-1 flex w-full gap-2">
              <PxButton
                className="flex-1"
                disabled={coins < selected.price}
                onClick={() => setMode('confirmBuy')}
              >
                {coins < selected.price ? 'МАЛО КОИНОВ' : ownedIds.has(selected.id) ? ERR.ALREADY_HAVE : 'КУПИТЬ'}
              </PxButton>
              <PxButton variant="green" className="flex-1" disabled={!ownedIds.has(selected.id) && coins < selected.price} onClick={() => startGift(selected)}>
                ПОДАРИТЬ
              </PxButton>
            </div>
            <PxButton variant="ghost" className="w-full" onClick={() => setSelected(null)}>
              ЗАКРЫТЬ
            </PxButton>
          </div>
        </Modal>
      )}

      {/* подтверждение покупки */}
      {selected && mode === 'confirmBuy' && (
        <Modal title="ПОДТВЕРЖДЕНИЕ" onClose={() => setMode('view')}>
          <p className="font-pixel text-center text-[8px] leading-relaxed text-[#e8d9b0]">
            КУПИТЬ [ {selected.name} ]<br />ЗА {selected.price} КОИНОВ?
          </p>
          <div className="mt-3 flex gap-2">
            <PxButton
              className="flex-1"
              onClick={() => {
                onBuy(selected.id)
                setSelected(null)
              }}
            >
              ДА
            </PxButton>
            <PxButton variant="ghost" className="flex-1" onClick={() => setMode('view')}>
              НЕТ
            </PxButton>
          </div>
        </Modal>
      )}

      {/* выбор получателя */}
      {selected && mode === 'pickTarget' && (
        <Modal title="КОМУ ПОДАРИМ?" onClose={() => setMode('view')}>
          <div className="flex flex-col gap-1">
            {mockUsers
              .filter((u) => u.id !== ME_ID && u.online)
              .slice(0, 6)
              .map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    playClick()
                    setTargetId(u.id)
                    setMode('confirmGift')
                  }}
                  className="font-pixel border-2 border-[#6b4a00] px-2 py-2 text-left text-[8px] text-[#FFB000] hover:border-[#FFB000]"
                >
                  {u.nick} <span className="text-[6px] text-[#5a4626]">· {u.status ?? 'в эфире'}</span>
                </button>
              ))}
          </div>
        </Modal>
      )}

      {/* подтверждение дарения */}
      {selected && mode === 'confirmGift' && target && (
        <Modal title="ПОДАРОК" onClose={() => setMode('view')}>
          <p className="font-pixel text-center text-[8px] leading-relaxed text-[#e8d9b0]">
            ПОДАРИТЬ [ {selected.name} ]<br />ЮЗЕРУ [ {target.nick} ]?
          </p>
          <p className="font-pixel mt-2 text-center text-[6px] text-[#8a6f3f]">
            {inventory[selected.id] > 0 ? 'ИЗ ИНВЕНТАРЯ (БЕСПЛАТНО)' : `СПИШЕТСЯ ${selected.price} КОИНОВ`}
          </p>
          <div className="mt-3 flex gap-2">
            <PxButton
              variant="green"
              className="flex-1"
              onClick={() => {
                onGift(selected.id, target.id)
                setSelected(null)
              }}
            >
              ДА
            </PxButton>
            <PxButton variant="ghost" className="flex-1" onClick={() => setMode('view')}>
              НЕТ
            </PxButton>
          </div>
        </Modal>
      )}
    </div>
  )
}
