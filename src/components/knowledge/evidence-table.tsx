import type { ReactNode } from 'react'

/**
 * Tabel bukti teknis.
 *
 * Dibungkus `overflow-x-auto` karena rencana IP dan inventaris perangkat
 * hampir selalu lebih lebar dari layar ponsel — tanpa pembungkus ini
 * SELURUH halaman yang bergulir mendatar, bukan tabelnya, dan itu merusak
 * tata letak setiap bagian lain (temuan yang sama dengan tabel di renderer
 * dokumen, Fase 4).
 *
 * Baris kosong tidak pernah sampai ke sini: `parseTable` sudah membuangnya.
 */
export function EvidenceTable({
  caption,
  headers,
  rows,
}: {
  caption: string
  headers: string[]
  rows: ReactNode[][]
}) {
  if (rows.length === 0) return null

  return (
    <section className="mt-8">
      <h3 className="font-display text-lg font-semibold">{caption}</h3>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-elevated">
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="border-b border-border px-4 py-2.5 text-left font-medium"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-0">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2.5 align-top text-muted"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** Pasangan label–nilai untuk ringkasan di kepala blok. */
export function EvidenceFacts({
  facts,
}: {
  facts: { label: string; value: ReactNode }[]
}) {
  const filled = facts.filter((fact) => fact.value !== null && fact.value !== '')

  if (filled.length === 0) return null

  return (
    <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filled.map((fact) => (
        <div
          key={fact.label}
          className="rounded-2xl border border-border bg-surface p-4"
        >
          <dt className="text-xs uppercase tracking-wide text-muted">
            {fact.label}
          </dt>
          <dd className="mt-1 font-medium">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
