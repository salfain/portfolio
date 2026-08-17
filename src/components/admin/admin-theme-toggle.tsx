'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/cn'

/**
 * Pengalih tema khusus panel admin.
 *
 * Berbentuk pil berlabel ("Mode terang" / "Mode gelap"), bukan tombol
 * ikon seperti di rute publik: label di header admin sudah berupa teks
 * mono semua, dan satu ikon di antaranya justru menuntut ditebak.
 *
 * Sampai ter-mount, labelnya dikosongkan namun lebar tombol dibiarkan
 * apa adanya. Menebak tema di render server akan membuat tulisan
 * berkedip ke label yang salah pada muat pertama.
 */
export function AdminThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'
  const label = isDark ? 'Mode terang' : 'Mode gelap'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'inline-flex min-h-11 items-center whitespace-nowrap rounded-full',
        'border border-border-med px-3 py-1.5 font-mono text-xs uppercase tracking-[0.06em] text-muted',
        'transition-colors hover:border-border-hover hover:text-foreground',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      )}
    >
      {mounted ? label : <span className="sr-only">Ganti tema</span>}
    </button>
  )
}
