import { ImageResponse } from 'next/og'

/**
 * Ikon untuk layar utama iOS.
 *
 * Ukurannya 180×180 dan TIDAK bersudut membulat — iOS memotong sudutnya
 * sendiri. Ikon yang sudah dibulatkan lebih dulu akan terlihat terpotong
 * dua kali.
 */
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1220',
          color: '#f8fafc',
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: '-0.04em',
        }}
      >
        SA
      </div>
    ),
    size,
  )
}
