# 02 — STYLING & DESIGN TOKEN

---

## 1. Aturan utama: jangan pernah menulis warna langsung

```tsx
// ❌ semuanya salah
<div className="bg-[#176BFF]">
<div className="text-blue-600">
<div style={{ color: '#0B1F35' }}>

// ✅
<div className="bg-primary text-primary-foreground">
```

Alasannya bukan kerapian. Warna yang ditulis langsung tidak ikut berubah saat tema gelap, jadi setiap satu di antaranya adalah cacat tema yang menunggu ditemukan.

Berlaku juga untuk kelas warna bawaan Tailwind (`text-blue-600`, `bg-slate-50`). Palet kita bukan palet Tailwind.

---

## 2. Token yang tersedia

Didefinisikan sebagai CSS variable dan otomatis berganti saat tema berubah.

| Token                            | Kegunaan                         | Terang                 | Gelap                  |
| -------------------------------- | -------------------------------- | ---------------------- | ---------------------- |
| `background`                     | Latar halaman                    | `#faf9f7`              | `#0c0c0d`              |
| `surface`                        | Latar kartu                      | `#ffffff`              | `#121214`              |
| `elevated`                       | Kartu di atas kartu, baris aktif | `#edece8`              | `#19191c`              |
| `input`                          | Latar kolom isian                | `#ffffff`              | `#0f0f11`              |
| `foreground`                     | Teks utama                       | `#17171a`              | `#ededed`              |
| `text-2`                         | Teks isi sekunder                | `#3a3a40`              | `#c9c9cc`              |
| `text-3`                         | Teks isi tersier                 | `#4a4a51`              | `#a8a8ac`              |
| `muted`                          | Keterangan                       | `#5c5c63`              | `#9a9a9d`              |
| `faint`                          | Label mono, metadata             | `#7a7a81`              | `#6a6a6e`              |
| `faint-2`                        | Teks footer                      | `#8b8b92`              | `#5f5f63`              |
| `border`                         | Pemisah dekoratif                | 0.10 hitam             | 0.09 putih             |
| `border-med`                     | Tepi kontrol sekunder, chip      | 0.13 hitam             | 0.12 putih             |
| `border-strong`                  | **Tepi input** — dijaga ≥3:1     | `#767678`              | `#6a6a6e`              |
| `border-hover`                   | Tepi saat disentuh               | 0.35 hitam             | 0.40 putih             |
| `primary`                        | Aksen tunggal, aksi utama        | `oklch(0.55 0.15 255)` | `oklch(0.78 0.15 255)` |
| `primary-hi`                     | Aksen saat disentuh              | `oklch(0.48 …)`        | `oklch(0.84 …)`        |
| `success` / `warning` / `danger` | Status                           | —                      | —                      |

Token garis disimpan sebagai warna SOLID hasil perataan nilai `rgba()` di handoff terhadap latar masing-masing tema. Itu disengaja: Tailwind memakai bentuk `rgb(var(--token) / <alpha>)`, yang menuntut tiga kanal angka, bukan `rgba()` utuh.

**`border-strong` menyimpang dari handoff.** Nilai `line-strong` aslinya hanya mencapai ~1.2:1 di latar terang, sedangkan WCAG 1.4.11 menuntut 3:1 untuk batas kontrol yang bisa disentuh. Token ini dipakai KHUSUS untuk tepi input; garis dekoratif tetap memakai `border` atau `border-med`.

Beberapa nilai tidak melewati Tailwind karena memang bukan warna datar, dan dipakai lewat `var()` langsung: `--glass-bg`, `--glass-line`, `--accent-soft`, `--accent-glow`, `--accent-line`, `--stripe-a/b`, `--shadow-nav`, `--shadow-modal`.

**Butuh warna yang tidak ada di tabel ini? Berhenti dan tanya.** Menambah token adalah keputusan design system, bukan keputusan implementasi.

---

## 3. Tema gelap

Tema diatur lewat atribut `data-theme` di elemen `<html>`. Token sudah menangani pergantiannya, jadi **umumnya tidak perlu menulis varian `dark:` sama sekali**.

```tsx
// ❌ tidak perlu — token sudah menanganinya
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">

// ✅
<div className="bg-surface text-foreground">
```

Varian `dark:` hanya dipakai untuk hal yang benar-benar berbeda antar tema dan tidak bisa diungkapkan lewat token — misalnya kekuatan bayangan atau opasitas gradien:

```tsx
<div className="shadow-lg dark:shadow-none dark:ring-1 dark:ring-border">
```

Kalau menemukan diri menulis banyak `dark:`, kemungkinan besar tokennya yang salah pilih.

---

## 4. Bentuk & jarak

| Hal                      | Nilai                                          |
| ------------------------ | ---------------------------------------------- |
| Radius kartu             | `rounded-3xl` (22px) atau `rounded-2xl` (20px) |
| Radius modal             | `rounded-3xl` (22px)                           |
| Radius navbar            | `rounded-2xl` (20px)                           |
| Radius tombol/chip/badge | `rounded-full`                                 |
| Radius input             | `rounded-md` (12px)                            |
| Lebar kontainer maks     | `max-w-container` (1180px)                     |
| Lebar baca (artikel)     | `max-w-prose` (76ch)                           |
| Padding kontainer        | `px-5 sm:px-8 lg:px-12`                        |
| Padding kartu            | `p-6` – `p-7`                                  |
| Jarak antar bagian       | `border-t border-border py-14 md:py-16`        |

