# FASE 6 — PNETLAB, INSIDEN, BUKTI TERSTRUKTUR

**Status:** 🟡 Kode selesai — kriteria terima menunggu isi konten
**Tanggal:** 1 Agustus 2026

---

## Yang bisa dan tidak bisa diselesaikan di fase ini

Kriteria terima `01_PHASES.md` menuntut **"satu lab dan satu insiden lengkap
diterbitkan."** Itu tidak bisa dikerjakan tanpa isi dari pemilik, dan isinya
tidak dikarang.

| Kriteria                                        | Status                                    |
| ----------------------------------------------- | ----------------------------------------- |
| Satu lab lengkap diterbitkan                    | ⬜ menunggu konten                        |
| Satu insiden lengkap diterbitkan                | ⬜ menunggu konten                        |
| Berkas publik tersanitasi                       | ✅ ditegakkan lapisan media               |
| Bukti asli/privat dipisah dari publik/teredaksi | ✅ ditegakkan di query dan penyaji berkas |

Yang dikerjakan: **seluruh strukturnya**, siap diisi.

**Penghambat isi yang paling menentukan adalah Q5** di
`docs/phase-0/06_OPEN_QUESTIONS.md` — apakah dua laporan insiden yang
direncanakan berasal dari kejadian nyata atau direproduksi di lab. Itu bukan
soal teks: jawabannya mengubah checklist redaksi mana yang berlaku dan penanda
apa yang wajib tampil di halaman.

---

## Yang dibuat

### Metadata terstruktur

Bentuk dasarnya sudah ditetapkan di `docs/phase-0/04_SEED_CONTENT_DRAFT.md` §4.
Fase 6 memperluasnya dengan blok bukti yang diminta `01_PHASES.md`.

**Tidak ada perubahan skema** — kolom `KnowledgeDocument.metadata` sudah ada
sejak Fase 1.

| Berkas                              | Isi                                                        |
| ----------------------------------- | ---------------------------------------------------------- |
| `lib/knowledge-metadata.ts`         | Parser tabel baris-per-entri, normalisasi status kasus uji |
| `lib/schemas/knowledge-metadata.ts` | Zod per tipe dokumen, perakit dari form                    |

Kolom `Json` berarti bentuknya **tidak** dijaga database. Skema Zod inilah
satu-satunya penjaganya, dan ia bekerja di kedua arah: saat menyimpan dari
form, dan saat membaca untuk dirender.

**Lab:** topologi, perkiraan jam, inventaris perangkat, rencana VLAN, rencana
pengalamatan IP, kasus uji, simulasi gangguan.

**Insiden:** nomor, prioritas, dampak, urgensi, layanan terdampak, waktu
penyelesaian, kronologi, akar masalah, solusi sementara, penyelesaian,
validasi, pencegahan, SOP terkait — dan `isLabReproduction`.

### `isLabReproduction` wajib dijawab

`07_SCHEMA_DECISIONS.md` penyimpangan #8 menambahkannya justru untuk mencegah
insiden lab tampil sebagai insiden produksi. Karena itu field-nya **tidak punya
nilai default**: pilihan di form dimulai kosong, dan skema menolak dokumen yang
belum menjawabnya.

Nilai default apa pun akan menjawab pertanyaan itu tanpa penulisnya sadar — dan
menyajikan skenario lab sebagai kejadian nyata adalah mengarang pengalaman
(CLAUDE.md aturan 1).

Insiden yang menyatakan dirinya reproduksi lab mendapat penanda mencolok di
paling atas halaman publiknya, dan penanda itu tidak bisa dimatikan.

### Cara mengisi tabel

Satu entri per baris, kolom dipisah `|` — pola yang sudah dipakai bagian
naratif sejak Fase 3:

```
R1 | Router | MikroTik CHR | perangkat inti
Kantor | 10.10.0.0/24 | 10 | 10.10.0.1
T1 | ping antar VLAN | balasan diterima | balasan diterima | lulus
```

Antarmuka array dinamis akan lebih rapi dilihat, tapi lebih lambat dipakai
untuk mengisi sepuluh baris rencana IP — dan pola ini tidak menuntut siapa pun
mempelajari cara baru.

### Status kasus uji tidak pernah menebak

Nilai yang tidak terbaca menjadi **"Belum dicatat"** dengan warna netral, bukan
"Lulus" hijau. Lab yang menampilkan centang hijau karena penulisnya salah ketik
bukan lagi halaman bukti — ia halaman klaim.

### Komponen publik

| Berkas                                        | Isi                                         |
| --------------------------------------------- | ------------------------------------------- |
| `components/knowledge/evidence-table.tsx`     | Tabel bukti + ringkasan label–nilai         |
| `components/knowledge/lab-blocks.tsx`         | Seluruh blok lab                            |
| `components/knowledge/incident-blocks.tsx`    | Seluruh blok insiden + penanda skenario lab |
| `components/knowledge/evidence-downloads.tsx` | Berkas pendukung yang boleh diunduh         |

Bukti kini dipisah menurut cara pakainya: yang bisa dilihat masuk galeri,
sisanya jadi daftar unduhan. Tanpa pemisahan itu arsip ZIP muncul di galeri
sebagai gambar rusak.

Bagian yang tabelnya kosong **tidak dirender sama sekali** — lab yang belum
sempat mencatat rencana VLAN lebih baik tidak menampilkan judul di atas ruang
kosong.

---

## Gates

| Gate      | Hasil                      |
| --------- | -------------------------- |
| lint      | ✅ tanpa warning           |
| typecheck | ✅                         |
| test      | ✅ 185/185 (naik dari 162) |
| build     | ✅                         |

Tes baru: `knowledge-metadata.test.ts` (13) dan
`schemas/knowledge-metadata.test.ts` (11).

---

## Verifikasi runtime

Build produksi di port 5322, dikendalikan Chromium sungguhan.

### Form insiden

| Yang diuji                          | Hasil        |
| ----------------------------------- | ------------ |
| Pilihan asal insiden dimulai kosong | ✅           |
| Simpan tanpa menjawab asal insiden  | ✅ ditolak   |
| Simpan setelah menjawab             | ✅ tersimpan |

### Halaman publik

| Yang diuji                                                           | Hasil                           |
| -------------------------------------------------------------------- | ------------------------------- |
| Penanda skenario lab di halaman insiden                              | ✅ ID dan EN                    |
| Nomor, prioritas, dampak, urgensi, waktu penyelesaian                | ✅                              |
| Kronologi                                                            | ✅                              |
| Akar masalah dan pencegahan                                          | ✅                              |
| Blok lab: topologi, perangkat, VLAN, rencana IP, kasus uji, gangguan | ✅                              |
| Status kasus uji tak terbaca                                         | ✅ "Belum dicatat", tidak hijau |
| Berkas publik di daftar unduhan                                      | ✅                              |
| Berkas **privat** di HTML halaman                                    | ✅ tidak muncul sama sekali     |
| Berkas privat diminta langsung tanpa sesi                            | ✅ 404                          |

**Seluruh data uji sudah dihapus** — dokumen, media, dan audit kembali 0.

---

## Belum diverifikasi

- Uji manual delapan titik untuk halaman lab dan insiden
- Tabel bukti di layar 375 px dengan pembaca layar
- Kriteria terima fase: satu lab dan satu insiden lengkap yang benar-benar
  diterbitkan
