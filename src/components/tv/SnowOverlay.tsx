'use client'

import { useEffect, useRef } from 'react'

// Плотный ЭЛТ-«снег» на канвасе (шум рисуется в низком разрешении и растягивается)
export default function SnowOverlay({ active, amber = false }: { active: boolean; amber?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const raf = useRef<number>(0)
  const last = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 120
    const H = 160
    canvas.width = W
    canvas.height = H

    const draw = (time: number) => {
      // ~14 fps — механическое дрожание помех
      if (time - last.current > 70) {
        last.current = time
        const img = ctx.createImageData(W, H)
        const d = img.data
        for (let i = 0; i < d.length; i += 4) {
          const v = Math.random() * 255
          if (amber) {
            d[i] = v
            d[i + 1] = v * 0.65
            d[i + 2] = v * 0.15
          } else {
            d[i] = v
            d[i + 1] = v
            d[i + 2] = v
          }
          d[i + 3] = 255
        }
        ctx.putImageData(img, 0, 0)
      }
      raf.current = requestAnimationFrame(draw)
    }
    raf.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf.current)
  }, [active, amber])

  if (!active) return null
  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    />
  )
}
