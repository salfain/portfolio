import 'server-only'

import type { Notifier } from './types'

export type { Notification, Notifier } from './types'

/**
 * Driver bawaan: mencatat ke log server.
 *
 * **Ini belum memberi tahu siapa pun.** Ia menulis ke log, dan log hanya
 * dibaca orang yang sudah membuka log. Disebutkan terang-terangan di sini
 * supaya tidak ada yang mengira masalahnya sudah selesai.
 *
 * Yang sudah bekerja tanpa driver ini: lencana jumlah pesan belum dibaca
 * di navigasi admin. Itu pun menuntut pemiliknya membuka `/admin`.
 *
 * Untuk benar-benar sampai ke pemiliknya dibutuhkan penyedia email, dan
 * itu keputusan pemilik: penyedia mana, dengan kunci siapa. Begitu
 * diputuskan, yang berubah hanya berkas ini.
 *
 * Isi pesan TIDAK ikut dicatat — hanya bahwa ada pesan masuk dan dari
 * siapa. Log server berumur panjang dan sering ikut terkirim ke layanan
 * pihak ketiga; isi pesan orang tidak boleh ikut ke sana.
 */
const logNotifier: Notifier = {
  name: 'log',

  async send(notification) {
    console.info(
      `[notifikasi] ${notification.subject}` +
        (notification.replyTo ? ` (balas ke: ${notification.replyTo})` : ''),
    )

    return { delivered: false }
  },
}

export const notifier: Notifier = logNotifier

/**
 * `true` bila pemberitahuan benar-benar sampai ke pemilik situs.
 *
 * Dipakai halaman admin untuk menampilkan peringatan jujur alih-alih
 * membiarkan pemiliknya mengira ia akan dikabari.
 */
export const notificationsReachOwner = notifier.name !== 'log'
