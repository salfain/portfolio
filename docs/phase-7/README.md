# FASE 7 — PENCARIAN, SEO, UX LANJUTAN

**Status:** ✅ Kode selesai
**Tanggal:** 1 Agustus 2026

---

## Ruang lingkup

| Deliverable `01_PHASES.md`     | Status                            |
| ------------------------------ | --------------------------------- |
| Command palette seluruh situs  | ✅                                |
| Pencarian full-text PostgreSQL | ✅                                |
| Gambar Open Graph dinamis      | ✅                                |
| Structured data & RSS          | ✅                                |
| Peringkat konten terkait       | ✅                                |
| Analitik sadar privasi         | ⏭ dilewati atas keputusan pemilik |
| Passkey & 2FA (opsional)       | ⏭ ditandai opsional di PRD        |
| Ekspor PDF (opsional)          | ⏭ ditandai opsional di PRD        |

Analitik dilewati dengan sengaja, dan halaman Kebijakan Privasi karenanya
tetap benar apa adanya: _"situs ini tidak memakai layanan analitik apa pun."_
Menambahkan analitik tanpa memperbarui halaman itu berarti halaman privasi
berbohong — dan itu jenis kesalahan yang paling merusak kepercayaan.

---

## Pencarian full-text

### N4 Fase 1 akhirnya terjawab

Pertanyaan yang tertunda sejak Fase 1: apakah PostgreSQL punya konfigurasi
teks `indonesian`? **Ada**, terverifikasi di PostgreSQL 16. Jadi pencarian
memakai stemming Indonesia sungguhan, bukan `simple`.

Bedanya nyata:

| Kata                     | `indonesian`  | `simple`      |
| ------------------------ | ------------- | ------------- |
| pengaturan               | atur          | pengaturan    |
| pengguna                 | guna          | pengguna      |
| penyelesaian             | selesai       | penyelesaian  |
| keamanan                 | aman          | keamanan      |
| router, printer, koneksi | tidak berubah | tidak berubah |

Artinya "mengatur", "pengaturan", dan "diatur" saling menemukan — yang justru
inti persoalan pencarian bahasa Indonesia. Istilah teknis serapan dibiarkan
utuh. Satu kasus meleset tercatat di [NOTES.md](NOTES.md) N1.

### Kolom generated, bukan kolom yang diisi aplikasi

```sql
searchVector tsvector GENERATED ALWAYS AS (...) STORED
```

Nilainya selalu ikut berubah saat baris disunting, termasuk lewat SQL
langsung. Kolom yang diisi aplikasi akan basi tanpa ada yang menyadarinya —
dan indeks pencarian yang basi lebih buruk daripada tidak ada, karena ia
menjawab dengan yakin memakai isi lama.

Bobot: **A** judul & kode dokumen · **B** ringkasan · **C** isi.
Indeks GIN pada `KnowledgeDocument` dan `Project`.

### `websearch_to_tsquery`, bukan `to_tsquery`

`to_tsquery` melempar galat untuk masukan seperti `(` — yang berarti 500
hanya karena pengunjung mengetik kurung. `websearch_to_tsquery` tidak pernah
melempar, dan sintaksnya (tanda kutip untuk frasa, `-` untuk mengecualikan)
sudah dikenal siapa pun yang pernah memakai mesin pencari.

### Urutan hasil

Tanpa kata kunci, listing memakai urutan editorial seperti sebelumnya.
Dengan kata kunci, urutannya **relevansi** — dokumen unggulan tidak lagi
naik ke atas hanya karena ditandai unggulan. Pengunjung yang mengetik kata
kunci sedang meminta yang paling cocok, bukan yang paling dipromosikan.

### Konten terkait

Sebelumnya "terkait" berarti berkategori sama lalu diurutkan tanggal — yang
membuat dokumen terbaru di kategori itu selalu muncul, relevan atau tidak.
Sekarang leksem berbobot tertinggi dari dokumen sumber dipakai sebagai kueri
terhadap dokumen lain. Kategori yang sama tetap memberi dorongan, tapi bukan
lagi syarat: insiden tentang DHCP layak muncul di SOP tentang DHCP meski
kategorinya berbeda.

