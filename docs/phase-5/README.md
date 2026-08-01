# FASE 5 — ADMIN CMS, EDITOR, MEDIA, REVISI

**Status:** 🟡 5a & 5b selesai · ⬜ manajer media tertunda (butuh Q13)
**Tanggal mulai:** 1 Agustus 2026

| Langkah | Cakupan | Status |
|---|---|---|
| **5a** | Editor Tiptap, CRUD dokumen, kategori, tag, revisi otomatis | ✅ Selesai |
| **5b** | Autosave, pratinjau, log audit, ekspor JSON/Markdown | ✅ Selesai |
| **5c** | Manajer media & bukti | ⛔ Tertunda — Q13 (penyimpanan objek) belum dijawab |

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


---

## 5b — Yang dibuat

### Log audit

`src/data/audit.ts` + `/admin/audit`.

Pencatatan dipasang di **lapisan data**, bukan di server action. Alasannya:
action baru yang lupa memanggil `recordAudit()` akan lolos tanpa jejak,
sedangkan mutasi selalu lewat fungsi data. Menaruhnya di sana membuat
"lupa mencatat" menjadi hampir mustahil.

`recordAudit()` **tidak pernah melempar** — kegagalan menulis log tidak
boleh membatalkan mutasi yang sudah berhasil. Kehilangan satu baris log
jauh lebih ringan daripada pengguna mengira simpanannya gagal lalu
menyimpan dua kali.

`metadata` hanya memuat pengenal yang aman ditampilkan. Isi dokumen tidak
pernah masuk ke sana: log audit tidak ikut alur redaksi, jadi apa pun yang
masuk lolos dari checklist.

Entitas yang tercatat: dokumen, kategori, tag, proyek, pengalaman,
keahlian, sertifikat, dan profil — termasuk yang seharusnya sudah dicatat
sejak 3b.

### Autosave & pemulihan lokal

`src/lib/use-local-draft.ts`. Draf disimpan ke `localStorage` per dokumen
setelah 1,5 detik diam.

Disimpan di **klien, bukan server**: draf setengah jadi tidak perlu
menyentuh database, dan menyimpannya di server berarti ikut ke backup dan
ekspor tanpa pernah lolos checklist redaksi.

Draf lebih tua dari 7 hari dibuang, tidak ditawarkan — menawarkan pemulihan
dari dua minggu lalu lebih membingungkan daripada membantu. Kegagalan
`localStorage` (mode privat, kuota penuh) didiamkan: autosave adalah
kemewahan, kegagalannya tidak boleh mengganggu penyuntingan.

### Pratinjau

Memakai `ProseMirrorContent` — **renderer yang sama persis** dengan halaman
publik. Karena itu `NextIntlClientProvider` ditambahkan di layout admin:
bukan untuk menerjemahkan antarmuka admin, melainkan supaya komponen
bersama punya sumber terjemahan. Pratinjau yang berbeda dari hasil
sebenarnya lebih buruk daripada tidak ada pratinjau.

### Ekspor

`/admin/backup` + Route Handler `/admin/backup/export`.

Route Handler, bukan server action: yang dikirim adalah berkas, dan server
action tidak bisa mengembalikan `Content-Disposition`.

- **JSON** mengikuti format seed di `04_SEED_CONTENT_DRAFT.md` §2, jadi
  berkasnya sekaligus bisa dipakai memulihkan.
- **Markdown** untuk dibaca manusia. `src/lib/prosemirror/to-markdown.ts`,
  9 tes.

Yang **tidak** ikut: bukti yang belum dikonfirmasi redaksinya, aset privat,
isi versi lama, dan pesan kontak.

---

## Gates 5b

| Gate | Hasil |
|---|---|
| lint | ✅ tanpa warning |
| typecheck | ✅ |
| test | ✅ 103/103 (naik dari 94) |
| build | ✅ termasuk 3 rute admin baru |

## Verifikasi runtime 5b

| Yang diuji | Hasil |
|---|---|
| `/admin/audit`, `/admin/backup` tanpa sesi | ✅ 307 ke login |
| Endpoint ekspor tanpa sesi | ✅ 307 — berkas tidak terkirim |
| Keduanya dengan sesi admin | ✅ 200 |
| Header unduhan JSON | ✅ `attachment`, `Cache-Control: no-store, private` |
| Header unduhan Markdown | ✅ `text/markdown`, `attachment` |

`no-store` disengaja: berkas backup memuat draft, jadi tidak boleh
tersimpan di cache perantara mana pun.
