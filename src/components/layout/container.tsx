import { type ElementType, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

type ContainerProps = {
  as?: ElementType
  children: ReactNode
  className?: string
}

/**
 * Lebar dan padding horizontal yang sama untuk seluruh rute publik.
 * Nilainya sudah dipakai navbar & footer sejak Fase 2 — dijadikan
 * satu komponen supaya tidak menyimpang saat halaman bertambah.
 */
export function Container({
  as: Component = 'div',
  children,
  className,
}: ContainerProps) {
  return (
    <Component
      className={cn('mx-auto max-w-container px-5 sm:px-8 lg:px-12', className)}
    >
      {children}
    </Component>
  )
}
