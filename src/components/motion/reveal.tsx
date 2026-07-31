'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import { type ReactNode } from 'react'

import { motionTokens } from '@/lib/motion'

type RevealProps = {
  children: ReactNode
  /** Jarak masuk (px). Default: medium. */
  distance?: keyof typeof motionTokens.distance
  /** Delay dalam detik. */
  delay?: number
  className?: string
} & Omit<HTMLMotionProps<'div'>, 'children'>

/**
 * Reveal saat scroll. Hanya animasikan transform + opacity.
 * Saat reduced-motion: langsung tampil tanpa gerakan.
 *
 * Lihat docs/rules/04_MOTION.md §4.
 */
export function Reveal({
  children,
  distance = 'medium',
  delay = 0,
  className,
  ...props
}: RevealProps) {
  const reduced = useReducedMotion()
  const dist = motionTokens.distance[distance]

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: dist }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: motionTokens.duration.normal,
        ease: motionTokens.ease.enter,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
