# FASE 5 — ADMIN CMS, EDITOR, MEDIA, REVISI

**Status:** 🟡 5a selesai · ⬜ 5b belum mulai
**Tanggal mulai:** 1 Agustus 2026

| Langkah | Cakupan | Status |
|---|---|---|
| **5a** | Editor Tiptap, CRUD dokumen, kategori, tag, revisi otomatis | ✅ Selesai |
| **5b** | Autosave & pemulihan lokal, pratinjau ID/EN, manajer media, log audit, ekspor JSON/Markdown | ⬜ Belum |

---

## 5a — Yang dibuat

### Editor Tiptap

| Berkas | Isi |
|---|---|
| `components/admin/editor/index.tsx` | Pembungkus `next/dynamic`, `ssr: false` |
| `components/admin/editor/rich-text-editor.tsx` | Instance Tiptap, keluaran JSON ke hidden input |
| `components/admin/editor/editor-toolbar.tsx` | Bilah alat, `aria-pressed` per tombol |

**Ekstensi sengaja dibatasi** pada yang bisa dirender
`src/lib/prosemirror/render.tsx`. Mengaktifkan ekstensi yang tidak dikenal
renderer menghasilkan blok yang bisa disunting tapi **hilang di halaman
publik** — kegagalan yang tidak terlihat sampai dokumen terbit.

Daftar-izin skema tautan di editor (`http`, `https`, `mailto`) disamakan
dengan `safeLink()` di sisi render. Kalau editor mengizinkan lebih banyak,
tautannya hilang diam-diam saat dirender dan pengguna mengira sudah tersimpan.

### Template blok wajib

`src/lib/schemas/document-templates.ts` — kerangka per tipe dokumen dari
`04_SEED_CONTENT_DRAFT.md` §3.

Template hanya menyisipkan **judul bagian**; tidak ada satu kalimat isi pun
yang dikarang. Gunanya bukan menghemat ketikan, melainkan supaya tidak ada
blok wajib yang terlewat — SOP tanpa bagian "Eskalasi" baru ketahuan hilang
saat seseorang benar-benar butuh eskalasi.

Blok yang belum ada ditampilkan sebagai peringatan lembut, **bukan
penghalang simpan**.

### CRUD dokumen

`/admin/knowledge` · `/admin/knowledge/new` · `/admin/knowledge/[id]` ·
`/admin/categories` · `/admin/tags`

Aturan yang ditegakkan:

- Menyunting dokumen yang **sudah terbit** mewajibkan ringkasan perubahan,
  dan otomatis membuat satu entri `KnowledgeRevision`. Revisi merekam isi
  **sebelum** perubahan supaya riwayatnya terbaca "dulu begini, lalu diubah".
- Apakah dokumen benar-benar sudah terbit dibaca dari **database**, bukan
  dari nilai yang dikirim klien.
- Tipe dokumen dikunci setelah terbit — mengubahnya memindahkan URL publik.
- Menerbitkan dengan isi bahasa Indonesia kosong ditolak.
- Isi Inggris yang kosong disimpan sebagai `null`, bukan dokumen kosong,
  supaya halaman `/en` memakai fallback dan bukan menampilkan artikel kosong.
- Tag dibuat otomatis saat diketik, di dalam transaksi yang sama dengan
  dokumennya — percobaan simpan yang gagal tidak meninggalkan tag yatim.
- Kategori yang masih dipakai menolak dihapus, dengan pesan yang menjelaskan
  sebabnya.

---

## Gates 5a

| Gate | Hasil |
|---|---|
| lint | ✅ tanpa warning |
| typecheck | ✅ |
| test | ✅ 94/94 |
| build | ✅ termasuk 3 rute admin baru |

---

## Verifikasi runtime 5a

| Yang diuji | Hasil |
|---|---|
| `/admin/knowledge`, `/new`, `/categories`, `/tags` tanpa sesi | ✅ 307 ke login |
| Keempatnya dengan sesi admin | ✅ 200 |
| **Tiptap di bundel halaman publik** | ✅ **tidak ada di satu pun dari 26 halaman publik** |
| Tiptap di bundel awal halaman admin | ✅ tidak ada — dimuat lazy saat editor dibuka |

Pemeriksaan bundel dilakukan dengan membaca `app-build-manifest.json` dan
mencari chunk yang memuat kode ProseMirror/Tiptap, lalu memeriksa halaman
mana yang merujuknya. Tiga chunk memuat Tiptap; tidak satu pun dirujuk
halaman publik.

---

## Belum diverifikasi

Menyimpan dokumen lewat peramban sungguhan — payload server action tidak
bisa dirakit dengan `curl` (sama seperti Fase 3, NOTES N16). Skema, lapisan
data, dan jalur revisi sudah lolos typecheck dan tes, tapi **alur simpan
dari editor wajib dicoba manual.**
