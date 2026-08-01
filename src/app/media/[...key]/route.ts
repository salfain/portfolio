import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth-policy'
import { findAssetByKey } from '@/data/media'
import { isValidStorageKey, storage } from '@/lib/storage'

/**
 * Penyaji berkas bukti.
 *
 * SETIAP berkas lewat sini. Tidak ada satu pun aset yang tinggal di
 * `public/`, karena berkas di sana dilayani server statis tanpa melewati
 * kode mana pun — dan bukti internal defaultnya privat.
 *
 * Aturan aksesnya satu kalimat: berkas dilayani ke publik hanya bila
 * `isPublic` DAN `redactionConfirmed` keduanya benar; selain itu wajib sesi
 * admin. Kombinasi yang sama persis dipakai query publik di
 * `src/data/knowledge.ts`, jadi tidak ada aset yang tampil di halaman tapi
 * ditolak saat gambarnya diambil, maupun sebaliknya.
 */
export const dynamic = 'force-dynamic'

async function isAdminRequest(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    return session !== null && isAdminRole(session.user.role)
  } catch {
    return false
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await params
  const key = segments.join('/')

  // Ditolak sebelum menyentuh database maupun disk. Kunci di sini datang
  // dari URL, jadi ia masukan yang belum dipercaya seperti masukan lain.
  if (!isValidStorageKey(key)) {
    return new NextResponse(null, { status: 404 })
  }

  const asset = await findAssetByKey(key)

  if (!asset) return new NextResponse(null, { status: 404 })

  const isPublic = asset.isPublic && asset.redactionConfirmed

  if (!isPublic && !(await isAdminRequest())) {
    /**
     * 404, bukan 403.
     *
     * 403 memberi tahu bahwa berkasnya ADA — dan keberadaan bukti internal
     * untuk suatu dokumen adalah informasi tersendiri. Aturan yang sama
     * berlaku untuk dokumen draft (05_ROUTE_AND_PRIORITY_MAP §6).
     */
    return new NextResponse(null, { status: 404 })
  }

  const data = await storage.get(key)

  if (!data) return new NextResponse(null, { status: 404 })

  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': asset.mimeType,
      'Content-Length': String(data.byteLength),
      /**
       * Aset privat tidak boleh menyangkut di cache bersama mana pun.
       *
       * Yang publik pun TIDAK dicap `immutable, 1 tahun`, meski isinya
       * memang tidak pernah berubah — kuncinya acak dan sekali pakai.
       * Yang bisa berubah bukan isinya, melainkan IZINNYA.
       *
       * Terverifikasi: setelah bukti publik pernah diambil lewat
       * `/_next/image`, pengoptimal Next menyimpan hasilnya sesuai
       * `max-age` dari sini. Dengan satu tahun, bukti yang ditarik kembali
       * dari publik tetap bisa diambil lewat pengoptimal selama setahun —
       * padahal alamat aslinya sudah membalas 404. Penarikan yang tidak
       * berlaku adalah penarikan yang hanya terlihat berhasil.
       *
       * Lima menit: penarikan berlaku dalam waktu yang bisa disebutkan,
       * dan gambar tetap ter-cache cukup lama untuk satu sesi membaca.
       * Lihat docs/phase-5/NOTES.md N7.
       */
      'Cache-Control': isPublic
        ? 'public, max-age=300, must-revalidate'
        : 'private, no-store',
      // Berkas yang tidak dirender sebagai gambar diunduh, tidak ditampilkan
      // di tab yang sama — mencegah HTML atau SVG yang lolos suatu hari
      // dieksekusi di origin yang sama dengan sesi admin.
      'Content-Disposition': asset.mimeType.startsWith('image/')
        ? 'inline'
        : 'attachment',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
