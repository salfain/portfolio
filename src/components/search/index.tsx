'use client'

import dynamic from 'next/dynamic'

/**
 * Palette dimuat dinamis, di klien saja.
 *
 * Ia tidak pernah terlihat sampai seseorang menekan Ctrl+K atau tombolnya,
 * jadi tidak ada alasan isinya ikut turun bersama halaman pertama. Yang
 * ikut hanya tombol pemicunya.
 *
 * `ssr: false` juga menghindari render server untuk komponen yang seluruh
 * kegunaannya bergantung pada interaksi.
 */
export const CommandPalette = dynamic(
  () => import('./command-palette').then((mod) => mod.CommandPalette),
  {
    ssr: false,
    loading: () => (
      <span className="inline-block h-8 w-20 rounded-full bg-elevated" />
    ),
  },
)
