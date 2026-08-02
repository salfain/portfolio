import { NextResponse } from 'next/server'

import { searchEverything } from '@/data/search'

/**
 * Endpoint pencarian untuk command palette.
 *
 * Publik dan tanpa autentikasi — isinya memang dokumen yang sudah terbit,
 * dan `searchEverything` menyaring `status = 'PUBLISHED'` di kedua bagian
 * query-nya.
 *
 * Batas yang dipasang di sini bukan hiasan: setiap permintaan menjalankan
 * full-text query, jadi panjang kata kunci dibatasi dan hasilnya dipotong.
 * Pembatasan laju di tepi jaringan menyusul di Fase 8 bersama perlindungan
 * form kontak.
 */
export const dynamic = 'force-dynamic'

const MAX_QUERY_LENGTH = 120

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q') ?? ''
  const trimmed = query.trim().slice(0, MAX_QUERY_LENGTH)

  // Satu huruf mencocokkan hampir semua hal dan tidak berguna bagi siapa
  // pun; dibalas kosong tanpa menyentuh database.
  if (trimmed.length < 2) {
    return NextResponse.json(
      { hits: [] },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const hits = await searchEverything(trimmed)

    return NextResponse.json(
      { hits },
      // Hasil pencarian tidak di-cache bersama: ia berubah setiap kali
      // dokumen terbit, dan tidak ada yang mengunjunginya dua kali dengan
      // kata kunci sama cukup sering untuk sepadan.
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    // Isi galat tidak pernah diteruskan: pesan PostgreSQL bisa memuat
    // potongan query dan nama kolom.
    console.error('Pencarian gagal:', (error as Error)?.name)

    return NextResponse.json({ hits: [] }, { status: 500 })
  }
}
