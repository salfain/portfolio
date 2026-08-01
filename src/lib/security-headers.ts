/**
 * Header keamanan HTTP.
 *
 * Dipisah dari `next.config.ts` supaya bisa diuji — header keamanan yang
 * salah ketik tidak menghasilkan galat apa pun, ia hanya diam-diam tidak
 * berlaku. Itu jenis kegagalan yang paling lama tidak ketahuan.
 */

/**
 * Content-Security-Policy.
 *
 * ── Kenapa `script-src` mengizinkan `'unsafe-inline'` ──
 *
 * Next.js menyisipkan skrip inline untuk hidrasi (`self.__next_f.push`),
 * dan `next-themes` menyisipkan skrip inline yang menetapkan tema SEBELUM
 * halaman digambar — tanpa itu halaman berkedip putih di mode gelap.
 *
 * Menghilangkan `'unsafe-inline'` berarti memakai nonce, dan nonce berbeda
 * setiap permintaan. Konsekuensinya SELURUH halaman harus dirender dinamis;
 * tidak ada lagi yang bisa diprerender. Untuk situs yang hampir seluruhnya
 * statis, itu menukar performa yang nyata dengan perlindungan terhadap
 * jalur yang aplikasi ini memang sudah tutup dengan cara lain:
 *
 * - Isi dokumen dirender dari JSON oleh `prosemirror/render.tsx`, yang
 *   TIDAK PERNAH menyisipkan HTML mentah.
 * - Satu-satunya `dangerouslySetInnerHTML` adalah JSON-LD, isinya selalu
 *   hasil `JSON.stringify` dengan `<` dilolos.
 * - Unggahan berkas ditentukan jenisnya dari magic bytes; HTML dan SVG
 *   ditolak.
 *
 * Yang TETAP dijaga CSP ini meski `'unsafe-inline'` ada: skrip dari domain
 * lain ditolak (`'self'`), `<object>`/`<embed>` ditolak seluruhnya,
 * halaman tidak bisa dibingkai situs lain, `<base>` tidak bisa dibajak,
 * dan form tidak bisa mengirim ke origin lain.
 *
 * Bila suatu saat nonce dipakai, tempatnya di middleware — bukan di sini.
 * Lihat docs/phase-8/NOTES.md N1.
 */
export function contentSecurityPolicy(isDevelopment: boolean): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],

    // `'unsafe-eval'` HANYA di pengembangan: React Fast Refresh
    // membutuhkannya. Ia tidak pernah ikut ke produksi.
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ],

    // Tailwind menghasilkan berkas CSS biasa, tapi Next menyisipkan
    // beberapa gaya inline untuk font dan gambar.
    'style-src': ["'self'", "'unsafe-inline'"],

    // `data:` dibutuhkan gambar placeholder next/image. Tidak ada host
    // luar: seluruh bukti disajikan dari origin sendiri lewat /media.
    'img-src': ["'self'", 'data:', 'blob:'],

    'font-src': ["'self'", 'data:'],

    // `/api/search` dan aksi server semuanya se-origin. Di pengembangan,
    // websocket Fast Refresh perlu diizinkan.
    'connect-src': ["'self'", ...(isDevelopment ? ['ws:'] : [])],

    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
  }

  const policy = Object.entries(directives)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ')

  // Di produksi saja: memaksa HTTPS pada sub-sumber daya. Di pengembangan
  // ia akan memblokir http://localhost.
  return isDevelopment ? policy : `${policy}; upgrade-insecure-requests`
}

export function securityHeaders(
  isDevelopment: boolean,
): { key: string; value: string }[] {
  return [
    {
      key: 'Content-Security-Policy',
      value: contentSecurityPolicy(isDevelopment),
    },
    {
      /**
       * Situs ini tidak pernah dimaksudkan tampil di dalam frame situs
       * lain. `frame-ancestors` di CSP sudah menanganinya untuk peramban
       * modern; header ini untuk yang belum.
       */
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      // Mencegah peramban menebak tipe konten. Berpasangan dengan
      // penentuan jenis berkas dari magic bytes di lapisan unggahan.
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      /**
       * Alamat halaman tetap terkirim ke sesama origin, tapi ke luar hanya
       * nama domain. Halaman admin dan pratinjau dokumen draft punya URL
       * yang isinya sendiri sudah informasi.
       */
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      /**
       * Situs portofolio tidak butuh satu pun dari ini. Menutupnya lebih
       * awal berarti fitur yang tidak pernah diminta tidak bisa diminta
       * diam-diam oleh skrip pihak ketiga yang suatu hari masuk.
       */
      key: 'Permissions-Policy',
      value: [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'interest-cohort=()',
      ].join(', '),
    },
    // HSTS hanya berarti di HTTPS, dan memasangnya saat pengembangan di
    // http://localhost akan mengunci peramban ke HTTPS untuk localhost —
    // merepotkan seluruh proyek lain di mesin yang sama.
    ...(isDevelopment
      ? []
      : [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ]),
  ]
}
