# Muhammad Sya'ban Alfain — IT Support Portfolio & Knowledge Base

Situs portofolio profesional dan Knowledge Base, dibangun dari nol.
Bilingual (`/id` · `/en`) dan bertema terang/gelap sejak commit pertama.

---

## Status

| | |
|---|---|
| **Fase saat ini** | Fase 6 — PNETLab, insiden, bukti terstruktur |
| **Status** | 🟡 Kode selesai · ⏳ kriteria terima menunggu satu lab & satu insiden dari pemilik |
| **Kode aplikasi** | 25 rute publik × 2 bahasa · 25 rute admin · 185 tes |
| **Berikutnya** | Fase 7 — pencarian, analitik, SEO, UX lanjutan |

**Penghambat isi:** Q4–Q10 di
[docs/phase-0/06_OPEN_QUESTIONS.md](docs/phase-0/06_OPEN_QUESTIONS.md) belum
dijawab. Strukturnya sudah siap; halaman tetap kosong sampai datanya diisi.
Tidak ada fakta yang dikarang untuk menutupinya.

**Penghambat deploy (Fase 3.5):** perlindungan form kontak belum lengkap —
lihat [docs/phase-3/NOTES.md](docs/phase-3/NOTES.md) N3.

---

## Alur fase

```
0 ✅ Discovery & inventaris konten
1 ✅ Fondasi, arsitektur, i18n, tema
2 ✅ Design system, shell publik, motion
3 ✅ Portofolio inti & Recruiter Mode
3.5 🟡 DEPLOY — artefak siap, eksekusi menunggu akun pemilik
4 ✅ Knowledge Base publik   ← kode selesai, konten kosong
5 ✅ Admin CMS, editor, media, revisi   ← kode selesai, konten kosong
6 🟡 PNETLab, insiden, bukti terstruktur   ← struktur selesai, konten menunggu
7 ⬜ Pencarian, analitik, SEO, UX lanjutan
8 ⬜ QA, keamanan, performa, hardening
9 ⬜ Peluncuran konten & perbaikan berkelanjutan
```

Satu fase dikerjakan pada satu waktu. Fase berikutnya tidak dimulai
sebelum fase saat ini lolos pemeriksaan.

**Gerbang wajib tiap fase:** lint · typecheck · production build ·
bekerja di ID dan EN · bekerja di terang dan gelap · bekerja di mobile dan desktop.

---

## Untuk pemilik proyek

Prompt penugasan per fase: **[docs/PROMPTS.md](docs/PROMPTS.md)** —
prompt global, prompt tiap fase, prompt pemeriksaan, dan prompt perbaikan.

---

## Untuk developer

**Mulai dari sini:** [CLAUDE.md](CLAUDE.md) → [docs/rules/](docs/rules/README.md)

| Dokumen | Isi |
|---|---|
| [rules/00_WORKFLOW.md](docs/rules/00_WORKFLOW.md) | Cara mengerjakan satu fase dari awal sampai selesai |
| [rules/01_CODE_CONVENTIONS.md](docs/rules/01_CODE_CONVENTIONS.md) | Struktur folder, penamaan, Server vs Client, TypeScript |
| [rules/02_STYLING.md](docs/rules/02_STYLING.md) | Tailwind, design token, tema |
| [rules/03_I18N.md](docs/rules/03_I18N.md) | Aturan bilingual |
| [rules/04_MOTION.md](docs/rules/04_MOTION.md) | Animasi & reduced motion |
| [rules/05_ACCESSIBILITY.md](docs/rules/05_ACCESSIBILITY.md) | WCAG AA |
| [rules/06_SECURITY.md](docs/rules/06_SECURITY.md) | Auth, validasi, unggahan, rahasia |
| [rules/07_DATA_PRISMA.md](docs/rules/07_DATA_PRISMA.md) | Query, migrasi, cache |
| [rules/08_GIT_AND_PR.md](docs/rules/08_GIT_AND_PR.md) | Branch, commit, PR |
| [rules/09_DEFINITION_OF_DONE.md](docs/rules/09_DEFINITION_OF_DONE.md) | Kapan disebut selesai |
| [rules/10_TROUBLESHOOTING.md](docs/rules/10_TROUBLESHOOTING.md) | Error umum & penyebabnya |
| [rules/11_GLOSSARY.md](docs/rules/11_GLOSSARY.md) | Istilah proyek, IT Support, dan teknis |

