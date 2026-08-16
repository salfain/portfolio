import { ImageResponse } from 'next/og'

/**
 * Favicon, dibuat dari inisial pemilik situs.
 *
 * Tidak ada berkas gambar yang disalin dari mana pun — `public/` memang
 * kosong dan tetap kosong (CLAUDE.md aturan 5). Yang dirender hanya dua
 * huruf dari nama pemiliknya sendiri.
 *
 * Warna ditulis literal: berkas ini dirender di luar Tailwind, jadi token
 * CSS variable tidak tersedia. Nilainya sengaja disamakan dengan
 * `--primary` mode gelap supaya ikonnya tidak terasa asing di sebelah
 * situsnya.
 */
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b1220',
        color: '#f8fafc',
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        // Sudut membulat: ikon persegi penuh terlihat kasar di tab
        // peramban yang menampilkannya sekecil 16 piksel.
        borderRadius: 7,
      }}
    >
      SA
    </div>,
    size,
  )
}
