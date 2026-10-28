'use client'

// Детерминированный пиксель-аватар 8×8 (симметричный, фосфорные цвета)

const PALETTE = ['#FFB000', '#33FF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#FF5A00']

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function PixelAvatar({
  seed,
  size = 32,
  className = '',
  dim = false,
}: {
  seed: string
  size?: number
  className?: string
  dim?: boolean
}) {
  const rand = mulberry32(hashStr(seed))
  const fg = PALETTE[Math.floor(rand() * PALETTE.length)]
  const fg2 = PALETTE[Math.floor(rand() * PALETTE.length)]
  const bg = '#1a1208'

  // 8x8, зеркалим по вертикали: генерим 4 колонки
  const cells: Array<{ x: number; y: number; c: string }> = []
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 8; y++) {
      const v = rand()
      if (v > 0.52) {
        const c = v > 0.8 ? fg2 : fg
        cells.push({ x, y, c })
        cells.push({ x: 7 - x, y, c })
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      className={className}
      style={{ imageRendering: 'pixelated', opacity: dim ? 0.5 : 1 }}
      aria-hidden="true"
    >
      <rect width="8" height="8" fill={bg} />
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width="1" height="1" fill={c.c} />
      ))}
    </svg>
  )
}
