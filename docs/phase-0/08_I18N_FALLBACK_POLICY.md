# 08 — KEBIJAKAN BILINGUAL & FALLBACK

**Fase:** 0
**Masalah yang diselesaikan:** `titleEn` dan `contentEnJson` bersifat opsional. PRD menyebut "indikator kelengkapan" tapi tidak pernah menetapkan **apa yang dirender** ketika terjemahan belum ada. Tanpa aturan ini, `/en` akan menghasilkan halaman setengah kosong dan duplikat berbahasa Indonesia yang terindeks Google.

---

## 1. Dua jenis teks, dua mekanisme

| Jenis                                                        | Sumber                                         | Aturan                                                       |
| ------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| **String UI** — label tombol, nav, judul bagian, pesan error | Berkas `messages/id.json` & `messages/en.json` | **Wajib lengkap keduanya.** Kunci yang hilang = build gagal. |
| **Konten dinamis** — judul, ringkasan, isi dokumen           | Kolom berpasangan di database                  | Boleh belum lengkap; berlaku aturan fallback di bawah.       |

String UI tidak pernah ikut fallback. Antarmuka campur bahasa terlihat seperti cacat, bukan seperti terjemahan yang belum selesai.

---

## 2. Definisi kelengkapan

Sebuah entitas dianggap **lengkap dalam bahasa Inggris** bila semua field wajib untuk tipenya terisi tidak kosong:

| Entitas             | Field wajib EN                          |
| ------------------- | --------------------------------------- |
| `KnowledgeDocument` | `titleEn`, `summaryEn`, `contentEnJson` |
| `Project`           | `titleEn`, `summaryEn`                  |
| `Experience`        | `positionEn`, `summaryEn`               |
| `SiteProfile`       | `roleEn`, `headlineEn`, `summaryEn`     |
| `MediaAsset`        | `altEn`                                 |

Dihitung sebagai fungsi murni di lapisan data (`isLocaleComplete(entity, 'en')`), bukan disimpan sebagai kolom — kolom tersimpan akan basi setiap kali dokumen disunting.

---

## 3. Aturan render

### Halaman detail (`/en/knowledge/sop/[slug]`)

| Kondisi                            | Perilaku                                          |
| ---------------------------------- | ------------------------------------------------- |
| EN lengkap                         | Render EN sepenuhnya                              |
| EN sebagian (judul ada, isi belum) | Render **isi ID** + banner peringatan di atas isi |
| EN kosong seluruhnya               | Render **seluruhnya dalam ID** + banner           |

Halaman **tidak pernah** menghasilkan 404 hanya karena terjemahan belum ada. Dokumen yang sudah `PUBLISHED` dapat diakses di kedua locale.

Teks banner (string UI, ada di kedua berkas pesan):

> **en.json** — `translation.pending`: "This document has not been translated into English yet. The original Indonesian version is shown below."

Banner memakai `role="note"`, bukan `role="alert"` — ini informasi, bukan kondisi yang mendesak.

### Bungkus bahasa

Bagian mana pun yang menampilkan bahasa berbeda dari locale halaman **wajib** dibungkus dengan atribut `lang` yang benar:

```html
<div lang="id">…isi bahasa Indonesia di halaman /en…</div>
```

Tanpa ini, screen reader akan membacakan teks Indonesia dengan fonetik Inggris. Ini persyaratan WCAG 3.1.2, bukan penyempurnaan opsional.

### Halaman listing (`/en/knowledge/sop`)

Semua dokumen terbit tetap ditampilkan. Yang belum diterjemahkan memakai judul ID plus penanda kecil "ID" pada kartunya. Menyembunyikan dokumen yang belum diterjemahkan akan membuat versi Inggris situs terlihat kosong — persis kebalikan dari tujuannya.

---

## 4. Aturan SEO — bagian yang paling mudah salah

### `hreflang`

Pancarkan pasangan `hreflang` **hanya bila kedua locale benar-benar punya konten dalam bahasanya sendiri.**

