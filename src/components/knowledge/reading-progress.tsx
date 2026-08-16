'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

/**
 * Bilah kemajuan membaca di tepi atas halaman.
 *
 * Dihitung dari scroll dokumen, bukan dari tinggi artikel: pembaca menilai
 * kemajuannya terhadap seluruh halaman yang mereka gulir.
 *
 * Diperbarui lewat `requestAnimationFrame` — event `scroll` bisa menyala
 * puluhan kali per frame, dan menulis style setiap kali memicu layout
 * berulang kali di antara paint.
 *
 * Tanpa animasi: elemennya sudah bergerak mengikuti scroll pengguna, jadi
 * `prefers-reduced-motion` tidak perlu perlakuan khusus — tidak ada gerak
 * tambahan yang tidak diminta.
 */
export function ReadingProgress() {
  const t = useTranslations('knowledge.detail')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight

      // Halaman yang tidak bisa digulir: tidak ada kemajuan untuk dilaporkan.
      if (scrollable <= 0) {
        setProgress(0)
        return
      }

      setProgress(
        Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)),
      )
    }

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== 0) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      role="progressbar"
      aria-label={t('readingProgress')}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent"
    >
      <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
    </div>
  )
}
