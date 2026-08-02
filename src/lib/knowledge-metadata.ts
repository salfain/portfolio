/**
 * Format tabel baris-per-entri untuk metadata terstruktur.
 *
 * Inventaris perangkat, rencana IP, kasus uji, dan kronologi insiden adalah
 * TABEL — bukan prosa. Menaruhnya di isi dokumen membuat setiap dokumen
 * memilih kolom dan urutannya sendiri, dan pembaca kehilangan satu-satunya
 * hal yang membuat bukti teknis bisa dibandingkan: bentuk yang sama.
 *
 * Cara mengisinya mengikuti pola yang sudah dipakai bagian naratif
 * (`narrative-format.ts`): satu entri per baris, kolom dipisah `|`. Alasannya
 * sama — antarmuka array dinamis di admin butuh banyak kode dan tetap lebih
 * lambat dipakai daripada mengetik satu blok teks.
 *
 * Modul ini murni: tidak menyentuh database, tidak mengimpor `server-only`,
 * dan karenanya bisa diuji langsung.
 */

/** Pisah satu baris menjadi kolom, buang spasi di tiap kolom. */
function columns(line: string): string[] {
  return line.split('|').map((column) => column.trim())
}

function lines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Ubah teks tabel menjadi daftar objek.
 *
 * Kolom yang kurang menjadi string kosong, bukan `undefined` — baris yang
 * setengah terisi tetap tampil apa adanya. Yang dibuang hanya baris yang
 * kolom pertamanya kosong, karena kolom pertama selalu identitas entri
 * (nama perangkat, segmen, id kasus uji) dan tanpa itu barisnya tidak
 * bisa dirujuk sama sekali.
 */
export function parseTable<K extends string>(
  text: string | null | undefined,
  keys: readonly K[],
): Record<K, string>[] {
  if (!text) return []

  return lines(text)
    .map((line) => {
      const values = columns(line)

      return Object.fromEntries(
        keys.map((key, index) => [key, values[index] ?? '']),
      ) as Record<K, string>
    })
    .filter((row) => row[keys[0] as K] !== '')
}

/** Kebalikannya — dipakai form admin untuk mengisi ulang textarea. */
export function toTableText<K extends string>(
  rows: Record<K, string>[] | null | undefined,
  keys: readonly K[],
): string {
  if (!rows) return ''

  return rows
    .map((row) =>
      keys
        .map((key) => row[key] ?? '')
        // Kolom kosong di ujung kanan dibuang supaya barisnya tidak
        // berakhir dengan deretan `|` yang membingungkan saat disunting.
        .join(' | ')
        .replace(/(\s*\|\s*)+$/, ''),
    )
    .join('\n')
}

// ─── Bentuk tabel per bagian ─────────────────────────────

export const DEVICE_KEYS = ['name', 'role', 'model', 'note'] as const
export const IP_PLAN_KEYS = ['segment', 'cidr', 'vlan', 'gateway'] as const
export const VLAN_KEYS = ['id', 'name', 'purpose'] as const
export const TEST_CASE_KEYS = [
  'id',
  'check',
  'expected',
  'actual',
  'status',
] as const
export const FAULT_KEYS = ['scenario', 'expected', 'actual', 'recovery'] as const
export const TIMELINE_KEYS = ['at', 'event'] as const

export type DeviceRow = Record<(typeof DEVICE_KEYS)[number], string>
export type IpPlanRow = Record<(typeof IP_PLAN_KEYS)[number], string>
export type VlanRow = Record<(typeof VLAN_KEYS)[number], string>
export type TestCaseRow = Record<(typeof TEST_CASE_KEYS)[number], string>
export type FaultRow = Record<(typeof FAULT_KEYS)[number], string>
export type TimelineRow = Record<(typeof TIMELINE_KEYS)[number], string>

/**
 * Status kasus uji.
 *
 * Nilai bebas dinormalkan ke tiga kemungkinan; apa pun yang tidak dikenal
 * menjadi `unknown`, BUKAN `pass`. Lab yang menampilkan centang hijau
 * karena penulisnya mengetik sesuatu yang tidak terbaca adalah bukti yang
 * berbohong — dan itu justru kebalikan dari gunanya halaman ini.
 */
export type TestStatus = 'pass' | 'fail' | 'blocked' | 'unknown'

const PASS = new Set(['pass', 'lulus', 'ok', 'berhasil', 'sesuai'])
const FAIL = new Set(['fail', 'gagal', 'tidak', 'tidak sesuai'])
const BLOCKED = new Set(['blocked', 'terhalang', 'tertunda', 'skip'])

export function normalizeTestStatus(value: string): TestStatus {
  const normalized = value.trim().toLowerCase()

  if (PASS.has(normalized)) return 'pass'
  if (FAIL.has(normalized)) return 'fail'
  if (BLOCKED.has(normalized)) return 'blocked'

  return 'unknown'
}
