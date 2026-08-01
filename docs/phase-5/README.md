# FASE 5 — ADMIN CMS, EDITOR, REVISI

**Status:** 🟡 5a + 5b selesai · 5c (media & ekspor) belum
**Tanggal:** 1 Agustus 2026

---

## Ruang lingkup yang dikerjakan

Pemilik menyetujui pengerjaan 5a dan 5b sekaligus, dengan 5c menyusul:

| Bagian | Isi | Status |
|---|---|---|
| 5a | CRUD dokumen, kategori & tag, alur terbit, revisi otomatis, jejak audit | ✅ |
| 5b | Editor Tiptap, template, autosave, pratinjau ID/EN | ✅ |
| 5c | Manajer bukti, unggahan berkas, ekspor JSON/Markdown | ⬜ |

Keputusan pemilik untuk 5c: **penyimpanan lokal dulu**, R2 menyusul.

---

## Penghambat yang dibuka lebih dulu

Fase 5 tidak bisa dimulai dengan jujur selama N2 Fase 4 masih berlaku:
`dynamicParams = false` membuat dokumen yang baru terbit tidak bisa dibuka
sampai build berikutnya, sehingga tombol "Terbitkan" di CMS **tidak benar-benar
menerbitkan**.

Penyebabnya ternyata bukan prerender sama sekali — lihat
[NOTES.md](NOTES.md) N1. Setelah diperbaiki:

| Yang diuji | Sebelum | Sesudah |
|---|---|---|
| Dokumen terbit dibuka | 200 | 200 |
| Dokumen **draft** | 404 | **404** |
| Slug tidak ada | 404 | **404** |
| Slug yang belum ada saat build | **404 sampai build ulang** | **200 seketika** |

Tujuh rute dikembalikan ke `dynamicParams = true`: empat rute detail
dokumen, kategori, tag, dan `/projects/[slug]`.

---

## Yang dibuat

### Lapisan data (`src/data/`)

| Berkas | Isi |
|---|---|
| `knowledge-admin.ts` | CRUD dokumen, kategori, tag. Guard di baris pertama setiap fungsi |
| `audit.ts` | `recordAudit()`, `auditActionForStatus()`, `getAuditLog()` |

`knowledge-admin.ts` sengaja **terpisah** dari `knowledge.ts`. Berkas publik
menyaring `status: 'PUBLISHED'` di setiap query tanpa kecuali; begitu query
admin yang memang harus melihat draft ikut tinggal di sana, aturannya berubah
jadi "sebagian besar" — dan aturan yang berlaku sebagian besar tidak bisa
diandalkan saat ditinjau.

**Revisi otomatis:** menyunting dokumen yang sudah `PUBLISHED` menyimpan isi
**lama** sebagai `KnowledgeRevision` dalam satu `prisma.$transaction`. Draft
tidak menghasilkan revisi — dokumen yang belum pernah terbit tidak punya versi
sebelumnya yang pernah dibaca siapa pun. Ini menutup N5 Fase 4.

**Jejak audit** mencatat apa yang berubah dan siapa yang mengubahnya, **bukan
isinya**. Menyalin isi dokumen ke tabel audit berarti data yang sudah
diredaksi tetap hidup di luar jangkauan checklist redaksi.

### Editor (`src/components/admin/editor/`)

| Berkas | Isi |
|---|---|
| `extensions.ts` | Daftar ekstensi, dipilih agar cocok persis dengan node yang dikenal renderer publik |
| `rich-text-editor.tsx` | Editor satu bahasa; isi dikirim sebagai string JSON di input tersembunyi |
| `toolbar.tsx` | Tombol format berlabel teks, bukan ikon |
| `templates.ts` | Kerangka SOP/Lab/Insiden/Artikel — judul bagian saja, tanpa satu pun kalimat isi |
| `use-autosave.ts` | Pemulihan lokal ke `localStorage`, bukan draft server |
| `index.tsx` | Pembungkus `next/dynamic` dengan `ssr: false` |

Tiptap **tidak ada di satu pun entry chunk rute publik** — terverifikasi
terhadap `app-build-manifest.json` setelah build. Ia hidup di dua chunk malas
(352 kB) yang hanya turun saat halaman sunting dibuka.

Autosave sengaja **tidak** mengirim ke server. Menyimpan diam-diam ke database
berarti dokumen terbit bisa berubah tanpa pemiliknya menekan apa pun — dan
perubahan isi terbit wajib lewat konfirmasi redaksi.

### Rute admin

```
/admin/knowledge                     daftar + filter tipe & status
/admin/knowledge/new                 tambah
/admin/knowledge/[id]                ubah + riwayat revisi
/admin/knowledge/[id]/preview        pratinjau ID/EN
/admin/taxonomy                      kategori (CRUD) + tag (hapus)
/admin/audit                         jejak audit, hanya baca
```

Pratinjau memakai renderer yang **sama persis** dengan halaman publik, bukan
tiruan yang mirip. Pratinjau lewat jalur lain akan berbohong tepat di kasus
yang paling penting: node yang tidak dikenal renderer publik.

### Konfirmasi redaksi

Status `PUBLISHED` ditolak tanpa centang konfirmasi. Centangnya **tidak
disimpan** dan dikosongkan lagi setiap kali form berhasil dikirim, jadi
penerbitan berikutnya menuntut pemeriksaan ulang.

---

## Gates

| Gate | Hasil |
|---|---|
| lint | ✅ tanpa warning |
| typecheck | ✅ |
| test | ✅ 127/127 (naik dari 94) |
| build | ✅ |

Tes baru: `knowledge-document.test.ts` (16), `audit.test.ts` (5),
`templates.test.ts` (12), `route-boundaries.test.ts` (2).

`route-boundaries.test.ts` mengunci temuan N1: tes gagal bila ada yang
menambahkan `loading.tsx` di atas rute yang bisa memanggil `notFound()`.

---

## Verifikasi runtime

Build produksi di port 5322, dikendalikan **Chromium sungguhan** lewat CDP —
bukan hanya `curl`. Ini pertama kalinya jalur form benar-benar diuji dari
peramban; Fase 3 dan 4 menandainya sebagai belum terverifikasi.

### Editor

| Yang diuji | Hasil |
|---|---|
| Dua editor ter-mount di halaman sunting | ✅ |
| Toolbar tampil di keduanya | ✅ |
| Tombol kerangka mengisi 7 bagian SOP | ✅ |
| JSON tersalin ke input tersembunyi | ✅ |
| Naskah masuk `localStorage` | ✅ |
| Galat konsol | ✅ tidak ada |

### Alur terbit

| Yang diuji | Hasil |
|---|---|
| Terbit tanpa konfirmasi redaksi | ✅ ditolak, pesannya menjelaskan sebabnya |
| Terbit dengan konfirmasi | ✅ status `PUBLISHED`, `publishedAt` terisi |
| Audit tercatat | ✅ `create → update → publish → update` |
| Sunting dokumen terbit | ✅ revisi dibuat berisi isi **lama** |
| Isi EN dibiarkan kosong | ✅ tersimpan `null`, bukan dokumen hampa |
| Halaman publik ID & EN | ✅ 200 tanpa build ulang |

**Seluruh data uji sudah dihapus** — dokumen, revisi, tag, kategori, dan
audit kembali 0.

---

## Belum diverifikasi

- Uji manual delapan titik (ID · EN · terang · gelap · 375 px · 1440 px ·
  keyboard · reduced motion) untuk halaman admin baru
- Editor dengan keyboard saja dan dengan pembaca layar
- Unggahan berkas — belum ada (5c)
