# FASE 8 — CATATAN & TEMUAN

---

## N1 — `next-intl` open redirect: diuji, tidak terbukti terdampak 🟡 TERBUKA

`npm audit` melaporkan GHSA-8f24-v5vv-gm5j pada `next-intl` (terpasang
3.26.5, rentan `<=4.9.1`). Setiap rute publik di situs ini lewat middleware
next-intl, jadi ini tidak bisa diabaikan begitu saja.

**Diuji terhadap server produksi yang berjalan**, tujuh vektor:

| Permintaan              | Status | Location             |
| ----------------------- | ------ | -------------------- |
| `//penyerang.test`      | 308    | `/penyerang.test`    |
| `/\/penyerang.test`     | 308    | `/penyerang.test`    |
| `//penyerang.test/x`    | 308    | `/penyerang.test/x`  |
| `/id//penyerang.test`   | 308    | `/id/penyerang.test` |
| `/%2F%2Fpenyerang.test` | 404    | —                    |
| `/.penyerang.test`      | 404    | —                    |

Seluruhnya **relatif** — Next.js menormalkan garis miring ganda sebelum
next-intl sempat menyusun redirect. Tidak ada satu pun yang mengarah ke host
luar.

**Kenapa tidak langsung diperbaiki:** perbaikannya `next-intl@4.13.4`, dan
3.x → 4.x adalah lompatan mayor dengan perubahan yang memutus. Menaikkannya
diam-diam di fase hardening berarti mengganti kepastian yang sudah diuji
dengan risiko yang belum diuji.

**Yang disarankan:** naikkan ke 4.x sebagai pekerjaan tersendiri dengan
gerbang lengkap dan uji manual delapan titik, bukan sebagai satu baris di
akhir Fase 8.

---

## N2 — Tes E2E memakai CDP, bukan Playwright

`e2e/lib/cdp.mjs` mengendalikan Chromium lewat Chrome DevTools Protocol
dengan `WebSocket` bawaan Node 22. Tanpa dependency baru sama sekali.

**Kenapa bukan Playwright:** ia menarik ~300 MB peramban dan puluhan paket
untuk memeriksa delapan jalur.

**Harganya, dan ini nyata:**

- Tidak ada auto-wait. Setiap langkah menunggu dengan `setTimeout` — angka
  yang dipilih, bukan diukur. Di mesin yang lebih lambat, tes bisa gagal
  bukan karena aplikasinya salah.
- Tidak ada selector engine; semuanya `document.querySelector` di dalam
  `Runtime.evaluate`.
- Tidak ada laporan, jejak, atau tangkapan layar saat gagal.

**Kapan harus diganti:** begitu tes E2E-nya melewati belasan berkas, atau
begitu ada satu saja tes yang gagal berselang-seling. Keduanya tanda bahwa
menunggu dengan waktu tetap sudah tidak cukup.

---

## N3 — Kolom generated bisa hilang saat dipulihkan, dan itu senyap

Saat menguji runbook backup, satu hal yang hampir tidak diperiksa:
apakah `searchVector` tetap berupa kolom `GENERATED ALWAYS` setelah
`pg_restore`?

Ia tetap — terverifikasi. Tapi kalau suatu saat tidak: kolomnya tetap ADA
dan tetap berisi nilai lama, pencarian tetap mengembalikan hasil, dan tidak
ada satu pun galat. Yang terjadi hanya dokumen baru tidak pernah bisa
ditemukan.

Karena itu pemeriksaannya masuk runbook sebagai langkah tetap, bukan sebagai
catatan.

---

## N4 — Runbook yang tidak diuji adalah runbook yang salah

Perintah pertama di runbook backup gagal saat dijalankan:

```
pg_dump: error: invalid URI query parameter: "schema"
```

`?schema=public` adalah parameter milik Prisma, bukan PostgreSQL. Siapa pun
yang menyalin `DATABASE_URL` apa adanya ke `pg_dump` akan tersandung —
tepat pada saat ia paling butuh cadangan berhasil.

Sudah diperbaiki dengan `PGURL="${DATABASE_URL%%\?*}"`, dan seluruh runbook
dijalankan ulang dari awal sampai pulihan bisa dikueri.

Catatan ini ditulis karena polanya lebih penting daripada bug-nya: dokumen
prosedur yang belum pernah dijalankan hanya terlihat benar.

---

## N5 — `unsafe-inline` pada `script-src` masih ada

CSP mengizinkan skrip inline. Yang membutuhkannya: skrip hidrasi Next.js dan
skrip `next-themes` yang menetapkan tema sebelum halaman digambar.

Menghapusnya menuntut nonce per permintaan, dan nonce membuat SELURUH
halaman dirender dinamis — menukar performa yang nyata dan terukur dengan
perlindungan terhadap jalur yang sudah ditutup dengan cara lain (renderer
tidak pernah menyisipkan HTML mentah, unggahan menolak HTML dan SVG).

**Kalau suatu saat mau diperbaiki:** tempatnya di middleware, dan hanya
untuk rute `/admin/*` — rute admin sudah `force-dynamic`, jadi nonce di sana
tidak mengorbankan apa pun. Rute publik tetap statis.

---

## N6 — Pembatasan laju masih belum ada, dan sekarang menyentuh dua tempat

Fase 3 N3 mencatatnya untuk form kontak. Fase 7 N3 menambahkan
`/api/search`. Keduanya butuh mekanisme yang sama — pembatas laju per IP
dengan hash + garam, karena PRD bab 17 melarang menyimpan IP mentah.

Ini satu-satunya temuan **tinggi** yang masih terbuka dan bisa dikerjakan
tanpa menunggu pihak ketiga. Yang menahannya keputusan pemilik atas tabel
baru, bukan pekerjaannya.
