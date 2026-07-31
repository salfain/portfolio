/**
 * Token animasi — satu-satunya sumber durasi, easing, dan jarak.
 * Lihat docs/rules/04_MOTION.md §2 dan docs/02_DESIGN_AND_DATA.md §2.
 *
 * Jangan menulis angka durasi langsung di komponen.
 */
export const motionTokens = {
  duration: {
    fast: 0.18,
    normal: 0.35,
    slow: 0.6,
    hero: 0.8,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1] as const,
    enter: [0.16, 1, 0.3, 1] as const,
    exit: [0.4, 0, 1, 1] as const,
  },
  distance: {
    small: 8,
    medium: 20,
    large: 36,
  },
} as const

/**
 * Variasi transisi siap pakai.
 */
export const transitions = {
  fast: {
    duration: motionTokens.duration.fast,
    ease: motionTokens.ease.standard,
  },
  normal: {
    duration: motionTokens.duration.normal,
    ease: motionTokens.ease.enter,
  },
  slow: {
    duration: motionTokens.duration.slow,
    ease: motionTokens.ease.enter,
  },
  exit: {
    duration: motionTokens.duration.fast,
    ease: motionTokens.ease.exit,
  },
} as const
