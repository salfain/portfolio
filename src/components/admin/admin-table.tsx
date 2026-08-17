import { type CSSProperties, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

type AdminTableProps = {
  /** Judul kolom. Dirender mono huruf besar. */
  columns: string[]
  /**
   * Template kolom CSS grid, mis. `minmax(0,1fr) 120px 100px 80px`.
   * Dipakai baris kepala dan seluruh baris isi sekaligus supaya tidak
   * ada kemungkinan keduanya menyimpang.
   */
  template: string
  children: ReactNode
  className?: string
}

/**
 * Tabel daftar admin sebagai grid CSS.
 *
 * Dibuat dari `<div role="table">`, bukan `<table>`, karena setiap baris
 * memuat kontrol (tautan Ubah, dialog Hapus) dan grid membuat baris tetap
 * bisa dipadatkan menjadi satu kolom di layar sempit. Peran ARIA
 * dipasang eksplisit supaya pembaca layar tetap mengumumkannya sebagai
 * tabel beserta jumlah barisnya.
 *
 * Baris kepala disembunyikan di bawah `md`: pada satu kolom, judul kolom
 * yang melayang di atas tumpukan justru menyesatkan.
 */
export function AdminTable({
  columns,
  template,
  children,
  className,
}: AdminTableProps) {
  return (
    <div
      role="table"
      className={cn(
        'overflow-hidden rounded-3xl border border-border',
        className,
      )}
    >
      <div
        role="row"
        className="hidden gap-4 border-b border-border bg-elevated px-5 py-3 md:grid md:[grid-template-columns:var(--cols)]"
        style={{ '--cols': template } as CSSProperties}
      >
        {columns.map((column) => (
          <span
            key={column}
            role="columnheader"
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint"
          >
            {column}
          </span>
        ))}
      </div>

      {children}
    </div>
  )
}

type AdminTableRowProps = {
  template: string
  children: ReactNode
}

export function AdminTableRow({ template, children }: AdminTableRowProps) {
  return (
    <div
      role="row"
      className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 md:items-center md:[grid-template-columns:var(--cols)]"
      style={{ '--cols': template } as CSSProperties}
    >
      {children}
    </div>
  )
}

export function AdminTableCell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div role="cell" className={cn('min-w-0', className)}>
      {children}
    </div>
  )
}
