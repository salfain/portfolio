/**
 * Kunci objek dibuat dan diperiksa di sini, terpisah dari driver.
 *
 * Driver lokal menerjemahkan kunci menjadi path di disk, jadi kunci yang
 * memuat `..` atau diawali `/` bisa menulis maupun membaca berkas di luar
 * direktori unggahan. Kunci datang dari database — tapi juga dari URL
 * penyaji berkas, yang bisa diketik siapa saja.
 *
 * Daftar-izin karakter, bukan daftar-larang: penyandian aneh seperti
 * `%2e%2e` atau `..%2f` tidak perlu dipikirkan satu per satu karena
 * karakternya memang tidak lolos sejak awal.
 */
const KEY_PATTERN = /^[a-z0-9][a-z0-9/_-]*\.[a-z0-9]{1,8}$/

export function isValidStorageKey(key: string): boolean {
  if (key.length > 300) return false
  if (key.includes('..')) return false
  if (key.includes('//')) return false

  return KEY_PATTERN.test(key)
}

/**
 * Kunci baru untuk satu berkas.
 *
 * Nama berkas asli TIDAK dipakai sama sekali. Nama dari pengunggah bisa
 * memuat path, karakter kontrol, atau — yang paling sering terlupa —
 * informasi yang justru harus diredaksi, seperti nama instansi di
 * `screenshot-router-kantor-pusat.png`.
 */
export function buildStorageKey(input: {
  documentId: string
  extension: string
  random: string
}): string {
  return `dokumen/${input.documentId}/${input.random}.${input.extension}`
}
