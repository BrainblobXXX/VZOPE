'use client'

import { useRef } from 'react'

// Долгий тап (500мс) по диз-доку: «Долгий тап открывает меню».
// Отмена при сдвиге >12px (скролл) или отпускании раньше таймера.
export function useLongPress(onLongPress: () => void, onClick?: () => void, ms = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fired = useRef(false)
  const start = useRef<{ x: number; y: number } | null>(null)

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    fired.current = false
    start.current = { x: e.clientX, y: e.clientY }
    clear()
    timer.current = setTimeout(() => {
      fired.current = true
      onLongPress()
    }, ms)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return
    const dx = Math.abs(e.clientX - start.current.x)
    const dy = Math.abs(e.clientY - start.current.y)
    if (dx > 12 || dy > 12) clear()
  }

  const onPointerUp = () => {
    clear()
  }

  const onPointerLeave = () => {
    clear()
  }

  const handleClick = (e: React.MouseEvent) => {
    if (fired.current) {
      e.preventDefault()
      fired.current = false
      return
    }
    onClick?.()
  }

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    clear()
    onLongPress()
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onClick: handleClick,
    onContextMenu,
  }
}
