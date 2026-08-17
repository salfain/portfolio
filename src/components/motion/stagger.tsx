'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import { type ReactNode } from 'react'

import { motionTokens } from '@/lib/motion'

type StaggerContainerProps = {
  children: ReactNode
  className?: string
  /** Jarak stagger antar item (detik). */
  stagger?: number
  /** Delay awal (detik). */
  delay?: number
}

const containerVariants = (
  reduced: boolean | null,
  stagger: number,
  delay: number,
): Variants => ({
  hidden: reduced ? {} : { opacity: 0 },
  visible: {
    opacity: 1,
    transition: reduced
      ? { duration: 0 }
      : {
          staggerChildren: stagger,
          delayChildren: delay,
        },
  },
})

const itemVariants = (reduced: boolean | null): Variants => ({
  hidden: reduced ? {} : { opacity: 0, y: motionTokens.distance.medium },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.normal,
      ease: motionTokens.ease.enter,
    },
  },
})

/**
 * Container stagger. Bungkus beberapa <StaggerItem>.
 * Saat reduced-motion: semua item langsung tampil.
 */
export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: StaggerContainerProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      data-motion="stagger"
      variants={containerVariants(reduced, stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      data-motion="stagger-item"
      variants={itemVariants(reduced)}
      className={className}
    >
      {children}
    </motion.div>
  )
}