---

## Dokumentasi produk

**Baca berurutan:**

1. [docs/00_MASTER_PRD.md](docs/00_MASTER_PRD.md) — PRD utama
2. [docs/01_PHASES.md](docs/01_PHASES.md) — deliverable & kriteria per fase
3. [docs/02_DESIGN_AND_DATA.md](docs/02_DESIGN_AND_DATA.md) — palet, motion token, entitas
4. [docs/03_CODEX_PROMPTS.md](docs/03_CODEX_PROMPTS.md) — prompt per fase
5. [docs/04_DATABASE_DRAFT.prisma](docs/04_DATABASE_DRAFT.prisma) — draf skema awal

**Hasil kerja per fase:**

- [docs/phase-0/](docs/phase-0/) — inventaris konten, klasifikasi aset, checklist redaksi,
  copy profil, format seed, peta rute, keputusan skema, kebijakan bilingual
- [docs/phase-1/](docs/phase-1/) — fondasi, i18n, tema, Prisma, Better Auth
- [docs/phase-2/](docs/phase-2/) — design token, komponen UI, shell publik, motion
- [docs/phase-3/](docs/phase-3/) — lapisan data, halaman portofolio, Recruiter Mode
- [docs/phase-3.5/](docs/phase-3.5/) — runbook deploy
- [docs/phase-4/](docs/phase-4/) — Knowledge Base, renderer dokumen, filter
- [docs/phase-5/](docs/phase-5/) — Admin CMS, editor Tiptap, revisi, bukti, jejak audit
- [docs/phase-6/](docs/phase-6/) — metadata lab & insiden, blok bukti terstruktur

> Temuan terbuka tiap fase ada di `NOTES.md` masing-masing.
> Yang menghambat deploy tercatat di [docs/phase-3/NOTES.md](docs/phase-3/NOTES.md).

> ⚠️ Bila `docs/phase-0/07_SCHEMA_DECISIONS.md` bertentangan dengan
> `docs/04_DATABASE_DRAFT.prisma`, **yang berlaku adalah berkas fase-0.**
> Enam penyimpangan dari PRD yang sudah disetujui tercatat di
> [docs/phase-0/README.md](docs/phase-0/README.md).

---

## Rencana teknologi

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js App Router, Server Components sebagai default |
| Bahasa | TypeScript strict |
| Styling | Tailwind CSS + design token CSS variable |
| i18n | next-intl, rute selalu berawalan `/id` · `/en` |
| Animasi | Motion for React — satu-satunya library animasi |
| Database | PostgreSQL + Prisma |
| Autentikasi | Better Auth, admin saja, tanpa registrasi publik |
| Editor | Tiptap (admin saja, dimuat dinamis) |
| Penyimpanan | Cloudflare R2 / S3-compatible |
| Validasi | Zod di batas server dan klien |

---

## Prinsip yang tidak bisa ditawar

1. Tidak mengarang pengalaman, pencapaian, metrik, atau testimoni.
2. Tidak menerbitkan kredensial, token, IP publik, atau konfigurasi produksi.
3. Setiap bukti lolos [checklist redaksi](docs/phase-0/02_REDACTION_CHECKLIST.md) sebelum terbit.
4. Skenario lab ditandai sebagai skenario lab, tidak pernah sebagai insiden produksi.
5. Tidak menyalin aset, teks, atau tata letak dari situs referensi mana pun.
6. Draft tidak pernah bisa diakses publik.
