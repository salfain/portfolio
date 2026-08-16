import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Kunci kriteria terima Fase 8: **draft tidak bisa diakses tanpa
 * otorisasi**, dan lebih luas lagi — tidak ada jalur admin yang lolos
 * tanpa guard.
 *
 * Diperiksa dengan memindai sumber, bukan dengan menjalankan aplikasi.
 * Alasannya: satu fungsi baru yang lupa memanggil `requireAdmin()` tidak
 * akan pernah gagal di tes fungsional mana pun — ia justru BERHASIL,
 * hanya saja untuk orang yang seharusnya ditolak. Yang bisa menangkapnya
 * hanyalah pemeriksaan yang menuntut guard-nya ADA.
 *
 * Ini menggantikan pemeriksaan manual sekali jalan yang dipakai fase-fase
 * sebelumnya. Pemeriksaan manual tidak berjalan lagi setelah orangnya
 * selesai memeriksa.
 */

const SRC = join(process.cwd(), 'src')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)

    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const files = walk(SRC).filter(
  (file) => file.endsWith('.ts') || file.endsWith('.tsx'),
)

const source = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]))
const rel = (file: string) => relative(SRC, file)

/** Nama fungsi yang menandakan jalur admin. */
const ADMIN_PREFIXES = ['getAdmin', 'save', 'delete', 'update', 'upload', 'set']

const GUARDS = ['requireAdmin(', 'requireAdminPage(']

/**
 * Potongan sumber milik satu fungsi: dari deklarasinya sampai `export`
 * berikutnya.
 *
 * Versi pertama tes ini mencari `{` pembuka lalu menghitung kurung sampai
 * sepadan — dan tertipu dua kali oleh `{` yang bukan badan fungsi:
 * parameter berdefault `= {}` dan tipe kembalian
 * `Promise<{ error?: ... }>`. Keduanya membuat badan fungsi terbaca kosong,
 * sehingga guard yang ADA dilaporkan hilang.
 *
 * Memotong sampai `export` berikutnya memang mengambil sedikit lebih
 * banyak (komentar penutup berkas), tapi tidak pernah mengambil fungsi
 * lain — dan itu satu-satunya yang penting di sini.
 */
function functionSlice(text: string, startIndex: number): string {
  const next = text.indexOf('\nexport ', startIndex + 1)

  return next === -1 ? text.slice(startIndex) : text.slice(startIndex, next)
}

type Finding = { file: string; fn: string }

describe('otorisasi lapisan data', () => {
  const dataFiles = files.filter(
    (file) =>
      file.includes(`${join('src', 'data')}`) &&
      !file.endsWith('.test.ts') &&
      !file.endsWith('_guards.ts'),
  )

  it('menemukan berkas data untuk diperiksa', () => {
    // Penjaga bagi tes di bawah: kalau pemindaiannya berhenti menemukan
    // apa pun, seluruh tes ini akan hijau tanpa memeriksa apa-apa.
    expect(dataFiles.length).toBeGreaterThan(5)
  })

  it('setiap fungsi admin memanggil guard di badannya', () => {
    const tanpaGuard: Finding[] = []

    for (const file of dataFiles) {
      const text = source.get(file) ?? ''
      const pattern = /export async function (\w+)/g

      for (const match of text.matchAll(pattern)) {
        const name = match[1] ?? ''

        if (!ADMIN_PREFIXES.some((prefix) => name.startsWith(prefix))) continue

        const body = functionSlice(text, match.index ?? 0)

        // `findAssetByKey` sengaja tanpa guard — pemanggilnya (penyaji
        // berkas) yang memutuskan, dan itu terdokumentasi di sumbernya.
        if (name === 'findAssetByKey') continue

        if (!GUARDS.some((guard) => body.includes(guard))) {
          tanpaGuard.push({ file: rel(file), fn: name })
        }
      }
    }

    expect(tanpaGuard).toEqual([])
  })
})

