# FASE 5 — CATATAN & TEMUAN

---

## N1 — `notFound()` membalas 200 karena `loading.tsx`, bukan prerender 🔴 SELESAI

Kelanjutan N2 Fase 4 dan N2 Fase 3. Kesimpulan kedua fase itu **keliru**, dan
biayanya nyata: seluruh situs dikunci `dynamicParams = false`, sehingga isi
baru tidak bisa dibuka sampai build berikutnya.

### Kesimpulan lama

> "Rute ber-`generateStaticParams()` menyajikan hasil `notFound()` lewat jalur
> prerender, dan jalur itu selalu membalas 200."

### Yang sebenarnya terjadi

Diuji satu per satu pada Next.js 15.5.22, masing-masing dengan build produksi
sungguhan:

| Konfigurasi | Status |
|---|---|
| `dynamicParams = false` | 404 ✅ |
| `dynamicParams = true` | 200 ❌ |
| Tanpa `generateStaticParams` sama sekali (rute ƒ dinamis) | 200 ❌ |
| `dynamicParams = false` di `[locale]/layout.tsx` | 200 ❌ |
| Tanpa `generateStaticParams` di `[locale]/layout.tsx` | 200 ❌ |
| Rute yang sama, middleware next-intl dilewati | 200 ❌ |
| `[locale]/not-found.tsx` dihapus | 200 ❌ |
| Rute di **luar** `[locale]` (segmen statis) | 404 ✅ |
| Rute di luar `[locale]` dengan `<html>` di layout bersarang | 404 ✅ |
| Segmen **dinamis** di luar `[locale]`, `dynamicParams = true` | 404 ✅ |
| Layout next-intl lengkap di segmen statis | 404 ✅ |

Jadi bukan prerender, bukan `revalidate`, bukan segmen dinamis, bukan
middleware, bukan next-intl, dan bukan layout `<html>` bersarang. Yang
membedakan hanya satu: **berada di bawah `[locale]`**.

Buktinya terbaca di artefak build:

```
.next/server/app/id/uji404.meta         → { "headers": { … } }          ← tanpa status
.next/server/app/ujistatik/uji404.meta  → { "status": 404, "headers": … }
.next/server/app/uji404root.meta        → { "status": 404, "headers": … }
```

**Penyebabnya `src/app/[locale]/loading.tsx`.**

Berkas itu memasang Suspense boundary di atas SELURUH subtree locale. Shell
halaman ter-flush lebih dulu, status respons sudah terkirim sebagai 200, dan
`notFound()` yang menyusul tidak bisa lagi mengubahnya. Isinya tetap halaman
404 yang benar — yang salah hanya status, dan justru status itulah yang dibaca
mesin pencari.

Setelah `loading.tsx` dihapus, `dynamicParams = true` bekerja seperti mestinya:

| Yang diuji | Hasil |
|---|---|
| Dokumen terbit | ✅ 200 |
| Dokumen draft | ✅ **404** |
| Slug tidak ada | ✅ **404** |
| Tipe salah untuk slug yang benar | ✅ 404 |
| Kategori & tag tidak ada | ✅ 404 |
| `/projects/[slug]` tidak ada | ✅ 404 |
| **Dokumen terbit setelah build** | ✅ **200 seketika, tanpa build ulang** |
| Isi draft di HTML | ✅ tidak muncul sama sekali |

### Yang berubah

1. `src/app/[locale]/loading.tsx` **dihapus**.
2. Tujuh rute dikembalikan ke `dynamicParams = true`.
3. Skeleton dipindah ke **dalam** halaman listing (`<Suspense>` di
   `components/knowledge/type-listing.tsx`) — halaman listing tidak pernah
   memanggil `notFound()`, jadi boundary di sana tidak berbahaya.
4. Dikunci `src/app/route-boundaries.test.ts`: tes gagal bila ada `loading.tsx`
   di segmen mana pun yang menaungi rute pemanggil `notFound()`.

### Aturan yang berlaku sejak sekarang

**Jangan menaruh `loading.tsx` di atas rute yang bisa memanggil `notFound()`.**
Butuh skeleton? Pasang `<Suspense>` di dalam halaman, di bawah titik
`notFound()` dipanggil.

### Pelajaran

Tiga fase berturut-turut menyimpulkan sebab yang salah karena semuanya hanya
menguji variabel yang sedang dicurigai (`revalidate`, lalu `dynamicParams`,
lalu `force-dynamic`). Yang akhirnya menemukan jawabannya adalah membandingkan
rute yang **bekerja** dengan rute yang **rusak** sampai tinggal satu perbedaan.

---

## N2 — React 19 mengosongkan form setiap kali validasi gagal 🔴 SELESAI

Ditemukan saat menguji alur terbit dari peramban sungguhan. Terlihat sebagai:
form ditolak karena konfirmasi redaksi belum dicentang, lalu **seluruh isian
kembali ke nilai semula** — status yang sudah diubah ke Terbit kembali jadi
Draft, judul yang sudah diketik kembali ke judul lama.

