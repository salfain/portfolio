import 'server-only'

import type { AdminState } from '@/lib/schemas/admin'

/**
 * Bungkus mutasi admin dengan penanganan galat yang seragam.
 *
 * `requireAdmin()` melempar `UNAUTHORIZED`; itu diterjemahkan menjadi
 * pesan yang bisa dibaca, bukan layar error putih. Galat lain tidak
 * pernah dibocorkan isinya ke klien — pesan Prisma bisa memuat nama
 * kolom dan potongan query.
 */
export async function runAdminMutation(
  mutate: () => Promise<void>,
  successMessage: string,
): Promise<AdminState> {
  try {
    await mutate()

    return { status: 'success', message: successMessage }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return {
        status: 'error',
        message: 'Sesi berakhir. Muat ulang halaman dan masuk kembali.',
      }
    }

    console.error('Mutasi admin gagal:', (error as Error)?.name)

    return {
      status: 'error',
      message: 'Gagal menyimpan. Coba lagi.',
    }
  }
}

/** Versi untuk aksi hapus yang dipanggil langsung dari klien. */
export async function runAdminDelete(
  mutate: () => Promise<void>,
): Promise<{ error?: string }> {
  try {
    await mutate()

    return {}
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { error: 'Sesi berakhir.' }
    }

    console.error('Hapus admin gagal:', (error as Error)?.name)

    return { error: 'Gagal menghapus.' }
  }
}
