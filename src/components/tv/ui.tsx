'use client'

import { useEffect, type ReactNode } from 'react'

// ── пиксельные иконки (SVG, crispEdges) ──────────────────────

export function IconPerson({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} aria-hidden="true">
      <rect x="9" y="3" width="6" height="6" />
      <rect x="10" y="2" width="4" height="1" />
      <rect x="5" y="10" width="14" height="8" />
      <rect x="7" y="18" width="10" height="2" />
    </svg>
  )
}

export function IconCart({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} aria-hidden="true">
      <rect x="2" y="3" width="3" height="2" />
      <rect x="4" y="5" width="14" height="2" />
      <rect x="6" y="7" width="12" height="7" />
      <rect x="8" y="9" width="8" height="3" fill="none" stroke={color} strokeWidth="0" />
      <rect x="7" y="16" width="4" height="4" />
      <rect x="14" y="16" width="4" height="4" />
    </svg>
  )
}

export function IconWaves({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} aria-hidden="true">
      <rect x="10" y="10" width="4" height="4" />
      <rect x="7" y="8" width="2" height="2" />
      <rect x="7" y="14" width="2" height="2" />
      <rect x="6" y="10" width="2" height="4" />
      <rect x="15" y="8" width="2" height="2" />
      <rect x="15" y="14" width="2" height="2" />
      <rect x="16" y="10" width="2" height="4" />
      <rect x="3" y="5" width="2" height="2" />
      <rect x="2" y="10" width="2" height="4" />
      <rect x="3" y="17" width="2" height="2" />
      <rect x="19" y="5" width="2" height="2" />
      <rect x="20" y="10" width="2" height="4" />
      <rect x="19" y="17" width="2" height="2" />
    </svg>
  )
}

export function IconMeme({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} aria-hidden="true">
      <rect x="5" y="2" width="14" height="2" />
      <rect x="3" y="4" width="18" height="14" />
      <rect x="5" y="18" width="14" height="2" />
      <rect x="7" y="7" width="3" height="3" fill="#0d0a06" />
      <rect x="14" y="7" width="3" height="3" fill="#0d0a06" />
      <rect x="6" y="12" width="12" height="4" fill="#0d0a06" />
      <rect x="8" y="14" width="8" height="2" fill={color} />
    </svg>
  )
}

export function IconCassette({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} aria-hidden="true">
      <rect x="1" y="5" width="22" height="14" />
      <rect x="3" y="7" width="18" height="6" fill="#0d0a06" />
      <rect x="5" y="9" width="4" height="3" fill={color} />
      <rect x="15" y="9" width="4" height="3" fill={color} />
      <rect x="5" y="15" width="14" height="2" fill="#0d0a06" />
    </svg>
  )
}

export function IconCoin({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} aria-hidden="true">
      <rect x="6" y="2" width="12" height="2" />
      <rect x="4" y="4" width="16" height="16" />
      <rect x="6" y="20" width="12" height="2" />
      <rect x="10" y="7" width="2" height="10" fill="#0d0a06" />
      <rect x="8" y="8" width="8" height="2" fill="#0d0a06" />
      <rect x="8" y="14" width="8" height="2" fill="#0d0a06" />
    </svg>
  )
}

export function IconClip({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} aria-hidden="true">
      <rect x="8" y="2" width="8" height="14" />
      <rect x="10" y="4" width="4" height="10" fill="#0d0a06" />
      <rect x="6" y="6" width="2" height="10" />
      <rect x="16" y="6" width="2" height="10" />
      <rect x="8" y="16" width="8" height="4" />
    </svg>
  )
}

export function IconEye({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} aria-hidden="true">
      <rect x="2" y="8" width="20" height="8" />
      <rect x="4" y="6" width="16" height="2" />
      <rect x="4" y="16" width="16" height="2" />
      <rect x="9" y="10" width="6" height="4" fill="#0d0a06" />
      <rect x="11" y="11" width="2" height="2" fill={color} />
    </svg>
  )
}

export function IconRec({ size = 10, color = '#FF4A4A' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" shapeRendering="crispEdges" fill={color} aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" />
      <rect x="3" y="3" width="4" height="4" fill="#7a0f0f" />
    </svg>
  )
}

// ── PxButton ────────────────────────────────────────────────

export function PxButton({
  children,
  onClick,
  disabled,
  variant = 'amber',
  className = '',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'amber' | 'green' | 'danger' | 'ghost'
  className?: string
  type?: 'button' | 'submit'
}) {
  const palette: Record<string, string> = {
    amber: 'border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000] hover:text-[#1a0f05]',
    green: 'border-[#33FF00] text-[#33FF00] hover:bg-[#33FF00] hover:text-[#1a0f05]',
    danger: 'border-[#FF4A4A] text-[#FF4A4A] hover:bg-[#FF4A4A] hover:text-[#1a0f05]',
    ghost: 'border-[#7a5a00] text-[#8a6f3f] hover:border-[#FFB000] hover:text-[#FFB000]',
  }
  const off = 'border-[#4a3a20] text-[#4a3a20] cursor-not-allowed'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-pixel border-2 bg-[#1a0f05] px-3 py-2 text-[9px] leading-none tracking-wide transition-colors active:translate-y-[1px] ${disabled ? off : palette[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ── баннер-плашка (hard cut, без анимаций) ──────────────────

export function Banner({ text, tone = 'amber' }: { text: string; tone?: 'amber' | 'red' | 'green' }) {
  const c = tone === 'red' ? '#FF4A4A' : tone === 'green' ? '#33FF00' : '#FFB000'
  return (
    <div className="pointer-events-none absolute left-3 right-3 top-3 z-50 flex justify-center">
      <div
        className="font-pixel max-w-full border-2 bg-[#0d0a06] px-3 py-2 text-center text-[8px] leading-relaxed"
        style={{ color: c, borderColor: c, boxShadow: `0 0 12px ${c}55` }}
        role="status"
      >
        {text}
      </div>
    </div>
  )
}

// ── модалка («врезка в эфир», hard cut) ─────────────────────

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose?: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`flex max-h-full w-full flex-col ${wide ? 'max-w-[340px]' : 'max-w-[300px]'} border-2 border-[#FFB000] bg-[#140c04]`}
        style={{ boxShadow: '0 0 0 2px #140c04, 0 0 0 3px #7a5a00, 0 0 24px rgba(255,176,0,.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b-2 border-[#7a5a00] bg-[#331A00] px-3 py-2">
          <span className="font-pixel text-[9px] text-[#FFB000]">{title}</span>
          {onClose && (
            <button onClick={onClose} className="font-pixel px-1 text-[10px] text-[#FFB000] hover:text-[#33FF00]" aria-label="Закрыть">
              ✕
            </button>
          )}
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">{children}</div>
      </div>
    </div>
  )
}

// ── цветные полосы тест-карты ───────────────────────────────

export function TestBars({ className = '' }: { className?: string }) {
  const colors = ['#FFB000', '#33FF00', '#FF00FF', '#00FFFF', '#D9CDB8', '#FF5A00', '#7a5a00', '#664400']
  return (
    <div className={`flex h-2.5 w-full ${className}`} aria-hidden="true">
      {colors.map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c, opacity: 0.85 }} />
      ))}
    </div>
  )
}

// ── мигающий курсор строки ввода ────────────────────────────

export function BlinkCursor() {
  return <span className="cursor-blink text-[#FFB000]" aria-hidden="true" />
}

// хук для авто-скрытия баннера
export function useAutoHide(show: boolean, onHide: () => void, ms = 2200) {
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onHide, ms)
    return () => clearTimeout(t)
     
  }, [show])
}
