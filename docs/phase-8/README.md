# FASE 8 — QA, KEAMANAN, PERFORMA, HARDENING

**Status:** 🟡 Kode selesai · ⏳ dua penghambat deploy menunggu keputusan pemilik
**Tanggal:** 1 Agustus 2026

---

## Kriteria terima

| Kriteria | Status |
|---|---|
| Build produksi berhasil | ✅ |
| Tes E2E kritis lolos | ✅ 26/26 |
| Draft tidak bisa diakses tanpa otorisasi | ✅ dikunci tes, bukan pemeriksaan manual |
| Tidak ada isu berat yang diketahui tersisa | 🟡 satu sedang tersisa, tidak terbukti terdampak |
| Backup dan rollback terdokumentasi | ✅ dan **diuji** |

---

## Yang dibuat

### Header keamanan — sebelumnya tidak ada satu pun

`src/lib/security-headers.ts`, dipasang untuk semua rute lewat
`next.config.ts`.

| Header | Nilai |
|---|---|
| Content-Security-Policy | `default-src 'self'`, skrip hanya dari origin sendiri |
| X-Frame-Options | `DENY` |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | kamera, mikrofon, lokasi, pembayaran, USB semuanya ditutup |
| Strict-Transport-Security | 2 tahun, produksi saja |

Dipisah ke modul tersendiri **supaya bisa diuji**: header keamanan yang
salah ketik tidak menghasilkan galat apa pun, ia hanya diam-diam tidak
berlaku. Sepuluh tes menggantikan galat yang tidak pernah muncul itu.

`script-src` mengizinkan `'unsafe-inline'`, dan itu keputusan sadar dengan
alasan yang ditulis lengkap di sumbernya: menghapusnya menuntut nonce, dan
nonce memaksa seluruh halaman dirender dinamis. Yang tetap dijaga: skrip
dari domain lain ditolak, `<object>` ditolak, halaman tidak bisa dibingkai,
`<base>` tidak bisa dibajak, form tidak bisa mengirim ke origin lain.

### Tes otorisasi — memindai sumber, bukan menjalankan aplikasi

`src/data/authorization.test.ts` menuntut:

- setiap fungsi admin di `src/data/` memanggil guard di badannya
- setiap server action memanggil guard atau helper ber-guard
- setiap query publik di `knowledge.ts` menyaring `PUBLISHED`
- media publik selalu disaring `isPublic` **dan** `redactionConfirmed`
- setiap halaman admin memakai `AdminShell` atau guard langsung

**Kenapa memindai sumber:** fungsi baru yang lupa memanggil `requireAdmin()`
tidak akan gagal di tes fungsional mana pun — ia justru BERHASIL, hanya
saja untuk orang yang seharusnya ditolak. Yang bisa menangkapnya hanya
pemeriksaan yang menuntut guard-nya ADA.

Tesnya sendiri diuji: guard dilepas sementara dari `deleteDocument`, tes
berubah merah dan menyebut nama fungsinya. Tes yang tidak pernah bisa gagal
tidak membuktikan apa pun.

### Tes E2E yang tinggal di repositori

`e2e/` — 26 pemeriksaan, dijalankan `npm run test:e2e`.

Fase-fase sebelumnya memverifikasi lewat skrip sekali pakai yang dibuang
setelah dipakai. Sekarang jalur kritisnya diuji ulang kapan saja:

```
Kontrol akses     dokumen terbit 200 · draft 404 · judul draft tidak ada di HTML
                  aset privat 404 tanpa sesi DAN 200 dengan sesi
                  admin dialihkan tanpa sesi · login lintas origin ditolak
Header keamanan   lima header terpasang · CSP tidak mengizinkan host luar
Pencarian         menemukan yang terbit · TIDAK mengembalikan draft
                  masukan aneh tidak menjatuhkan server
Antarmuka         Ctrl+K · hasil muncul · draft tidak muncul · Enter membuka
```

Memakai Chromium lewat CDP tanpa dependency baru. Batasnya jujur dan
tercatat di [NOTES.md](NOTES.md) N2.

Seluruh umpan uji dihapus di `finally` — termasuk saat tes gagal.

---

## Temuan keamanan