---

## Command palette

Dibuka `Ctrl/Cmd+K` **atau** tombol di navbar — pintasan keyboard saja tidak
cukup karena tidak ada yang menemukannya tanpa diberi tahu.

Memakai Radix Dialog seperti lightbox bukti: jebakan fokus, Escape, dan
pengembalian fokus sudah benar tanpa ditulis ulang. Yang ditambahkan hanya
pola combobox/listbox ARIA dan navigasi panah.

Permintaan lama dibatalkan (`AbortController`) saat kata kunci berubah.
Tanpa itu, balasan yang datang terlambat menimpa hasil yang lebih baru —
hasil yang "melompat mundur" tepat saat pengguna selesai mengetik.

Dimuat `next/dynamic` dengan `ssr: false`: isinya tidak pernah terlihat
sampai seseorang membukanya.

---

## SEO

| Yang dibuat                              | Catatan                                                    |
| ---------------------------------------- | ---------------------------------------------------------- |
| `opengraph-image` per dokumen            | Dibuat saat diminta, isinya hanya dari dokumen itu sendiri |
| `TechArticle` + `BreadcrumbList` JSON-LD | Di halaman detail dokumen                                  |
| `Person` JSON-LD                         | Di beranda, hanya bila profil sudah diisi                  |
| RSS per bahasa                           | `/id/knowledge/rss.xml` dan `/en/...`                      |

Aturan yang mengalahkan pertimbangan SEO mana pun di sini: **field yang
datanya tidak ada tidak diisi.** Schema.org punya banyak properti menggoda —
`worksFor`, `award`, `aggregateRating` — dan mengisinya dengan tebakan
berarti mengarang fakta di tempat yang justru dibaca mesin sebagai
pernyataan resmi.

Gambar OG tidak memakai aset apa pun dari luar: hanya teks dokumen di atas
warna solid.

---

## Gates

| Gate      | Hasil                      |
| --------- | -------------------------- |
| lint      | ✅ tanpa warning           |
| typecheck | ✅                         |
| test      | ✅ 191/191 (naik dari 185) |
| build     | ✅                         |

---

## Verifikasi runtime

### Pencarian

| Yang diuji                                       | Hasil                |
| ------------------------------------------------ | -------------------- |
| "mengatur" menemukan dokumen berisi "pengaturan" | ✅                   |
| "guna" menemukan dokumen berisi "pengguna"       | ✅                   |
| Judul (bobot A) menang atas isi (bobot C)        | ✅ rank 0.61 vs 0.12 |
| `((` , kutip tak tertutup, `' OR 1=1 --`         | ✅ 200, bukan 500    |

### Command palette

| Yang diuji                                     | Hasil        |
| ---------------------------------------------- | ------------ |
| Tombol terlihat di navbar                      | ✅           |
| Ctrl+K membuka                                 | ✅           |
| Fokus langsung di kotak isian                  | ✅           |
| `aria-activedescendant` menunjuk opsi yang ada | ✅           |
| Panah bawah memindahkan pilihan                | ✅           |
| Enter membuka halaman hasil                    | ✅           |
| Galat konsol                                   | ✅ tidak ada |

### SEO

| Yang diuji                       | Hasil                           |
| -------------------------------- | ------------------------------- |
| OG dokumen terbit                | ✅ 200 image/png                |
| OG slug tidak ada                | ✅ tetap gambar, bukan galat    |
| JSON-LD terbaca sebagai JSON sah | ✅ TechArticle + BreadcrumbList |
| RSS                              | ✅ 200, XML sah                 |

**Seluruh data uji sudah dihapus.**

---

## Belum diverifikasi

- Uji manual delapan titik untuk palette
- Palette dengan pembaca layar sungguhan
- Perilaku pencarian pada ratusan dokumen — korpus uji hanya tiga dokumen
