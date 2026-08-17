# 04 — ATURAN ANIMASI

---

## 1. Satu library saja

**Motion for React** (`motion`) adalah satu-satunya library animasi di proyek ini.

Dilarang: GSAP, react-spring, AOS, Anime.js, Lottie, `tailwindcss-animate` sebagai library animasi umum.

**Pengecualian yang diizinkan:** animasi CSS berbasis `data-state` bawaan Radix (dipakai shadcn/ui untuk buka/tutup dialog dan dropdown). Itu CSS, bukan library animasi JS, dan tidak melanggar aturan.

Transisi CSS biasa untuk hover dan fokus **lebih disukai** daripada Motion. Motion untuk animasi masuk, orkestrasi, dan gerakan berbasis scroll.

---

## 2. Token motion

Selalu dari `@/lib/motion`. Jangan menulis angka durasi langsung.

```ts
export const motionTokens = {
  duration: { fast: 0.18, normal: 0.35, slow: 0.6, hero: 0.8 },
  ease: {
    standard: [0.22, 1, 0.36, 1],
    enter: [0.16, 1, 0.3, 1],
    exit: [0.4, 0, 1, 1],
  },
  distance: { small: 8, medium: 20, large: 36 },
}
```

```tsx
// ❌
transition={{ duration: 0.42, ease: 'easeOut' }}

// ✅
transition={{ duration: motionTokens.duration.normal, ease: motionTokens.ease.enter }}
```

---

## 3. Hanya animasikan `transform` dan `opacity`

Keduanya berjalan di compositor dan tidak memicu layout.

| ✅ Aman   | ❌ Hindari                           |
| --------- | ------------------------------------ |
| `opacity` | `width`, `height`                    |
| `x`, `y`  | `top`, `left`, `margin`, `padding`   |
| `scale`   | `box-shadow` (pakai lapisan opacity) |
| `rotate`  | `filter: blur` pada area luas        |

Animasi tinggi dilakukan lewat `layout` prop Motion, bukan menganimasikan `height` secara manual.

---

## 4. Reduced motion — wajib

Setiap animasi harus menghormati `prefers-reduced-motion`. Ada hook untuk itu:

```tsx
'use client'
import { useReducedMotion } from 'motion/react'

export function Reveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={
        reduced ? false : { opacity: 0, y: motionTokens.distance.medium }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: motionTokens.duration.normal }}
    >
      {children}
    </motion.div>
  )
}
```

Yang harus terjadi saat reduced motion aktif:

| Efek                      | Perilaku                                    |
| ------------------------- | ------------------------------------------- |
| Reveal saat scroll        | Langsung tampil, tanpa gerakan              |
| Parallax                  | Mati total                                  |
| Kartu mengambang berulang | Mati total                                  |
| Transisi halaman          | Fade sangat singkat, atau tidak sama sekali |
| Hover scale               | Mati                                        |
| Progress bar scroll       | Tetap ada — ini informasi, bukan dekorasi   |

**Cara menguji:** Windows → Settings → Accessibility → Visual effects → Animation effects → Off. Lalu buka ulang halaman.

---

## 5. Larangan penting

### Konten tidak boleh tidak terlihat saat animasi gagal

```tsx
// ❌ kalau JS gagal, teksnya hilang selamanya
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
```

Selalu pakai `whileInView` dengan `viewport={{ once: true }}`, dan pastikan konten tetap terbaca mesin pencari. Jangan pernah menyembunyikan konten penting di balik animasi yang bergantung pada JavaScript.

### Jangan menganimasikan setiap paragraf

Animasikan **bagian**, bukan tiap elemen di dalamnya. Halaman yang setiap barisnya masuk satu per satu terasa lambat, bukan mewah.

### Jangan bergantung pada hover di mobile

Setiap informasi yang muncul saat hover harus juga tersedia lewat tap, atau memang tidak esensial.

### Jangan menggeser tata letak

Animasi masuk **tidak boleh** mengubah CLS. Ruang elemen sudah dipesan sebelum animasi mulai — itu sebabnya kita menganimasikan `y`, bukan `margin-top`.

---

## 6. Pola standar

Sudah tersedia di `@/components/motion/`. Pakai ini, jangan membuat sendiri:

| Komponen                           | Kegunaan                                   |
| ---------------------------------- | ------------------------------------------ |
| `<Reveal>`                         | Satu elemen muncul saat masuk viewport     |
| `<StaggerGroup>` + `<StaggerItem>` | Sekelompok kartu muncul berurutan          |
| `<HoverLift>`                      | Kartu terangkat saat hover, mati di mobile |
| `<PageTransition>`                 | Transisi antar halaman                     |

Stagger maksimal `0.06 s` per item dan maksimal 6 item. Lebih dari itu, item terakhir terasa tertinggal.

---

## 7. Anggaran waktu

- Seluruh animasi masuk hero: **≤ 1,5 detik** total.
- Halaman harus bisa diklik **segera**, tidak menunggu animasi selesai.
- Animasi berulang (kartu mengambang) berhenti saat tab tidak aktif.

---

## 8. Checklist sebelum PR

- [ ] Tidak ada angka durasi yang ditulis langsung
- [ ] Hanya `transform` dan `opacity` yang dianimasikan
- [ ] `useReducedMotion` dipakai, dan sudah diuji dengan pengaturan OS
- [ ] Konten tetap terlihat bila animasi tidak berjalan
- [ ] Tidak ada layout shift (periksa CLS di Lighthouse)
- [ ] Tidak ada informasi yang hanya muncul lewat hover
- [ ] Sudah dicoba di mobile 375 px
