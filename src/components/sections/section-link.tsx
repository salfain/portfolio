import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

type SectionLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
}

/**
 * Tautan "lihat semua" di kanan judul bagian: label mono huruf besar
 * dengan panah.
 *
 * Panahnya `aria-hidden` — pembaca layar sudah membacakan teks tautannya,
 * dan "panah kanan" di belakangnya hanya menambah bunyi tanpa makna.
 */
export function SectionLink({ href, children, className }: SectionLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-sm',
        'font-mono text-[11px] uppercase tracking-[0.12em] text-muted',
        'transition-colors hover:text-primary',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        className,
      )}
    >
      {children}
      <span aria-hidden>&rarr;</span>
    </Link>
  )
}
