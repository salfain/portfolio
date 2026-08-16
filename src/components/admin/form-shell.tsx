'use client'

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui'
import type { AdminState } from '@/lib/schemas/admin'

const initialState: AdminState = { status: 'idle' }

type FormShellProps = {
  action: (state: AdminState, formData: FormData) => Promise<AdminState>
  submitLabel?: string
  /** Form berisi editor butuh ruang lebih dari kolom 2xl. */
  wide?: boolean
  /** Menerima error per-field supaya bisa diteruskan ke tiap input. */
  children: (fieldErrors: Record<string, string>) => ReactNode
}

/**
 * Kerangka form admin: menjalankan server action, menampilkan hasilnya,
 * dan mengoper error per-field ke input yang bersangkutan.
 *
 * ── Kenapa TIDAK memakai `<form action={formAction}>` ──
 *
 * React 19 MERESET seluruh field tak-terkendali begitu action selesai —
 * termasuk saat action mengembalikan galat validasi. Akibatnya form yang
 * ditolak karena satu field salah mengosongkan SEMUA isian, dan yang
 * tersisa di layar cuma pesan "Periksa kembali isian yang ditandai" di
 * atas form yang sudah kembali ke nilai awal. Terverifikasi di peramban
 * pada React 19.2 (docs/phase-5/NOTES.md N2).
 *
 * Dengan `onSubmit` + `startTransition`, action tetap berjalan lewat
 * `useActionState` — status, pesan, dan error per-field tidak berubah
 * sedikit pun — tapi React tidak lagi menganggapnya "form action" yang
 * perlu direset.
 *
 * Yang hilang: pengiriman form tanpa JavaScript. Antarmuka admin memang
 * sudah menuntut JavaScript (editor Tiptap), dan rute publik tidak
 * memakai komponen ini sama sekali — form kontak punya jalurnya sendiri.
 */
export function FormShell({
  action,
  submitLabel = 'Simpan',
  wide = false,
  children,
}: FormShellProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {}
  const formRef = useRef<HTMLFormElement>(null)

  /**
   * Karena form tidak lagi direset otomatis, centang yang HARUS diulang
   * setiap kali kirim tidak boleh ikut bertahan.
   *
   * Ini berlaku untuk konfirmasi redaksi: nilainya sengaja tidak disimpan
   * ke database supaya penerbitan berikutnya menuntut pemeriksaan ulang.
   * Kalau centangnya tetap menyala setelah simpan berhasil, penerbitan
   * kedua lolos tanpa siapa pun benar-benar memeriksa apa pun.
   */
  useEffect(() => {
    if (state.status !== 'success' || !formRef.current) return

    formRef.current
      .querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"][data-reset-on-success]',
      )
      .forEach((input) => {
        input.checked = false
      })
  }, [state])

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        startTransition(() => formAction(formData))
      }}
      className={cn('space-y-6', wide ? 'max-w-4xl' : 'max-w-2xl')}
      noValidate
    >
      {children(fieldErrors)}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      {state.status === 'success' ? (
        <p role="status" className="text-sm text-success">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={isPending}>
        {isPending ? 'Menyimpan…' : submitLabel}
      </Button>
    </form>
  )
}
