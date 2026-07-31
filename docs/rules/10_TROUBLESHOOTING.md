# 10 — TROUBLESHOOTING

Kumpulan error yang hampir pasti akan ditemui, beserta penyebab sebenarnya.

---

## Next.js & React

### `Text content did not match` / hydration mismatch

Server dan klien merender hasil berbeda. Tiga penyebab tersering:

1. **Tanggal diformat di klien.** Zona waktu pengunjung berbeda dari server. → Format di Server Component dengan zona tetap `Asia/Jakarta`.
2. **`Math.random()` atau `Date.now()` saat render.** → Pindahkan ke `useEffect` atau hitung di server.
3. **Membaca `localStorage` saat render.** → Baca di `useEffect`, atau pakai skrip inline untuk tema.

### `useState is not a function` / `You're importing a component that needs useState`

Hook dipakai di Server Component. → Tambahkan `'use client'`, tapi **di komponen terkecil**, bukan di halamannya. Lihat [01_CODE_CONVENTIONS.md](01_CODE_CONVENTIONS.md) bagian 3.

### `Cannot read properties of undefined` di production tapi tidak di dev

Hampir selalu data opsional yang tidak dijaga. Dev memakai data seed yang lengkap; produksi punya field kosong. → Periksa field `*En` dan relasi opsional.

### Halaman publik tiba-tiba menjadi dinamis

Ada yang memakai `cookies()`, `headers()`, atau `searchParams` tanpa `Suspense`. Cek keluaran `npm run build` — halaman ditandai `ƒ` bukan `○`.

---

## next-intl

### `MISSING_MESSAGE: Could not resolve ...`

Kunci ada di `id.json` tapi tidak di `en.json`, atau salah ketik. → Tambahkan di **kedua** berkas.

### Tautan membuang pengguna ke bahasa default

`Link` diimpor dari `next/link`. → Impor dari `@/i18n/navigation`. Ini kesalahan nomor satu di proyek next-intl.

### `/id` menghasilkan 404

Struktur folder salah. Halaman harus berada di dalam `src/app/[locale]/`, dan `middleware.ts` harus ada di `src/` (sejajar dengan `app/`, bukan di dalamnya).

### Locale menjadi `undefined` di layout

Di Next.js versi terbaru `params` bersifat Promise. → `const { locale } = await params`.

---

## Tema

### Kedipan putih saat memuat halaman dengan tema gelap

Skrip inline tema tidak berjalan sebelum paint pertama. → Skrip harus ada di `<head>` sebagai `<script dangerouslySetInnerHTML>`, dijalankan sinkron, sebelum React hidrasi. Ini satu-satunya tempat `dangerouslySetInnerHTML` diizinkan, dan isinya konstanta yang kita tulis sendiri.

### Tema kembali ke terang setelah refresh

Preferensi tidak tersimpan, atau `storageKey` berbeda antara provider dan skrip inline.

### Ikon toggle tema salah pada render pertama

Normal — server tidak tahu tema pengguna. → Render placeholder sampai `mounted === true`.

---

## Prisma

### `@prisma/client did not initialize yet`

```bash
npx prisma generate
```

Perlu dijalankan ulang setiap kali `schema.prisma` berubah. Sudah ada di skrip `postinstall`, tapi tidak berjalan kalau `node_modules` disunting manual.

### `Too many connections` saat pengembangan

Hot reload membuat instance `PrismaClient` baru setiap kali. → Pakai pola singleton di `src/lib/prisma.ts`. Kalau sudah dipakai tapi masih terjadi, kemungkinan ada `new PrismaClient()` lain yang terselip.

### Migrasi gagal di Neon: `prepared statement already exists`

Migrasi berjalan lewat koneksi pooled. → Isi `DIRECT_URL` di `.env.local` dan tambahkan `directUrl` di blok `datasource`.

### `Drift detected` / database tidak sinkron

Skema disunting tanpa membuat migrasi, atau `prisma db push` pernah dijalankan. → Di dev boleh reset:

```bash
npx prisma migrate reset
```

⚠️ Perintah ini **menghapus seluruh data**. Jangan pernah dijalankan pada database produksi. Kalau ragu, tanya dulu.

### Seed gagal di Windows

Pakai `tsx`, bukan `ts-node`:

```json
{ "prisma": { "seed": "tsx prisma/seed.ts" } }
```

---

## Better Auth

### Sesi selalu `null` padahal login berhasil

Biasanya `BETTER_AUTH_URL` tidak cocok dengan origin sebenarnya, atau cookie tidak terkirim karena beda port/protokol.

### Bentuk tabel tidak cocok dengan skema

Skema di `phase-0/07_SCHEMA_DECISIONS.md` adalah perkiraan. → Jalankan `npx @better-auth/cli generate` dan pakai hasilnya.

### Endpoint sign-up masih bisa diakses

**Ini cacat keamanan tingkat tinggi.** → Laporkan segera. Registrasi harus dimatikan di konfigurasi Better Auth **dan** diverifikasi lewat tes.

---

## Tailwind

### Kelas tidak berpengaruh sama sekali

Nama kelas dirakit secara dinamis, jadi tidak terdeteksi saat build:

```tsx
// ❌ Tailwind tidak bisa memindai ini
<div className={`text-${color}-500`}>

// ✅ tulis kelas lengkap
<div className={cn(isError ? 'text-danger' : 'text-success')}>
```

### Dua kelas bertabrakan dan yang salah menang

Pakai `cn()` (`tailwind-merge`), bukan template string.

---

## Build & CI

### Build lokal berhasil, CI gagal

Beberapa kemungkinan: env var belum diatur di CI, sensitivitas huruf besar-kecil pada nama berkas (Windows tidak peduli, Linux peduli), atau `node_modules` lokal sudah usang.

**Nama berkas peka huruf besar-kecil di CI.** `ProjectCard.tsx` diimpor sebagai `projectCard.tsx` akan lolos di Windows dan gagal di CI.

### Build gagal dengan error tipe di `.next/types`

```bash
rm -rf .next
```

Lalu build ulang.

---

## Kalau masih buntu

1. Baca **seluruh** pesan error, termasuk baris paling bawah. Penyebab sebenarnya sering ada di sana.
2. Cari nama berkas dan nomor baris yang disebutkan.
3. Coba `rm -rf .next && npm run build`.
4. Periksa apakah masalahnya juga muncul di commit sebelumnya (`git stash`).
5. **Bertanya**, sertakan: perintah yang dijalankan, pesan error lengkap, dan apa saja yang sudah dicoba.

Setelah 30 menit buntu, bertanya lebih murah daripada terus mencoba.
