/**
 * Pemberitahuan ke pemilik situs.
 *
 * Antarmuka sengaja sekecil ini supaya penyedia email nanti — SMTP,
 * Resend, apa pun — bisa menggantikan driver bawaan tanpa satu pun
 * pemanggil ikut berubah. Bentuknya sama dengan lapisan penyimpanan
 * (`src/lib/storage/`), dan alasannya sama: pilihan penyedia adalah
 * keputusan pemilik, bukan sesuatu yang boleh menyebar ke seluruh kode.
 *
 * Yang TIDAK boleh masuk ke antarmuka ini: alamat SMTP, kunci API, atau
 * bentuk pesan khas satu penyedia.
 */
export type Notification = {
  /** Ringkas, muncul sebagai subjek. */
  subject: string
  /** Isi teks polos. Tidak ada HTML — pemberitahuan bukan halaman. */
  body: string
  /**
   * Alamat pengirim asli, bila pemberitahuan ini berasal dari pesan
   * seseorang. Dipakai penyedia yang mendukung `Reply-To`, supaya membalas
   * langsung sampai ke orangnya.
   */
  replyTo?: string | null
}

export type Notifier = {
  /** Nama driver, dicatat di log dan jejak audit. */
  readonly name: string

  /**
   * Kirim pemberitahuan.
   *
   * TIDAK PERNAH melempar. Pemberitahuan yang gagal tidak boleh membuat
   * pesan kontak yang sudah tersimpan tampak gagal terkirim bagi
   * pengunjung — pesannya sudah aman di database, dan yang gagal hanya
   * kabarnya.
   */
  send(notification: Notification): Promise<{ delivered: boolean }>
}
