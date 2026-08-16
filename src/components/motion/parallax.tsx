'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { type ReactNode, useRef } from 'react'

import { motionTokens } from '@/lib/motion'

type ParallaxProps = {
  children: ReactNode
  className?: string
  /** Faktor parallax. Positif = lebih cepat, negatif = lebih lambat. */
  factor?: number
}

/**
 * Parallax berbasis scroll. Hanya animasikan `y` (transform).
 * Saat reduced-motion: mati total, children statis.
 *
 * Lihat docs/rules/04_MOTION.md §4.
 */
export function Parallax({ children, className, factor = 0.2 }: ParallaxProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [
      motionTokens.distance.large * factor,
      -motionTokens.distance.large * factor,
    ],
  )

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