**Sebab:** `<form action={formAction}>` di React 19 mereset seluruh field
tak-terkendali begitu action selesai, **termasuk saat action mengembalikan
galat**. Yang tersisa di layar hanyalah pesan "Periksa kembali isian yang
ditandai" di atas form yang sudah kosong kembali.

**Ini bug Fase 3, bukan Fase 5.** `FormShell` dipakai bersama oleh form
profil, pengalaman, proyek, keahlian, sertifikat, dan bagian naratif. Form
proyek punya sekitar dua puluh field — satu slug yang bentrok berarti mengetik
ulang semuanya.

**Kenapa baru ketahuan sekarang:** Fase 3 dan 4 menandai "pengiriman form dari
peramban sungguhan" sebagai belum terverifikasi. Gate lint, typecheck, test,
dan build semuanya hijau selama itu — tidak ada satu pun yang membuka form.

**Perbaikan:** `FormShell` tidak lagi memakai `<form action={…}>`, melainkan
`onSubmit` + `startTransition(() => formAction(formData))`. Action tetap
berjalan lewat `useActionState` — status, pesan, dan error per-field tidak
berubah sedikit pun — tapi React tidak lagi menganggapnya form action yang
perlu direset.

Konsekuensi: pengiriman form tanpa JavaScript hilang di **rute admin**.
Antarmuka admin memang sudah menuntut JavaScript (editor Tiptap), dan rute
publik tidak memakai `FormShell` sama sekali — form kontak punya jalurnya
sendiri dan tidak terpengaruh.

**Efek samping yang ikut ditangani:** karena form tidak lagi direset, centang
konfirmasi redaksi jadi ikut bertahan setelah simpan berhasil — penerbitan
kedua akan lolos tanpa siapa pun memeriksa apa pun. `FormShell` sekarang
mengosongkan ulang setiap `input[type=checkbox][data-reset-on-success]` setelah
sukses, dan `CheckboxField` punya prop `resetOnSuccess` untuk menandainya.

---

## N3 — Editor kosong tidak menghasilkan "tidak ada isi" 🟠 SELESAI

Terlihat saat memeriksa database setelah menyimpan dokumen dari peramban:
`contentEnJson` berisi `{"type":"doc","content":[]}`, bukan `null`.

**Sebab:** ProseMirror tidak pernah benar-benar kosong — editor yang tidak
disentuh tetap menyisakan satu paragraf kosong.

**Akibatnya:** `document-detail.tsx` memutuskan fallback bahasa dengan
`document.contentEnJson !== null`. Dokumen "ada tapi hampa" membuat halaman
`/en` menampilkan **badan kosong** alih-alih versi Indonesia beserta
pemberitahuannya — melanggar `08_I18N_FALLBACK_POLICY.md` §3.

**Perbaikan:** `isEmptyDocument()` di `src/lib/prosemirror/types.ts`; skema
mengubah dokumen kosong menjadi `null` sebelum menyimpan. Node tanpa teks yang
tetap berarti — gambar, garis, tabel, blok perintah — dihitung sebagai isi.
Dikunci empat tes.

---

## N4 — Media belum bisa diunggah

`MediaAsset` sudah ada di skema sejak Fase 1, dan `EvidenceGallery` di halaman
publik sudah membacanya. Yang belum ada: cara memasukkan berkasnya.

Keputusan pemilik: **penyimpanan lokal dulu**, Cloudflare R2 menyusul. Belum
dikerjakan — ini isi 5c bersama ekspor JSON/Markdown.

Sampai itu ada, `images.remotePatterns` di `next.config.ts` tetap kosong dan
`<img>` biasa masih dipakai di galeri bukti (N3 Fase 4).

---

## N5 — Kerentanan `npm audit` bawaan Next.js

`npm audit --omit=dev` melaporkan 4 kerentanan (1 sedang, 3 tinggi) — seluruhnya
dari dependency transitif Next.js sendiri: `postcss` (path traversal saat
memuat source map) dan `sharp` (CVE libvips).

**Tidak diperbaiki di fase ini.** `npm audit fix --force` menurunkan Next.js ke
versi 9.3.3 — mundur enam versi mayor. Paket Tiptap yang baru dipasang tidak
menyumbang satu pun kerentanan.

Ditangani di Fase 8 (keamanan & hardening) bersama pembaruan Next.js.

---

## N6 — Ekspor dan riwayat revisi versi lama masih tertunda

`getDocumentRevisions()` kini benar-benar terisi (N5 Fase 4 tertutup), tapi
dua hal sengaja belum dikerjakan:

- **Isi versi lama tidak bisa dilihat maupun dipulihkan.** Versi lama bisa
  memuat data yang justru sudah diredaksi di versi terbaru; menampilkannya
  kembali lewat riwayat akan membatalkan redaksinya. Kalau nanti dibuka, harus
  lewat konfirmasi redaksi tersendiri.
- **Ekspor JSON/Markdown** — bagian dari 5c.