| Kondisi         | `hreflang` yang dipancarkan           |
| --------------- | ------------------------------------- |
| ID + EN lengkap | `id`, `en`, `x-default` → `id`        |
| Hanya ID        | **Hanya `id`.** Tanpa `hreflang="en"` |

Menyatakan `hreflang="en"` untuk halaman yang isinya bahasa Indonesia adalah sinyal palsu ke mesin pencari dan penyebab umum halaman ditandai sebagai duplikat.

### Canonical

| Halaman                           | Canonical                         |
| --------------------------------- | --------------------------------- |
| `/id/...`                         | dirinya sendiri                   |
| `/en/...` dengan EN lengkap       | dirinya sendiri                   |
| `/en/...` dengan EN belum lengkap | **menunjuk ke padanan `/id/...`** |

Ini secara eksplisit memberi tahu mesin pencari bahwa halaman EN belum menjadi versi tersendiri.

### Sitemap

`sitemap.xml` hanya memuat URL `/en/...` yang **lengkap** dalam bahasa Inggris. URL `/id/...` selalu dimuat. Halaman EN yang belum lengkap tetap bisa diakses manusia, hanya tidak diajukan untuk diindeks.

### Metadata

`title`, `description`, dan OG mengikuti isi yang benar-benar dirender. Jika halaman menampilkan isi ID, metadata juga memakai teks ID — metadata Inggris di atas isi Indonesia menghasilkan cuplikan hasil pencarian yang menyesatkan.

---

## 5. Pengalih bahasa

- Mempertahankan rute saat ini: `/id/knowledge/sop/x` ⇄ `/en/knowledge/sop/x`.
- Tidak pernah membuang pengguna ke beranda hanya karena terjemahan belum ada.
- Pilihan bahasa disimpan di cookie `NEXT_LOCALE`, `SameSite=Lax`, 1 tahun.
- Kunjungan pertama ke `/` memakai `Accept-Language`; default `id` bila tidak cocok.
- Tautan pengalih memakai atribut `hreflang` dan `lang` yang benar pada elemen `<a>`.

---

## 6. Tampilan di admin

Setiap daftar di CMS menampilkan lencana kelengkapan per baris:

| Lencana    | Arti                                                      |
| ---------- | --------------------------------------------------------- |
| `ID · EN`  | Lengkap keduanya                                          |
| `ID`       | Hanya Indonesia                                           |
| `ID · EN¾` | Inggris sebagian, dengan tooltip berisi field yang kurang |

**Aturan penerbitan:** dokumen tidak dapat berpindah ke `PUBLISHED` tanpa bahasa Indonesia lengkap. Bahasa Inggris tidak pernah menghalangi penerbitan — Indonesia adalah bahasa utama, Inggris menyusul.

---

## 7. Format terlokalisasi

| Jenis           | ID                    | EN                   |
| --------------- | --------------------- | -------------------- |
| Tanggal         | `31 Juli 2026`        | `31 July 2026`       |
| Tanggal pendek  | `31/07/2026`          | `31 Jul 2026`        |
| Angka           | `1.234,5`             | `1,234.5`            |
| Rentang periode | `Jan 2024 – Sekarang` | `Jan 2024 – Present` |

Diformat dengan `Intl` melalui next-intl, tidak pernah dirakit manual dari potongan string.

**Peringatan zona waktu:** tanggal yang diformat di server dengan zona waktu berbeda dari klien akan menyebabkan hydration mismatch. Semua tanggal diformat di Server Component dengan zona waktu tetap `Asia/Jakarta`.

---

## 8. Yang membuat build gagal

Ditegakkan sejak Fase 1:

1. Kunci pesan ada di `id.json` tapi tidak ada di `en.json`, atau sebaliknya.
2. Teks yang terlihat pengguna ditulis langsung di JSX pada rute publik.
3. Rute publik tanpa segmen `[locale]`.

Aturan 1 dan 2 dijaga lewat tipe next-intl dan aturan ESLint. Menegakkannya sejak commit pertama jauh lebih murah daripada menyisir puluhan halaman di Fase 7.
