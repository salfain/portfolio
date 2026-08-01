import 'server-only'

import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'

import { isValidStorageKey } from './key'
import type { StorageDriver } from './types'

/**
 * Penyimpanan di disk lokal — sementara, sampai Cloudflare R2 dipasang.
 *
 * Direktorinya SENGAJA di luar `public/`. Apa pun yang diletakkan di
 * `public/` dilayani langsung oleh server statis, tanpa melewati satu baris
 * pun kode kita — sementara `MediaAsset.isPublic` defaultnya `false` dan
 * bukti internal memang tidak boleh bisa dibuka siapa pun yang menebak
 * URL-nya. Berkas di sini hanya keluar lewat route handler yang memeriksa
 * status publik dan sesi admin.
 *
 * Batasnya jelas dan sudah dicatat: disk lokal tidak bertahan di hosting
 * serverless. Lihat docs/phase-5/NOTES.md N4.
 */
const ROOT = resolve(process.cwd(), 'var', 'uploads')

/**
 * Terjemahkan kunci menjadi path absolut, lalu pastikan hasilnya benar-benar
 * berada di dalam `ROOT`.
 *
 * Pemeriksaan pola di `isValidStorageKey` seharusnya sudah cukup. Ini lapis
 * kedua: yang dijaga bukan kesalahan ketik, melainkan kemungkinan bahwa
 * lapisan pertama suatu hari dilonggarkan oleh orang yang tidak tahu
 * konsekuensinya.
 */
function pathFor(key: string): string {
  if (!isValidStorageKey(key)) {
    throw new Error('INVALID_STORAGE_KEY')
  }

  const full = resolve(ROOT, key)

  if (full !== ROOT && !full.startsWith(ROOT + sep)) {
    throw new Error('INVALID_STORAGE_KEY')
  }

  return full
}

export const localStorageDriver: StorageDriver = {
  name: 'local',

  async put(key, data) {
    const full = pathFor(key)

    await mkdir(dirname(full), { recursive: true })
    await writeFile(full, data)
  },

  async get(key) {
    try {
      return await readFile(pathFor(key))
    } catch (error) {
      // Berkas tidak ada bukan kegagalan sistem — pemanggil membalas 404.
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        return null
      }

      throw error
    }
  },

  async delete(key) {
    try {
      await unlink(pathFor(key))
    } catch (error) {
      // Menghapus berkas yang sudah tidak ada dianggap berhasil: baris
      // database-nya tetap harus ikut terhapus, bukan tertinggal karena
      // berkasnya lebih dulu hilang.
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        return
      }

      throw error
    }
  },
}

/** Dipakai tes dan skrip pemeliharaan; bukan bagian dari antarmuka driver. */
export const LOCAL_UPLOAD_ROOT = ROOT

export function localPathForTest(key: string): string {
  return join(ROOT, key)
}
