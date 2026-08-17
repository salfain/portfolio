# FASE 4 — KNOWLEDGE BASE PUBLIK

**Status:** ✅ Kode selesai — menunggu isi konten (Fase 9)
**Tanggal:** 1 Agustus 2026

---

## Yang dibuat

### Renderer dokumen (`src/lib/prosemirror/`)

Isi dokumen disimpan sebagai JSON Tiptap. Kolom `contentIdHtml` **tidak
pernah** dibaca untuk merender halaman publik — hanya untuk indeks
pencarian (`07_SCHEMA_DECISIONS.md` §6).

| Berkas        | Isi                                                                       |
| ------------- | ------------------------------------------------------------------------- |
| `types.ts`    | Skema Zod permisif; node tak dikenal lolos parsing, diabaikan saat render |
| `render.tsx`  | JSON → React. Tanpa `dangerouslySetInnerHTML` sama sekali                 |
| `headings.ts` | Slug anchor, id unik, ekstraksi teks polos                                |
| `safe-url.ts` | Daftar-izin skema URL dan sumber gambar                                   |

Tiptap **tidak** ikut ke bundel publik — renderer ini menggantikannya.
Editor Tiptap baru masuk di Fase 5, khusus admin, dimuat dinamis.

### Lapisan data (`src/data/knowledge.ts`)

Setiap query menyaring `status: 'PUBLISHED'`. `getPublishedDocumentBySlug`
memakai `findFirst` dengan status di dalam `WHERE`, bukan `findUnique` lalu
disaring di aplikasi — dokumen draft tidak pernah terambil sama sekali.

Media disaring `isPublic: true, redactionConfirmed: true` **di query**,
bukan di komponen: satu komponen yang lupa menyaring sama dengan bukti
internal terbit ke publik.

Listing berfilter **sengaja tidak di-cache** — `unstable_cache` memasukkan
argumen ke kunci cache, jadi setiap kata kunci pencarian membuat entri baru
dan cache tumbuh tanpa batas.

### Rute (14 halaman × 2 locale)

```
/knowledge                      landing: 4 tipe, kategori, dokumen terbaru
/knowledge/sop                  listing + filter
/knowledge/sop/[slug]           detail
/knowledge/labs        (+[slug])
/knowledge/incidents   (+[slug])
/knowledge/articles    (+[slug])
/knowledge/category/[slug]
/knowledge/tag/[slug]
```

Keempat tipe adalah rute **statis**, bukan satu segmen `[type]`. Alasannya
ada di NOTES N2 — bukan pilihan gaya.

### Komponen (`src/components/knowledge/`)

`document-card` · `knowledge-filters` · `table-of-contents` ·
`reading-progress` · `evidence-gallery` · `revision-timeline` ·
`code-block` · `type-listing` · `document-detail`

Daftar isi memakai `IntersectionObserver`, bukan hitungan `scrollY` di event
scroll. Lightbox memakai Radix Dialog — jebakan fokus, Escape, dan
pengembalian fokus sudah benar tanpa ditulis ulang.

### Beranda bagian 10

`KnowledgePreview` melengkapi urutan 11 bagian dari `01_PHASES.md`. Tidak
dirender saat belum ada dokumen terbit.

Flag `features.knowledgeBase` dinyalakan — tautan `/knowledge` di navbar
dan footer kini aktif.

---

## Gates

| Gate      | Hasil                   |
| --------- | ----------------------- |
| lint      | ✅ tanpa warning        |
| typecheck | ✅                      |
| test      | ✅ 94/94 (naik dari 51) |
| build     | ✅ 43 halaman           |

Tes baru: `prosemirror.test.ts` (28), `knowledge-type.test.ts` (12),
regresi tanggal ber-cache di `format.test.ts` (5).

---

## Verifikasi runtime

Build produksi di port 5322, dengan satu dokumen terbit dan satu draft
sebagai umpan. **Seluruh data uji sudah dihapus** — semua tabel isi kembali 0.

### Kontrol akses

| Yang diuji                    | Hasil                                               |
| ----------------------------- | --------------------------------------------------- |
| Dokumen terbit                | ✅ 200                                              |
| Dokumen **draft**             | ✅ **404**, isinya tidak muncul sama sekali di HTML |
| Slug benar tapi tipe salah    | ✅ 404                                              |
| Slug tidak ada                | ✅ 404                                              |
| Segmen tipe tidak dikenal     | ✅ 404                                              |
| Kategori & tag tidak ada      | ✅ 404                                              |
| Draft di `sitemap.xml`        | ✅ tidak ada                                        |
| `/recruiter` di `sitemap.xml` | ✅ tidak ada (ber-`noindex`)                        |

### Render isi

| Yang diuji                            | Hasil                                                            |
| ------------------------------------- | ---------------------------------------------------------------- |
| Tautan `javascript:`                  | ✅ href dibuang, teksnya tetap tampil                            |
| Tautan https sah                      | ✅ `target="_blank" rel="noopener noreferrer"`                   |
| Dua heading berjudul sama             | ✅ `#validasi` dan `#validasi-2`                                 |
| Daftar isi menunjuk anchor yang benar | ✅ persis sama                                                   |
| Tabel                                 | ✅ pembungkus `overflow-x-auto`, halaman tidak bergulir mendatar |
| Blok perintah                         | ✅ tampil, tombol salin ada                                      |
| Node tak dikenal                      | ✅ teks di dalamnya tetap dirender                               |

### Filter di URL

| Yang diuji                       | Hasil                                       |
| -------------------------------- | ------------------------------------------- |
| `?kategori=` cocok / tidak cocok | ✅ 1 / 0 hasil                              |
| `?q=` judul dan kode dokumen     | ✅ keduanya menemukan                       |
| `?tingkat=` cocok / tidak cocok  | ✅ 1 / 0 hasil                              |
| `?tingkat=DEWA&tag=../../etc`    | ✅ 200, nilai tidak sah diabaikan diam-diam |

---

## Belum diverifikasi

- Pengiriman form dari peramban sungguhan (sama seperti Fase 3, NOTES N16)
- Uji manual delapan titik
- Lightbox dengan keyboard di perangkat nyata — logikanya ada, interaksinya
  belum dicoba manual
