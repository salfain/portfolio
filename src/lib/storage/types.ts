/**
 * Antarmuka penyimpanan berkas.
 *
 * Sengaja sekecil ini supaya driver Cloudflare R2 nanti bisa menggantikan
 * driver lokal tanpa satu pun pemanggil ikut berubah. Yang TIDAK boleh
 * bocor ke antarmuka ini: path di disk, bucket, kredensial, atau apa pun
 * yang hanya dimiliki satu driver.
 *
 * `key` adalah identitas berkas di penyimpanan mana pun — bentuknya
 * `dokumen/<id>/<acak>.<ext>`, bukan nama berkas asli dari pengunggah.
 */
export type StorageDriver = {
  /** Nama driver, dicatat di jejak audit. */
  readonly name: string

  put(key: string, data: Buffer, contentType: string): Promise<void>

  /** `null` bila berkasnya tidak ada — pemanggil membalas 404, bukan 500. */
  get(key: string): Promise<Buffer | null>

  delete(key: string): Promise<void>
}
