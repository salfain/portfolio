# FASE 2 — CATATAN DI LUAR CAKUPAN

## N1 — `<html lang>` tidak dinamis per-locale (SELESAI)

**Masalah awal (Fase 1):** Root layout statis tanpa `lang` per-locale. Nested layout tidak boleh render `<html>`.

**Upaya Fase 2:**
1. Baca `x-next-intl-locale` header di root layout → gagal saat static prerender (header kosong)
2. Fallback `x-invoke-path` parse → gagal (header tidak tersedia saat SSG)
3. `force-dynamic` → broke RSC (`net::ERR_ABORTED`), direvert

**Solusi akhir:** Pindah `<html lang={locale}>` ke `[locale]/layout.tsx` (punya `locale` param langsung dari segment). Root layout jadi pass-through (`return children`). Admin layout render `<html lang="id" data-theme="light">` sendiri.

**Hasil:** `/id` → `lang="id"` ✓, `/en` → `lang="en"` ✓

---

## Hydration warning dari next-themes

`next-themes` set `data-theme` di `<html>` pada client, server render kosong. `suppressHydrationWarning` di `<html>` menangani mismatch. Warning di console tidak fatal — umum di semua proyek next-themes.

---

## `next lint` deprecation

`next lint` deprecated, akan dihapus di Next.js 16. Migrasi ke ESLint CLI:
```
npx @next/codemod@canary next-lint-to-eslint-cli .
```
Ditangguhkan — tidak menghambat Fase 2.

---

## N4 — Lapisan skeuomorphism ditambahkan (1 Agustus 2026)

Atas permintaan pemilik, sistem visual Fase 2 diberi lapisan kedalaman.
Bukan penulisan ulang: token warna, tipografi, jarak, dan radius **tidak
berubah sama sekali**. Yang ditambahkan hanya permukaan.

### Empat kelas, satu sumber

Seluruh efek ditulis di `src/styles/globals.css`, di `@layer components`:

| Kelas | Dipakai untuk |
|---|---|
| `.sk-raised` | Kartu, navbar, tombol utama & sekunder |
| `.sk-raised-lg` | Dialog, drawer — melayang di atas halaman |
| `.sk-inset` | Input, textarea, blok perintah, empty state |
| `.sk-pressable` | Tombol: turun 1px saat ditekan |

Komponen memakainya lewat nama, tidak menyusun bayangan sendiri. Bayangan
yang ditulis ad hoc di banyak komponen adalah cara tercepat membuat arah
cahaya jadi tidak konsisten.

Sumber cahaya diasumsikan dari **atas**: sorot di tepi atas, bayangan di
tepi bawah. `.sk-inset` membalikkannya.

### Dua tema

`--sk-shadow` dan `--sk-shadow-strength` berbeda per tema. Di tema gelap,
bayangan hitam nyaris tak terlihat di latar gelap — yang membentuk
kedalaman justru garis sorot di tepi atas. Karena itu kekuatan bayangannya
dinaikkan (1 → 1.6) dan sorotnya dibuat lebih redup.

### Yang SENGAJA tidak dilakukan

- **Tidak mengubah warna teks atau latar.** Kontras teks tetap sama persis,
  jadi WCAG AA tidak ikut bergeser.
- **Tidak memakai tekstur bitmap.** Noise menaikkan berat halaman dan
  mengurangi keterbacaan teks kecil.
- **Tidak menyentuh `outline`.** Cincin fokus dirender di luar `box-shadow`,
  jadi tetap terlihat penuh di atas permukaan setebal apa pun. Terverifikasi:
  48 elemen di beranda masih membawa `focus-visible:outline-primary`.
- **Tombol `ghost` tidak diberi kedalaman.** Tombol tersier yang ikut
  menonjol meratakan hierarki visual dan pengguna kehilangan petunjuk mana
  aksi utamanya.

### Dimatikan pada tiga kondisi

| Kondisi | Alasan |
|---|---|
| `@media print` | Bayangan di atas kertas terbaca sebagai kotor keabu-abuan, menghabiskan tinta, menurunkan kontras — kebalikan dari kebutuhan Recruiter Mode |
| `prefers-contrast: more` | Gradien bertumpuk mengaburkan batas elemen |
| `forced-colors: active` | Mode kontras paksa sistem operasi |

`prefers-reduced-motion` sudah ditangani aturan global yang ada: transisi
`.sk-pressable` dipangkas jadi seketika, bukan hilang.

### Catatan untuk peninjauan

Skeuomorphism adalah pilihan gaya yang mencolok untuk portofolio yang
dibaca recruiter teknis. Implementasinya sengaja **restrained** — bayangan
tipis, gradien di bawah 5% opasitas — supaya terbaca sebagai material,
bukan sebagai tiruan tombol iOS 6.

Kalau ingin lebih tegas: naikkan opasitas di keempat kelas tersebut. Kalau
ingin dicabut: hapus `@layer components` itu dan kelasnya dari komponen —
tidak ada logika yang bergantung padanya.
