# 00 — ALUR KERJA SATU FASE

---

## Aturan fase

Satu fase dikerjakan pada satu waktu. Fase berikutnya **tidak dimulai** sebelum fase saat ini lolos [Definition of Done](09_DEFINITION_OF_DONE.md).

```
0 ✅  1 ⬜  2 ⬜  3 ⬜  3.5 ⬜ DEPLOY  4 ⬜  5 ⬜  6 ⬜  7 ⬜  8 ⬜  9 ⬜
```

Fase yang sedang berjalan selalu tertulis di [README.md](../../README.md) root.

---

## Sebelum mulai

1. Baca bagian fase tersebut di [`../01_PHASES.md`](../01_PHASES.md).
2. Baca berkas hasil fase sebelumnya di `docs/phase-N/`.
3. Periksa `docs/phase-0/06_OPEN_QUESTIONS.md` — adakah pertanyaan penghambat yang belum dijawab?
4. Tulis rencana singkat: berkas apa yang dibuat, dependency apa yang dipasang, risiko apa yang terlihat.
5. **Ajukan rencana itu dan tunggu persetujuan.** Jangan langsung menulis kode.

Poin 5 bukan formalitas. Rencana yang salah arah lebih murah diperbaiki di paragraf daripada di 30 berkas.

---

## Saat mengerjakan

### Pecah menjadi commit kecil

Satu commit = satu perubahan yang utuh dan bisa dijelaskan dalam satu kalimat. Lihat [08_GIT_AND_PR.md](08_GIT_AND_PR.md).

### Jalankan gerbang lebih awal, bukan hanya di akhir

```bash
npm run typecheck
```

Jalankan setiap kali selesai satu bagian. Menemukan 40 error tipe di akhir fase jauh lebih menyakitkan daripada 2 error sekarang.

### Menemukan masalah di luar cakupan?

Tulis di `docs/phase-N/NOTES.md`, **jangan dikerjakan.** Contoh:

```markdown
## Temuan di luar cakupan

- `src/lib/format.ts:23` — format tanggal tidak memakai timezone tetap,
  berpotensi hydration mismatch. Tidak diperbaiki: di luar cakupan Fase 4.
```

### Butuh dependency baru yang tidak ada di rencana?

Berhenti dan tanya. Setiap dependency menambah ukuran bundle, permukaan keamanan, dan beban pemeliharaan. Terutama:

- **Library animasi kedua** — dilarang mutlak, hanya Motion for React.
- **Library UI kedua** — dilarang.
- **Library tanggal** (moment, date-fns) — pakai `Intl` yang sudah ada.
- **Library util** (lodash) — hampir selalu bisa diganti beberapa baris.

---

## Sebelum menyatakan selesai

Jalankan berurutan. Semuanya harus lolos:

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

Lalu periksa manual — ini yang paling sering dilewatkan:

| Periksa | Cara |
|---|---|
| Bahasa Indonesia | Buka `/id/...` |
| Bahasa Inggris | Buka `/en/...` |
| Tema terang | Toggle tema |
| Tema gelap | Toggle tema, lalu **hard reload** untuk memastikan tidak ada flash |
| Mobile | DevTools 375 px |
| Desktop | 1440 px |
| Keyboard | Tab dari atas ke bawah, pastikan fokus selalu terlihat |
| Reduced motion | Aktifkan di OS, pastikan tidak ada gerakan berlebihan |

Delapan-delapannya, setiap kali. Bukan hanya yang terasa relevan.

---

## Menutup fase

1. Perbarui `docs/phase-N/README.md`: apa yang dibuat, keputusan yang diambil, keterbatasan yang tersisa.
2. Perbarui status fase di `README.md` root.
3. Laporkan: berkas yang berubah, perintah yang dijalankan, migrasi, env var baru, keterbatasan, dependency untuk fase berikutnya.
4. Tunggu pemeriksaan.

Laporan poin 3 wajib. Fase berikutnya dikerjakan berdasarkan laporan ini.

---

## Yang tidak boleh dilakukan

| ❌ | Kenapa |
|---|---|
| Mengerjakan sebagian Fase 5 saat masih di Fase 4 | Merusak disiplin fase dan mempersulit pemeriksaan |
| Merombak kode fase sebelumnya tanpa diminta | Fase sebelumnya sudah lolos pemeriksaan |
| `// TODO: nanti` tanpa mencatatnya di NOTES.md | TODO yang tidak tercatat tidak akan pernah dikerjakan |
| Menonaktifkan aturan ESLint agar build lolos | Perbaiki penyebabnya, atau tanya |
| `npm run build -- --no-lint` | Sama seperti di atas |
| Melakukan commit `.env.local` | Kebocoran kredensial |
| Mengubah `prisma/schema.prisma` tanpa migrasi | Database dev dan skema jadi tidak sinkron |