| # | Temuan | Tingkat | Status |
|---|---|---|---|
| 1 | Tidak ada header keamanan sama sekali | tinggi | ✅ diperbaiki |
| 2 | `next-intl` open redirect (GHSA-8f24-v5vv-gm5j) | sedang | 🟡 tidak terbukti terdampak, perbaikan butuh lompatan mayor |
| 3 | `postcss`, `sharp` lewat dependency Next.js | tinggi | 🟡 tidak bisa diperbaiki tanpa menurunkan Next enam versi mayor |
| 4 | Pembatasan laju belum ada | tinggi | ⏳ menunggu keputusan pemilik |
| 5 | Prototype pollution `next-intl` lewat `precompile` | sedang | ✅ tidak berlaku — `precompile` tidak dipakai |

Temuan 2 diuji langsung, tidak diasumsikan: tujuh vektor open redirect
dicoba terhadap server yang berjalan, seluruhnya menghasilkan redirect
**relatif** ke domain sendiri. Rinciannya di [NOTES.md](NOTES.md) N1.

Yang diperiksa dan bersih:

- Tidak ada berkas `.env` yang ter-commit; `.env.example` tidak memuat nilai rahasia
- Tidak ada literal kata sandi, token, atau kunci API di sumber
- `dangerouslySetInnerHTML` hanya di JSON-LD, isinya selalu `JSON.stringify` dengan `<` dilolos
- Renderer dokumen tidak pernah menyisipkan HTML mentah
- Unggahan: jenis dari magic bytes, SVG ditolak, kunci objek tidak bisa keluar direktori
- CSRF Better Auth bekerja — login lintas origin ditolak 403, dan itu **diuji**

---

## Tinjauan performa

| Yang diukur | Hasil |
|---|---|
| Bundel terbesar rute publik | 215 kB First Load JS (`/knowledge/tag/[slug]`) |
| Listing Knowledge Base | 207 kB |
| Detail dokumen | 152 kB |
| Chunk bersama semua halaman | 103 kB |
| Waktu tanggap lokal | 5–6 ms (halaman prerender, database kosong) |

**Satu perbaikan nyata:** halaman detail dokumen sempat melakukan satu
jalan-pulang database berurutan — `getPublishedProfile()` menunggu sendiri
sebelum `Promise.all` berikutnya, tersisip saat JSON-LD ditambahkan di Fase
7. Ketiganya kini berjalan bersamaan.

**Yang tidak bisa saya pertanggungjawabkan:** chunk 55 kB pada rute listing
tidak berhasil saya atribusikan dari keluaran terminifikasi. Alat yang tepat
untuk itu `@next/bundle-analyzer`, dan itu dependency baru yang tidak saya
tambahkan tanpa diminta. Angka 5–6 ms juga tidak mewakili produksi: halaman
prerender, database kosong, tanpa jaringan.

Core Web Vitals sungguhan butuh perangkat dan jaringan nyata. Tercatat
sebagai belum diukur, bukan dianggap baik.

---

## Backup & rollback

[BACKUP_AND_ROLLBACK.md](BACKUP_AND_ROLLBACK.md) — **diuji, bukan ditulis
saja.**

Pengujiannya langsung menemukan satu kesalahan di runbook: `pg_dump` menolak
`?schema=public` yang ditempelkan Prisma ke `DATABASE_URL`. Perintah pertama
di runbook itu akan gagal bagi siapa pun yang menyalinnya. Sudah diperbaiki
dan diverifikasi ulang:

| Yang diuji | Hasil |
|---|---|
| `pg_dump` format custom | ✅ 52 kB |
| `pg_restore --list` | ✅ 42 objek |
| Pulihkan ke database kosong | ✅ 21 tabel |
| Indeks GIN ikut terpulihkan | ✅ 2 |
| Kolom generated **tetap** generated | ✅ 2 |

Yang terakhir yang paling mudah terlewat: pulihan yang mengubah
`searchVector` menjadi kolom biasa akan membuat pencarian diam-diam basi.

---

## Gates

| Gate | Hasil |
|---|---|
| lint | ✅ tanpa warning |
| typecheck | ✅ |
| test | ✅ 208/208 (naik dari 191) |
| test:e2e | ✅ 26/26 |
| build | ✅ |

---

## Belum selesai

Dua penghambat deploy, keduanya butuh keputusan pemilik dan keduanya
memang masuk cakupan fase ini:

1. **Perlindungan form kontak** — rate limit per IP (butuh tabel hash IP +
   garam) dan Cloudflare Turnstile. Pembatasan laju `/api/search` menumpang
   pekerjaan yang sama.
2. **Cloudflare R2** — disk lokal tidak bertahan di hosting serverless.

Selain itu: uji manual delapan titik, dan Core Web Vitals di perangkat nyata.
