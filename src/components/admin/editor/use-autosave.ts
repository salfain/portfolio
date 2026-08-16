'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Pemulihan lokal, BUKAN draft server.
 *
 * Yang disimpan adalah naskah yang belum sempat dikirim — supaya tab yang
 * tertutup atau peramban yang mati tidak menghapus satu jam pekerjaan.
 * Simpanan ini tidak pernah menjadi sumber kebenaran: begitu form berhasil
 * dikirim, salinannya dibuang dan database yang berlaku.
 *
 * Tidak dipakai untuk mengirim otomatis ke server. Menyimpan diam-diam ke
 * database berarti dokumen terbit bisa berubah tanpa pemiliknya menekan
 * apa pun — dan perubahan isi terbit wajib lewat konfirmasi redaksi.
 */

const PREFIX = 'kb-draft:'
const DEBOUNCE_MS = 800

export type RecoveredDraft = {
  json: string
  savedAt: number
}

function read(key: string): RecoveredDraft | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)

    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as RecoveredDraft).json === 'string' &&
      typeof (parsed as RecoveredDraft).savedAt === 'number'
    ) {
      return parsed as RecoveredDraft
    }

    return null
  } catch {
    // localStorage bisa dimatikan atau penuh. Editor harus tetap jalan.
    return null
  }
}

export function useAutosave(key: string, enabled = true) {
  const [recovered, setRecovered] = useState<RecoveredDraft | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Simpanan hanya dibaca sekali saat editor dipasang. Membacanya ulang
  // setiap render akan memunculkan lagi tawaran pemulihan yang sudah
  // ditolak penulis.
  useEffect(() => {
    if (!enabled) return

    setRecovered(read(key))
  }, [key, enabled])

  const save = useCallback(
    (json: string) => {
      if (!enabled) return

      if (timer.current) clearTimeout(timer.current)

      timer.current = setTimeout(() => {
        try {
          window.localStorage.setItem(
            PREFIX + key,
            JSON.stringify({ json, savedAt: Date.now() }),
          )
        } catch {
          // Kuota penuh — abaikan. Kehilangan autosave jauh lebih ringan
          // daripada editor yang berhenti menerima ketikan.
        }
      }, DEBOUNCE_MS)
    },
    [key, enabled],
  )

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)

    try {
      window.localStorage.removeItem(PREFIX + key)
    } catch {
      // Sama seperti di atas.
    }

    setRecovered(null)
  }, [key])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return { recovered, save, dismiss: () => setRecovered(null), clear }
}
