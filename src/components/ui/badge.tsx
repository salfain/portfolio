import { type HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

/**
 * Chip pil. Status terbit memakai aksen solid, status draf memakai
 * garis tepi — perbedaannya harus terbaca tanpa membaca teksnya.
 */
const variantClasses: Record<Variant, string> = {
  default: 'border border-border-med text-muted',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      /**
       * Ukurannya sengaja lebih kecil daripada teks di sekitarnya.
       *
       * Chip ini berisi nama alat dan keahlian yang bisa sepanjang
       * "Network Laboratory Administration". Dengan huruf besar,
       * `tracking` 0.12em, dan padding lebar, satu chip bisa memakan
       * hampir setengah baris — barisnya jadi penuh oleh keterangan,
       * bukan oleh isi. Tracking diturunkan ke 0.06em karena huruf besar
       * sudah memberi jarak optiknya sendiri.
       */
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1',
        'font-mono text-[10px] uppercase leading-normal tracking-[0.06em]',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
