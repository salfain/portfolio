import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Kunci regresi untuk temuan N1 Fase 5.
 *
 * `loading.tsx` memasang Suspense boundary di SELURUH subtree segmennya.
 * Begitu boundary itu ada di atas rute yang memanggil `notFound()`, shell
 * halaman ter-flush lebih dulu dan status respons sudah terkirim sebagai
 * 200 — `notFound()` tidak bisa lagi mengubahnya menjadi 404.
 *
 * Akibatnya dokumen draft membalas 200 dan diindeks mesin pencari sebagai
 * halaman sah (05_ROUTE_AND_PRIORITY_MAP §6). Tes ini gagal bila ada yang
 * menambahkan `loading.tsx` di posisi berbahaya.
 *
 * Skeleton tetap boleh: pasang `<Suspense>` DI DALAM halaman yang tidak
 * pernah memanggil `notFound()` — lihat `components/knowledge/type-listing`.
 */

const APP_DIR = join(process.cwd(), 'src', 'app')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)

    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const files = walk(APP_DIR)

/** Direktori setiap `loading.tsx` — segmen yang dinaunginya. */
const loadingDirs = files
  .filter((file) => file.endsWith('/loading.tsx'))
  .map((file) => file.slice(0, -'/loading.tsx'.length))

/** Direktori setiap halaman yang memanggil `notFound()`. */
const notFoundPageDirs = files
  .filter((file) => file.endsWith('page.tsx'))
  .filter((file) => {
    const source = readFileSync(file, 'utf8')

    // Halaman bisa memanggil notFound() sendiri, atau lewat komponen yang
    // direndernya. Yang kedua tidak terbaca dari berkas rute, jadi setiap
    // rute ber-slug dinamis ikut dihitung berisiko.
    return source.includes('notFound(') || file.includes('[slug]')
  })
  .map((file) => file.slice(0, -'/page.tsx'.length))

describe('batas Suspense vs status 404', () => {
  it('tidak ada loading.tsx yang menaungi rute pemanggil notFound()', () => {
    const berbahaya = loadingDirs.flatMap((loadingDir) =>
      notFoundPageDirs
        .filter((pageDir) => pageDir.startsWith(loadingDir))
        .map((pageDir) => ({
          loading: `${relative(APP_DIR, loadingDir) || '.'}/loading.tsx`,
          rute: relative(APP_DIR, pageDir),
        })),
    )

    expect(berbahaya).toEqual([])
  })

  it('menemukan rute yang memang memanggil notFound()', () => {
    // Penjaga bagi tes di atas: kalau pemindaiannya berhenti menemukan
    // apa pun, tes pertama akan selalu hijau tanpa memeriksa apa-apa.
    expect(notFoundPageDirs.length).toBeGreaterThan(0)
  })
})
