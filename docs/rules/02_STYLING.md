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

| Token | Kegunaan | Terang | Gelap |
|---|---|---|---|
| `background` | Latar halaman | `#F5F8FC` | `#06111F` |
| `surface` | Latar kartu | `#FFFFFF` | `#0C1B2D` |
| `elevated` | Kartu di atas kartu | `#EEF4FA` | `#11253B` |
| `foreground` | Teks utama | `#0B1F35` | `#F4F8FC` |
| `muted` | Teks sekunder | `#5C6B7A` | `#A8B6C6` |
| `border` | Garis & pembatas | `#DDE6EF` | `#213A54` |
| `primary` | Aksi utama, tautan | `#176BFF` | `#5B9CFF` |
| `cyan` | Aksen kedua | `#18BDEB` | `#36D4F4` |
| `success` | Status berhasil | `#169B62` | `#42D392` |
| `warning` | Peringatan | `#D99A13` | `#F2BE4E` |
| `danger` | Error, tindakan merusak | `#D74646` | `#FF7070` |

Sumber: [`../02_DESIGN_AND_DATA.md`](../02_DESIGN_AND_DATA.md).

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

| Hal | Nilai |
|---|---|
| Radius kartu besar | `rounded-[28px]` |
| Radius kartu standar | `rounded-3xl` (24px) atau `rounded-2xl` (20px) |
| Radius tombol/badge | `rounded-full` |
| Radius input | `rounded-xl` |
| Lebar kontainer maks | `max-w-[1280px]` |
| Lebar baca (artikel) | `max-w-[76ch]` |
| Padding kontainer | `px-5 sm:px-8 lg:px-12` |
| Jarak antar bagian | `py-20 md:py-28 lg:py-32` |

Ruang kosong yang lega adalah bagian dari identitas visual situs ini. Kalau ragu antara dua nilai jarak, pilih yang lebih besar.

---

## 5. Tipografi

| Peran | Font | Kelas |
|---|---|---|
| Display / judul | Plus Jakarta Sans | `font-display` |
| Isi | Geist / Inter | `font-sans` (default) |
| Kode | JetBrains Mono | `font-mono` |

Skala judul:

```
h1  text-4xl md:text-5xl lg:text-6xl  font-display font-semibold tracking-tight
h2  text-3xl md:text-4xl              font-display font-semibold tracking-tight
h3  text-xl  md:text-2xl              font-display font-medium
p   text-base md:text-lg              leading-relaxed text-muted
```

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

| ❌ | Kenapa |
|---|---|
| Warna hex atau `text-blue-500` | Rusak di tema gelap |
| `!important` / `!` di Tailwind | Menandakan ada masalah spesifisitas lain |
| Berkas CSS terpisah per komponen | Pakai Tailwind |
| Nilai `style={{ }}` inline | Kecuali nilai yang benar-benar dinamis, misal tinggi progress bar |
| `w-[347px]` dan angka ajaib lain | Pakai skala jarak |
| Font dari CDN | Pakai `next/font` |
| `overflow-hidden` untuk menutupi layout yang bocor | Perbaiki penyebabnya |
