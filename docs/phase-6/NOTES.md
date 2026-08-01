# FASE 6 — CATATAN & TEMUAN

---

## N1 — Kriteria terima fase ini tidak bisa dipenuhi tanpa pemilik 🔴 TERBUKA

`01_PHASES.md` menuntut satu lab dan satu insiden **lengkap dan terbit**.
Struktur untuk keduanya sudah ada dan sudah diuji; isinya tidak.

Ini bukan pekerjaan yang tertinggal, melainkan pekerjaan yang memang tidak
boleh dikerjakan siapa pun selain pemiliknya. Lab tanpa screenshot topologi
asli dan output terminal asli tidak boleh diterbitkan
(`00_CONTENT_INVENTORY.md` bagian 7).

**Yang menghambat, berurut kepentingannya:**

| # | Pertanyaan | Kenapa menentukan |
|---|---|---|
| Q5 | Insiden nyata atau reproduksi lab? | Menentukan checklist redaksi mana yang berlaku dan penanda apa yang wajib tampil |
| Q4 | Nama perusahaan & sekolah boleh disebut? | Menentukan apakah bukti perlu diredaksi lebih dalam |
| Q6 | Metrik yang benar-benar tercatat | `resolutionMinutes` hanya diisi bila waktunya tercatat |

---

## N2 — Metadata terstruktur di kolom `Json`, bukan tabel sendiri

Inventaris perangkat, rencana IP, kasus uji, dan kronologi disimpan di
`KnowledgeDocument.metadata`.

**Kenapa bukan tabel relasional:** setiap tabel baru berarti migrasi,
sedangkan bentuk data ini masih akan berubah begitu lab dan insiden pertama
benar-benar ditulis. Kolom `Json` menahan perubahan itu tanpa migrasi
berulang, dan `04_SEED_CONTENT_DRAFT.md` §4 memang sudah menetapkan
`metadata` sebagai tempatnya.

**Harganya, dan ini nyata:** database tidak menjaga bentuknya sama sekali.
Satu-satunya penjaga adalah skema Zod di `lib/schemas/knowledge-metadata.ts`,
dan ia harus dipakai di KEDUA arah — saat menyimpan dan saat membaca.
Melewatinya di satu tempat saja berarti komponen menerima bentuk yang tidak
pernah divalidasi.

Bila nanti kasus uji perlu dicari atau diurutkan lintas dokumen (Fase 7),
kolom `Json` tidak akan cukup dan tabel tersendiri jadi keharusan.

---

## N3 — Metadata lama tanpa `kind` tetap dibaca

Bentuk asli di `04_SEED_CONTENT_DRAFT.md` §4 tidak punya penanda tipe.
Skema Fase 6 memakai `discriminatedUnion` yang menuntutnya.

Alih-alih menolak data lama yang sah, `kind` ditambahkan saat membaca —
tipenya sudah diketahui dari kolom `type`, jadi tidak ada yang perlu ditebak.

Satu pengecualian yang disengaja: **insiden tanpa `isLabReproduction` tetap
ditolak** dan menghasilkan `null` saat dibaca. Dokumen lama yang metadatanya
belum lengkap tidak boleh diam-diam dianggap insiden nyata.

---

## N4 — Tabel diketik sebagai teks, bukan lewat antarmuka array

Kolom dipisah `|`, satu entri per baris. Pola ini sudah dipakai bagian
naratif sejak Fase 3.

Kelemahannya jujur: tidak ada validasi per kolom saat mengetik, dan salah
hitung kolom baru ketahuan setelah disimpan. Yang menahan kerusakannya:
kolom yang kurang menjadi string kosong (barisnya tetap tampil), kolom
berlebih diabaikan, dan baris tanpa kolom pertama dibuang — karena kolom
pertama selalu identitas entri.

Bila nanti terasa mengganggu saat mengisi lab sungguhan, penggantinya adalah
antarmuka baris dinamis — bukan menambah aturan ke format teks ini.

---

## N5 — Cache data menyembunyikan media yang baru ditambahkan

Terlihat saat verifikasi: bukti yang dimasukkan **langsung ke database**
tidak muncul di halaman sampai `.next/cache` dibersihkan.

Bukan bug aplikasi — `unstable_cache` memang menyimpan hasil query dengan
tag `knowledge`, dan seluruh aksi media memanggil `revalidateTag('knowledge')`
setelah menyimpan. Yang melewatinya hanyalah skrip verifikasi yang menulis
ke database tanpa lewat aplikasi.

Dicatat di sini supaya siapa pun yang menyunting database langsung tahu
sebabnya sebelum mengira ada kebocoran cache.
