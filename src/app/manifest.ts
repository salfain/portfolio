import type { MetadataRoute } from 'next'

/**
 * Web app manifest.
 *
 * Gunanya di sini bukan menjadikan situs ini aplikasi — tidak ada mode
 * offline dan tidak ada yang perlu dipasang. Yang dipakai peramban:
 * nama dan ikon saat halaman disimpan ke layar utama, dan warna bilah
 * alamat di Android.
 *
 * `start_url` menunjuk `/id` karena rute akar hanya mengalihkan; menyimpan
 * `/` berarti setiap pembukaan dari layar utama melewati satu redirect.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Muhammad Sya'ban Alfain — IT Support",
    short_name: 'MSA',
    description:
      'Portofolio dan Basis Pengetahuan IT Support: SOP, lab jaringan, dan laporan insiden.',
    start_url: '/id',
    display: 'standalone',
    background_color: '#0b1220',
    theme_color: '#0b1220',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
