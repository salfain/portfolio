# FASE 4 — CATATAN & TEMUAN

---

## N1 — `unstable_cache` mengubah `Date` menjadi string 🔴 BUG LAMA, SUDAH DIPERBAIKI

**Terlihat sebagai:** build gagal dengan
`TypeError: a.publishedAt.toISOString is not a function`.

**Sebab:** `unstable_cache` menyimpan hasilnya sebagai JSON. Saat cache
**MISS**, fungsi data mengembalikan `Date` asli dari Prisma; saat cache
**HIT**, nilai yang sama kembali sebagai **string ISO**.

Tipe Prisma tetap menyebutnya `Date`, jadi **TypeScript tidak menangkap
perbedaan ini sama sekali**.

**Kenapa baru ketahuan sekarang:** kerusakannya hanya muncul setelah cache
terisi. Verifikasi Fase 3 selalu memakai build bersih dengan database
kosong, jadi tidak ada satu pun tanggal yang pernah dirender dua kali.

**Ini bug Fase 3, bukan Fase 4.** Yang ikut terdampak:

| Berkas | Baris |
|---|---|
| `src/components/sections/certifications-list.tsx` | `certificate.issueDate.toISOString()` |
| `src/components/sections/experience-timeline.tsx` | `formatPeriod(...)` dari data ber-cache |
| `src/app/[locale]/recruiter/page.tsx` | `formatFullDate` & `formatPeriod` |

Artinya: begitu pemilik mengisi sertifikat atau pengalaman lalu halamannya
dibuka dua kali, beranda dan Recruiter Mode akan **error di produksi**.

**Perbaikan:** tipe `DateLike = Date | string` di `src/lib/format.ts`.
Seluruh helper tanggal menerima keduanya, ditambah `toIsoString()` untuk
atribut `<time dateTime>`. Tidak ada lagi `.toISOString()` langsung di
komponen.

**Dikunci 5 tes regresi** yang membandingkan hasil dari `Date` dan string
ISO — kalau helper-nya dikembalikan ke `Date` saja, tesnya merah.

---

## N2 — `notFound()` dari halaman membalas 200, bukan 404 🔴 SUDAH DIPERBAIKI

Lanjutan N2 Fase 3, dengan sebab yang akhirnya jelas.

**Yang diuji:**

| Konfigurasi | Status `notFound()` |
|---|---|
| `generateStaticParams` + `dynamicParams: true` | **200** (`x-nextjs-prerender: 1`) |
| ditambah `export const dynamic = 'force-dynamic'` | **200** |
| segmen dinamis + `searchParams` (dirender dinamis) | **200** |
| `dynamicParams = false` | **404** ✅ |
| rute tidak cocok sama sekali | **404** ✅ |

**Kesimpulan:** di aplikasi ini `notFound()` yang dipanggil DARI DALAM
halaman tidak pernah menghasilkan 404. Hanya penolakan di **level router**
yang benar-benar 404.

Kesimpulan Fase 3 bahwa penyebabnya `export const revalidate` **tidak
tepat** — `revalidate` hanya salah satu cara membuat rute masuk jalur
prerender.

**Perbaikan:**

1. Rute detail, kategori, dan tag: `dynamicParams = false`.
2. Listing per tipe diubah dari satu segmen dinamis `[type]` menjadi
   **empat rute statis** (`/knowledge/sop`, `/knowledge/labs`, …).
   `dynamicParams = false` tidak menolong di sini karena halaman listing
   menerima `searchParams`, yang memaksanya dirender dinamis.

Kebetulan menguntungkan: empat rute statis justru persis yang tertulis di
`05_ROUTE_AND_PRIORITY_MAP.md` §2. Logikanya tetap satu — di
`components/knowledge/type-listing.tsx` dan `document-detail.tsx` — jadi
berkas rutenya tipis dan tidak ada duplikasi.

### ⚠️ Konsekuensi yang belum diputuskan

`generateStaticParams()` hanya berjalan saat build. **Dokumen, kategori,
atau tag yang baru diterbitkan lewat CMS belum bisa dibuka sampai build
berikutnya** — `revalidateTag('knowledge')` menyegarkan data, bukan daftar
slug.

Ini persis pertukaran yang sama dengan N2 Fase 3 untuk `/projects/[slug]`,
dan sekarang berlaku untuk seluruh isi situs. **Keputusannya menghambat
Fase 5** (CMS yang tidak bisa menerbitkan tanpa build ulang kehilangan
sebagian besar gunanya).

| Opsi | Konsekuensi |
|---|---|
| A. Deploy hook — publikasi memicu build ulang | Jeda 1–2 menit; 404 tetap benar |
| B. Terima 200 untuk slug tidak ada | **Ditolak** — mesin pencari mengindeks draft sebagai halaman sah |
| C. Halaman 404 kustom yang mengeset status sendiri | Perlu riset; belum dicoba |

---

## N3 — Gambar remote belum didukung

`safeImageSrc()` hanya menerima path relatif. Gambar dari URL remote
ditolak karena `images.remotePatterns` masih kosong — merendernya sekarang
membuat `next/image` menolak host-nya saat runtime dan halamannya gagal.

Sementara ini `<img>` biasa dipakai (dengan `eslint-disable` beralasan)
karena dimensi aset tidak tersimpan di dokumen. **Diganti `next/image` di
Fase 5** bersama pemasangan penyimpanan objek.

---

## N4 — Pencarian masih `contains`, belum full-text

`getPublishedDocuments({ query })` memakai `contains` + `mode: 'insensitive'`
pada judul, ringkasan, dan kode dokumen.

Cukup untuk puluhan dokumen. Pencarian PostgreSQL full-text (`tsvector`)
memang dijadwalkan Fase 7, bersama konfigurasi teks `indonesian` yang masih
tertunda dari Fase 1 N4.

---

## N5 — Riwayat revisi belum bisa terisi

`getDocumentRevisions()` dan `RevisionTimeline` sudah jalan, tapi **belum
ada yang menulis** ke `KnowledgeRevision` — penulisannya terjadi saat admin
menyunting dokumen terbit, dan itu Fase 5.

Isi versi lama **sengaja tidak** diambil query-nya: versi lama bisa memuat
data yang justru sudah diredaksi di versi terbaru, dan menerbitkannya
kembali lewat riwayat akan membatalkan redaksinya.
