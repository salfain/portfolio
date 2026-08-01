/**
 * Lolos karakter yang punya arti khusus di XML.
 *
 * Dipisah dari rute RSS supaya bisa diuji: judul dokumen ditulis manusia
 * dan cepat atau lambat akan memuat `&` atau `<`. Satu saja yang lolos
 * membuat SELURUH umpan gagal diurai — bukan satu entri yang rusak,
 * melainkan seluruh berkasnya ditolak pembaca RSS.
 *
 * `&` harus diganti PERTAMA. Kalau tidak, `&` dari hasil penggantian
 * sebelumnya (`&lt;`) ikut diganti lagi menjadi `&amp;lt;`.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
