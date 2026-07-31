# ATURAN PENGEMBANGAN

Dokumen ini wajib dibaca sebelum menulis baris kode pertama.

---

## Lima aturan yang tidak boleh dilanggar

Melanggar salah satu dari ini berarti PR ditolak tanpa diskusi.

1. **Jangan mengarang fakta.** Tidak ada angka pengalaman, jumlah tiket, jumlah pengguna, testimoni, atau sertifikat yang tidak ada sumbernya. Kalau butuh data dan tidak punya, tanya — jangan isi contoh yang terlihat masuk akal.
2. **Jangan menerbitkan data sensitif.** Tidak ada password, token, API key, IP publik, nama perusahaan tanpa izin, atau konfigurasi produksi — termasuk di komentar kode, berkas tes, dan data seed.
3. **Jangan lompat fase.** Kerjakan hanya fase yang sedang berjalan. Menemukan sesuatu yang "sekalian saja dikerjakan" bukan alasan untuk mengerjakannya.
4. **Jangan menulis teks langsung di JSX pada rute publik.** Semua teks yang dilihat pengguna berasal dari berkas terjemahan.
5. **Jangan menyalin dari situs referensi mana pun.** Termasuk aset, teks, dan struktur tata letak.

---

## Urutan baca

**Sebelum menulis kode (wajib, sekali):**

| # | Dokumen | Isi |
|---|---|---|
| 1 | [00_WORKFLOW.md](00_WORKFLOW.md) | Cara mengerjakan satu fase dari awal sampai selesai |
| 2 | [01_CODE_CONVENTIONS.md](01_CODE_CONVENTIONS.md) | Struktur folder, penamaan, Server vs Client, aturan TypeScript |
| 3 | [09_DEFINITION_OF_DONE.md](09_DEFINITION_OF_DONE.md) | Kapan sebuah pekerjaan boleh disebut selesai |
| 4 | [08_GIT_AND_PR.md](08_GIT_AND_PR.md) | Branch, commit, PR |

**Rujukan saat mengerjakan (buka sesuai kebutuhan):**

| Dokumen | Buka ketika |
|---|---|
| [02_STYLING.md](02_STYLING.md) | Menulis Tailwind atau menyentuh warna |
| [03_I18N.md](03_I18N.md) | Menambah teks apa pun |
| [04_MOTION.md](04_MOTION.md) | Menambah animasi |
| [05_ACCESSIBILITY.md](05_ACCESSIBILITY.md) | Membuat komponen interaktif |
| [06_SECURITY.md](06_SECURITY.md) | Menyentuh auth, form, unggahan, atau server action |
| [07_DATA_PRISMA.md](07_DATA_PRISMA.md) | Menulis query database |
| [10_TROUBLESHOOTING.md](10_TROUBLESHOOTING.md) | Ada error yang membingungkan |
| [11_GLOSSARY.md](11_GLOSSARY.md) | Ada istilah yang tidak dikenal |

---

## Konteks proyek

| Ingin tahu | Baca |
|---|---|
| Apa yang sedang dibangun | [`../00_MASTER_PRD.md`](../00_MASTER_PRD.md) |
| Fase mana yang sedang berjalan | [`../../README.md`](../../README.md) |
| Konten apa yang boleh terbit | [`../phase-0/00_CONTENT_INVENTORY.md`](../phase-0/00_CONTENT_INVENTORY.md) |
| Bukti apa yang boleh publik | [`../phase-0/02_REDACTION_CHECKLIST.md`](../phase-0/02_REDACTION_CHECKLIST.md) |
| Bentuk database | [`../phase-0/07_SCHEMA_DECISIONS.md`](../phase-0/07_SCHEMA_DECISIONS.md) |
| Aturan bahasa Inggris belum lengkap | [`../phase-0/08_I18N_FALLBACK_POLICY.md`](../phase-0/08_I18N_FALLBACK_POLICY.md) |

⚠️ Bila `phase-0/07_SCHEMA_DECISIONS.md` bertentangan dengan `../04_DATABASE_DRAFT.prisma`,
**yang berlaku adalah berkas fase-0.**

---

## Kalau ragu

Urutan yang benar:

1. Cari di dokumen ini.
2. Cari pola yang sama di kode yang sudah ada, lalu ikuti.
3. **Bertanya.**

Yang tidak boleh: menebak lalu melanjutkan. Menebak pada lapisan fondasi (routing, skema, auth) menghasilkan pekerjaan ulang yang jauh lebih mahal daripada satu pertanyaan.

**Selalu bertanya, jangan pernah menebak, untuk:** data pribadi pemilik, nama perusahaan, angka apa pun, apakah suatu bukti boleh publik, dan perubahan skema database.
