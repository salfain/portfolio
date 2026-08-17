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
       * TANPA `uppercase`, dan itu memang yang diminta handoff — chip di
       * sana ditulis "Database design", bukan "DATABASE DESIGN".
       *
       * Bukan sekadar selera. Isi chip ini bisa sepanjang "Administrasi
       * sistem & layanan infrastruktur TI". Huruf besar melebarkannya
       * sekitar 15% lagi, dan di kartu selebar sepertiga layar teksnya
       * membungkus DI DALAM pil — satu pil berisi dua baris terbaca
       * seperti kotak rusak, bukan seperti label.
       *
       * Huruf besar tetap dipakai untuk label pendek yang memang tetap:
       * kicker, dan status Terbit/Draf di admin.
       */
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1',
        'font-mono text-[11px] leading-normal',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
