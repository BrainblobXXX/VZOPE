'use client'

import { useState } from 'react'
import PixelAvatar from '../tv/PixelAvatar'

export default function PhotoAvatar({
  src,
  seed,
  size,
  alt,
  dim = false,
  className = '',
}: {
  src?: string
  seed: string
  size: number
  alt: string
  dim?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ${dim ? 'opacity-50' : ''} ${className}`}
        style={{ width: size, height: size, imageRendering: 'auto' }}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={`inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <PixelAvatar seed={seed} size={size} dim={dim} />
    </span>
  )
}
