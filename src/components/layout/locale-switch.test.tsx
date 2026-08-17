import { describe, expect, it, vi, beforeEach } from 'vitest'
// fireEvent, bukan user-event: satu klik tombol tidak sebanding dengan
// menambah dependency baru ke proyek.
import { fireEvent, render, screen } from '@testing-library/react'

import { LocaleSwitch } from './locale-switch'

/**
 * `vi.hoisted` wajib di sini, bukan sekadar gaya penulisan.
 *
 * `vi.mock` diangkat ke atas berkas sebelum kode lain berjalan, jadi
 * factory-nya tidak boleh merujuk variabel modul biasa. Vitest 4 memakai
 * parser Rolldown yang menolak berkas ini dengan galat parse, bukan lagi
 * diam-diam bekerja seperti Vitest 3.
 */
const mock = vi.hoisted(() => ({
  replace: vi.fn(),
  pathname: '/knowledge/sop',
}))

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => mock.pathname,
  useRouter: () => ({ replace: mock.replace }),
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'id',
  // Label tidak diuji isinya, hanya keberadaannya sebagai nama aksesibel.
  useTranslations: () => (key: string) => key,
}))

function setSearch(search: string) {
  window.history.replaceState({}, '', `/id${mock.pathname}${search}`)
}

describe('LocaleSwitch', () => {
  beforeEach(() => {
    mock.replace.mockClear()
    mock.pathname = '/knowledge/sop'
    setSearch('')
  })

  it('mematikan lompatan ke atas saat berganti bahasa', async () => {
    // Pengunjung yang sedang membaca bagian tengah dokumen panjang ingin
    // membaca bagian yang sama dalam bahasa lain, bukan kembali ke judul.
    render(<LocaleSwitch />)

    fireEvent.click(screen.getByRole('button'))

    expect(mock.replace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ scroll: false }),
    )
  })

  it('berpindah ke locale lawannya', async () => {
    render(<LocaleSwitch />)

    fireEvent.click(screen.getByRole('button'))

    expect(mock.replace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ locale: 'en' }),
    )
  })

  it('membawa serta query string', async () => {
    // Tanpa ini, mengganti bahasa di halaman terfilter membuang seluruh
    // filter dan pengunjung harus menyaring ulang dari nol.
    setSearch('?q=dhcp&tag=vlan')

    render(<LocaleSwitch />)

    fireEvent.click(screen.getByRole('button'))

    expect(mock.replace).toHaveBeenCalledWith(
      '/knowledge/sop?q=dhcp&tag=vlan',
      expect.anything(),
    )
  })

  it('tidak menambahkan tanda tanya saat tidak ada query', async () => {
    render(<LocaleSwitch />)

    fireEvent.click(screen.getByRole('button'))

    expect(mock.replace).toHaveBeenCalledWith(
      '/knowledge/sop',
      expect.anything(),
    )
  })

  it('memanggil onNavigate sebelum berpindah', async () => {
    // Dipakai drawer mobile untuk menutup dirinya sendiri.
    const onNavigate = vi.fn()

    render(<LocaleSwitch onNavigate={onNavigate} />)

    fireEvent.click(screen.getByRole('button'))

    expect(onNavigate).toHaveBeenCalledOnce()
  })

  it('punya nama aksesibel', () => {
    render(<LocaleSwitch />)

    expect(screen.getByRole('button')).toHaveAccessibleName()
  })
})