describe('otorisasi server action', () => {
  const actionFiles = files.filter((file) =>
    (source.get(file) ?? '').startsWith("'use server'"),
  )

  it('menemukan berkas server action untuk diperiksa', () => {
    expect(actionFiles.length).toBeGreaterThan(3)
  })

  /**
   * Setiap action yang mengubah data harus memanggil guard-nya sendiri —
   * bukan mengandalkan halaman yang merendernya. Server action bisa
   * dipanggil langsung lewat HTTP tanpa pernah melewati halaman mana pun.
   */
  it('setiap server action publik memanggil guard atau helper ber-guard', () => {
    const tanpaGuard: Finding[] = []

    for (const file of actionFiles) {
      const text = source.get(file) ?? ''

      // Berkas kontak publik memang tidak boleh menuntut admin.
      if (file.includes(join('contact'))) continue

      const pattern = /export async function (\w+)/g

      for (const match of text.matchAll(pattern)) {
        const name = match[1] ?? ''
        const body = functionSlice(text, match.index ?? 0)

        const dijaga =
          GUARDS.some((guard) => body.includes(guard)) ||
          // Helper ini memanggil guard di dalamnya; keduanya diuji
          // terpisah di `_guards.test.ts`.
          body.includes('runAdminDelete') ||
          body.includes('runAdminMutation') ||
          body.includes('deleteWithReason')

        if (!dijaga) tanpaGuard.push({ file: rel(file), fn: name })
      }
    }

    expect(tanpaGuard).toEqual([])
  })
})

describe('penyaringan status pada query publik', () => {
  /**
   * Setiap fungsi publik di `knowledge.ts` harus menyaring status. Draft
   * yang bocor lewat listing bukan bug tampilan — ia penerbitan yang tidak
   * pernah diminta.
   *
   * `PUBLISHED` adalah konstanta `{ status: 'PUBLISHED' }` di berkas itu.
   */
  it('knowledge.ts menyaring PUBLISHED di setiap query publik', () => {
    const file = join(SRC, 'data', 'knowledge.ts')
    const text = source.get(file) ?? ''

    expect(text).toContain("const PUBLISHED = { status: 'PUBLISHED' }")

    const tanpaFilter: string[] = []
    const pattern = /(?:export async function|export const) (\w+)/g

    for (const match of text.matchAll(pattern)) {
      const name = match[1] ?? ''

      if (!name.startsWith('get')) continue

      const body = functionSlice(text, match.index ?? 0)

      // Fungsi yang tidak menyentuh tabel dokumen tidak perlu menyaring.
      if (!body.includes('prisma.')) continue

      const menyaring =
        body.includes('PUBLISHED') ||
        body.includes("status: 'PUBLISHED'") ||
        // Revisi diambil lewat dokumen yang sudah tersaring; relasinya
        // sendiri tidak punya status.
        name === 'getDocumentRevisions' ||
        // Kategori dan tag bukan entitas berstatus.
        name.startsWith('getKnowledge') ||
        // Fungsi admin tidak menyaring status PUBLISHED karena admin berhak melihat draft/arsip.
        name.startsWith('getAdmin') ||
        name === 'getDocumentsForExport'

      if (!menyaring) tanpaFilter.push(name)
    }

    expect(tanpaFilter).toEqual([])
  })

  it('media publik selalu disaring isPublic DAN redactionConfirmed', () => {
    const text = source.get(join(SRC, 'data', 'knowledge.ts')) ?? ''

    expect(text).toContain('isPublic: true')
    expect(text).toContain('redactionConfirmed: true')
  })
})

describe('rute yang tidak boleh dijangkau tanpa sesi', () => {
  /**
   * Setiap halaman di bawah `src/app/admin` harus dirender lewat
   * `AdminShell`, yang memanggil `requireAdminPage()` — kecuali halaman
   * login itu sendiri.
   *
   * Middleware juga menjaganya, tapi middleware tidak dijamin berjalan di
   * setiap jalur pemanggilan (temuan N0 Fase 3). Ini lapisan yang
   * menentukan.
   */
  it('setiap halaman admin memakai AdminShell atau guard langsung', () => {
    const adminPages = files.filter(
      (file) =>
        file.includes(join('src', 'app', 'admin')) &&
        file.endsWith('page.tsx') &&
        !file.includes(join('admin', 'login')),
    )

    expect(adminPages.length).toBeGreaterThan(5)

    const tanpaGuard = adminPages.filter((file) => {
      const text = source.get(file) ?? ''

      return !text.includes('AdminShell') && !text.includes('requireAdminPage')
    })

    expect(tanpaGuard.map(rel)).toEqual([])
  })
})
