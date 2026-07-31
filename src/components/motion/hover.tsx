'use client'

import { motion, useReducedMotion } from 'motion/react'
import { type ReactNode } from 'react'

import { motionTokens } from '@/lib/motion'

type HoverScaleProps = {
  children: ReactNode
  className?: string
  /** Skala saat hover. Default 1.02. */
  scale?: number
}

/**
 * Hover scale untuk kartu interaktif.
 * Saat reduced-motion: mati total.
 *
 * Lihat docs/rules/04_MOTION.md §4.
 */
export function HoverScale({
  children,
  className,
  scale = 1.02,
}: HoverScaleProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.98 }}
      transition={{
        duration: motionTokens.duration.fast,
        ease: motionTokens.ease.standard,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
