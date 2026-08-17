# 09 — DEFINITION OF DONE

"Selesai" berarti lolos **seluruh** daftar ini. Bukan "kode sudah ditulis".

---

## A. Gerbang otomatis

Keempatnya wajib lolos di mesin sendiri sebelum PR dibuka.

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm run test
```

```bash
npm run build
```

**Tanpa pengecualian.** Tidak ada `// @ts-ignore` untuk melewatkannya, tidak ada aturan ESLint yang dimatikan agar hijau. Kalau ada yang benar-benar tidak bisa diselesaikan, hentikan pekerjaan dan tanya.

---

## B. Gerbang manual — delapan pemeriksaan

Dijalankan setiap kali, bukan hanya yang terasa relevan.

| #   | Periksa          | Cara                        | Kriteria lolos                                                       |
| --- | ---------------- | --------------------------- | -------------------------------------------------------------------- |
| 1   | Bahasa Indonesia | Buka `/id/...`              | Semua teks Indonesia, tata letak utuh                                |
| 2   | Bahasa Inggris   | Buka `/en/...`              | Semua teks UI Inggris; konten belum diterjemahkan menampilkan banner |
| 3   | Tema terang      | Toggle                      | Kontras lolos, tanpa elemen tak terbaca                              |
| 4   | Tema gelap       | Toggle lalu **hard reload** | Tanpa kedipan putih                                                  |
| 5   | Mobile           | DevTools 375 px             | **Tanpa scroll horizontal**                                          |
| 6   | Desktop          | 1440 px                     | Konten tidak melebar berlebihan                                      |
| 7   | Keyboard         | `Tab` dari atas ke bawah    | Fokus selalu terlihat, tidak ada jebakan                             |
| 8   | Reduced motion   | Aktifkan di OS, reload      | Tanpa parallax, tanpa gerakan berulang                               |

Pemeriksaan 4 dan 5 adalah yang paling sering gagal.

---

## C. Gerbang isi kode

- [ ] Tidak ada teks langsung di JSX pada rute publik
- [ ] Tidak ada warna hex atau kelas warna Tailwind bawaan
- [ ] Tidak ada `console.log` tertinggal
- [ ] Tidak ada `any`, `@ts-ignore`, atau `!` tanpa alasan tertulis
- [ ] Tidak ada `TODO` yang tidak tercatat di `docs/phase-N/NOTES.md`
- [ ] Query database hanya di `src/data/`, semuanya menyaring status
- [ ] Server action memanggil `requireAdmin()` di baris pertama
- [ ] Tidak ada rahasia di kode, tes, atau data seed
- [ ] Tidak ada dependency baru di luar rencana fase
- [ ] Semua `Link` berasal dari `@/i18n/navigation`

---

## D. Gerbang dokumentasi

- [ ] `docs/phase-N/README.md` diperbarui: apa yang dibuat, keputusan, keterbatasan
- [ ] `docs/phase-N/NOTES.md` memuat temuan di luar cakupan
- [ ] Env var baru sudah ada di `.env.example` (**dengan nilai kosong**)
- [ ] Perintah baru terdokumentasi di README
- [ ] Status fase di README root diperbarui

---

## E. Laporan penutup fase

Wajib. Fase berikutnya dikerjakan berdasarkan ini.

```markdown
## Fase N — Laporan

**Berkas yang berubah:** …
**Perintah yang dijalankan:** …
**Migrasi:** …
**Env var baru:** …
**Dependency yang ditambah:** …

**Keterbatasan yang tersisa:**

- …

**Dibutuhkan untuk fase berikutnya:**

- …
```

---

## F. Yang bukan berarti selesai

| Kalimat                               | Kenyataan                           |
| ------------------------------------- | ----------------------------------- |
| "Jalan di mesin saya"                 | Belum diperiksa di 8 gerbang manual |
| "Nanti saya rapikan"                  | Sekarang, bukan nanti               |
| "Cuma perlu diterjemahkan"            | Belum selesai                       |
| "Tema gelap agak aneh tapi jalan"     | Belum selesai                       |
| "Belum saya cek di mobile"            | Belum selesai                       |
| "Tesnya saya skip dulu"               | Belum selesai                       |
| "Buildnya jalan kalau lint dimatikan" | Belum selesai                       |

---

## G. Gerbang tambahan per fase

| Fase | Tambahan                                                                                 |
| ---- | ---------------------------------------------------------------------------------------- |
| 1    | `/` → `/id`; login admin berhasil; tidak ada endpoint registrasi                         |
| 2    | Setiap komponen ada di dua tema × dua bahasa; fokus terlihat                             |
| 3    | Kecocokan pekerjaan terbaca < 2 menit; Recruiter Mode bisa dicetak; form kontak terkirim |
| 3.5  | Situs live; HTTPS; `robots.txt` memblokir `/admin`; sitemap valid                        |
| 4    | Draft tidak bisa diakses publik; state filter ada di URL; tabel bisa di-scroll di mobile |
| 5    | Setiap tipe dokumen bisa dibuat, dipratinjau, diterbitkan; edit membuat revisi           |
| 6    | Satu lab dan satu insiden lengkap; berkas publik sudah disanitasi                        |
| 7    | Pencarian menemukan istilah Indonesia dan Inggris; palet perintah bisa lewat keyboard    |
| 8    | `npm audit` bersih dari severity tinggi; Core Web Vitals memenuhi target                 |
| 9    | Tidak ada data yang dikarang; semua bukti lolos checklist redaksi                        |
