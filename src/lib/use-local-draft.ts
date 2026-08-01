'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Simpan salinan draf di `localStorage`, pulihkan bila ada yang tertinggal.
 *
 * Bukan pengganti tombol Simpan — ini jaring pengaman untuk tab yang
 * tertutup, peramban yang mati, atau sesi yang habis di tengah menulis
 * dokumen panjang. Menulis SOP bisa memakan puluhan menit, dan kehilangan
 * semuanya karena satu kecelakaan adalah kegagalan yang paling menyakitkan
 * dari sebuah CMS.
 *
 * Disimpan di klien, bukan server: draf setengah jadi tidak perlu menyentuh
 * database, dan menyimpannya di server berarti draf itu ikut ke backup dan
 * ekspor tanpa pernah lolos checklist redaksi.
 */

const PREFIX = 'portfolio.draft.'
/** Draf lebih tua dari ini dianggap basi dan tidak ditawarkan. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export type LocalDraft<T> = {
  savedAt: number
  data: T
}

export function useLocalDraft<T>(
  key: string,
  /** Jeda diam sebelum menulis, supaya tidak menulis tiap ketikan. */
  debounceMs = 1500,
) {
  const storageKey = `${PREFIX}${key}`
  const [recovered, setRecovered] = useState<LocalDraft<T> | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)

  // Baca sekali saat mount. Draf basi dibuang, bukan ditawarkan — menawarkan
  // pemulihan dari dua minggu lalu lebih membingungkan daripada membantu.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)

      if (!raw) return

      const parsed = JSON.parse(raw) as LocalDraft<T>

      if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
        window.localStorage.removeItem(storageKey)
        return
      }

      setRecovered(parsed)
    } catch {
      // localStorage bisa ditolak (mode privat, kuota penuh, kebijakan
      // situs). Autosave adalah kemewahan — kegagalannya tidak boleh
      // mengganggu penyuntingan.
      window.localStorage?.removeItem?.(storageKey)
    }
  }, [storageKey])

  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  const save = useCallback(
    (data: T) => {
      window.clearTimeout(timer.current)

      timer.current = window.setTimeout(() => {
        try {
          const payload: LocalDraft<T> = { savedAt: Date.now(), data }

          window.localStorage.setItem(storageKey, JSON.stringify(payload))
          setSavedAt(payload.savedAt)
        } catch {
          // Kuota penuh atau ditolak — diamkan.
        }
      }, debounceMs)
    },
    [storageKey, debounceMs],
  )

  /** Dipanggil setelah simpan ke server berhasil. */
  const clear = useCallback(() => {
    window.clearTimeout(timer.current)

    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // Diamkan.
    }

    setSavedAt(null)
    setRecovered(null)
  }, [storageKey])

  const dismissRecovered = useCallback(() => setRecovered(null), [])

  return { recovered, savedAt, save, clear, dismissRecovered }
}