Jarak antar bagian dibawa oleh komponen `Section`, lewat `border-t` + padding — bukan margin per elemen. Bagian pertama di satu halaman menghapus garisnya sendiri lewat `first:border-t-0`.

Ruang kosong yang lega adalah bagian dari identitas visual situs ini. Kalau ragu antara dua nilai jarak, pilih yang lebih besar.

---

## 5. Tipografi

| Peran                   | Font                 | Kelas                 |
| ----------------------- | -------------------- | --------------------- |
| Judul                   | Instrument Serif 400 | `font-display`        |
| Isi                     | Geist 300–600        | `font-sans` (default) |
| Label / metadata / kode | Geist Mono           | `font-mono`           |

Skala judul:

```
hero  font-display text-display   clamp(52px, 7.4vw, 104px)
h1    font-display text-h1        clamp(44px, 6vw, 80px)
h2    font-display text-h2        clamp(30px, 3.4vw, 38px)
h3    text-[19px] font-medium     Geist, BUKAN serif
p     text-body                   17px / 1.65
```

**Instrument Serif hanya punya satu berat.** Jangan pernah memasangkan `font-display` dengan `font-semibold` atau `font-bold` — peramban akan mensintesis huruf tebal palsu dan bentuk serifnya rusak. Judul kartu berukuran `lg` ke bawah memakai Geist `font-medium`, bukan serif.

Label dan metadata memakai kelas `.kicker`: mono 11px, huruf besar, `tracking-[0.12em]`, warna `faint`.

Paragraf dirata kiri-kanan dengan pemenggalan kata lewat aturan dasar pada `p`. Aturan itu adalah selektor elemen, jadi ia MENGALAHKAN perataan yang diwariskan induk — blok `text-center` sudah ditangani oleh `.text-center p` di `globals.css`. Permukaan penyuntingan dikecualikan lewat `.prose-editor` / `.prose-admin`.

Font dimuat lewat `next/font` dan di-host sendiri. **Jangan pernah** memuat font dari CDN Google — itu menambah koneksi pihak ketiga dan merusak target LCP.

---

## 6. Urutan kelas Tailwind

Diurutkan otomatis oleh `prettier-plugin-tailwindcss`. Jangan diurutkan manual, jalankan saja formatter.

```bash
npm run format
```

---

## 7. Kelas kondisional

Pakai helper `cn()` (`clsx` + `tailwind-merge`), jangan template string:

```tsx
// ❌ kelas yang bertabrakan tidak akan diselesaikan
<div className={`px-4 ${isActive ? 'px-6' : ''}`}>

// ✅ px-6 menang dengan benar
<div className={cn('px-4', isActive && 'px-6')}>
```

---

## 8. Responsif

Mulai dari mobile, tambahkan breakpoint ke atas.

```tsx
// ❌ berpikir dari desktop
<div className="grid grid-cols-3 max-md:grid-cols-1">

// ✅ mobile-first
<div className="grid grid-cols-1 md:grid-cols-3">
```

Breakpoint uji wajib: **375 px**, **768 px**, **1440 px**.

**Tidak boleh ada scroll horizontal di 375 px.** Ini cacat paling sering ditemukan saat pemeriksaan. Penyebab tersering: tabel lebar, blok kode panjang, dan elemen `min-w-` yang lupa dibungkus. Bungkus dalam kontainer `overflow-x-auto`.

---

## 9. Target sentuh

Semua elemen yang bisa diklik minimal **44 × 44 px** di mobile. Ikon kecil ditambahi padding, bukan diperbesar ikonnya:

```tsx
// ✅ ikon 20px dengan area sentuh 44px
<button className="grid h-11 w-11 place-items-center rounded-full">
  <Sun className="h-5 w-5" />
</button>
```

---

## 10. Gambar

```tsx
<Image
  src={asset.fileUrl}
  alt={locale === 'id' ? asset.altId : (asset.altEn ?? asset.altId)}
  width={asset.width}
  height={asset.height}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

- `width` dan `height` **wajib** — tanpa itu CLS akan naik.
- `alt` **wajib**. Gambar dekoratif memakai `alt=""`.
- Hanya gambar di area hero yang memakai `priority`. Lebih dari itu justru merugikan.

---

## 11. Yang dilarang

| ❌                                                 | Kenapa                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| Warna hex atau `text-blue-500`                     | Rusak di tema gelap                                               |
| `!important` / `!` di Tailwind                     | Menandakan ada masalah spesifisitas lain                          |
| Berkas CSS terpisah per komponen                   | Pakai Tailwind                                                    |
| Nilai `style={{ }}` inline                         | Kecuali nilai yang benar-benar dinamis, misal tinggi progress bar |
| `w-[347px]` dan angka ajaib lain                   | Pakai skala jarak                                                 |
| Font dari CDN                                      | Pakai `next/font`                                                 |
| `overflow-hidden` untuk menutupi layout yang bocor | Perbaiki penyebabnya                                              |
