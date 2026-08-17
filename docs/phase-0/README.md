# FASE 0 — DISCOVERY & CONTENT INVENTORY

**Status:** ✅ Selesai (dokumen), ⏳ menunggu jawaban pemilik di `06_OPEN_QUESTIONS.md`
**Tanggal:** 31 Juli 2026
**Kode yang ditulis:** tidak ada — Fase 0 memang murni dokumentasi
**Dependency yang dipasang:** tidak ada

---

## Isi

| Berkas                                                       | Kegunaan                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [00_CONTENT_INVENTORY.md](00_CONTENT_INVENTORY.md)           | Seluruh konten yang direncanakan, ditandai rilis / backlog / perlu diisi |
| [01_ASSET_CLASSIFICATION.md](01_ASSET_CLASSIFICATION.md)     | Publik vs privat vs terlarang, penamaan berkas, struktur bucket R2       |
| [02_REDACTION_CHECKLIST.md](02_REDACTION_CHECKLIST.md)       | Checklist wajib sebelum bukti apa pun diterbitkan                        |
| [03_PROFILE_COPY.md](03_PROFILE_COPY.md)                     | Draf copy profil ID + EN, hanya dari fakta PRD                           |
| [04_SEED_CONTENT_DRAFT.md](04_SEED_CONTENT_DRAFT.md)         | Format seed = format backup, blok wajib per tipe dokumen                 |
| [05_ROUTE_AND_PRIORITY_MAP.md](05_ROUTE_AND_PRIORITY_MAP.md) | Seluruh rute dengan prioritas M/S/L dan fase pengerjaannya               |
| [06_OPEN_QUESTIONS.md](06_OPEN_QUESTIONS.md)                 | **16 pertanyaan untuk pemilik — 6 di antaranya menghambat**              |
| [07_SCHEMA_DECISIONS.md](07_SCHEMA_DECISIONS.md)             | Skema Prisma revisi, menggantikan `../04_DATABASE_DRAFT.prisma`          |
| [08_I18N_FALLBACK_POLICY.md](08_I18N_FALLBACK_POLICY.md)     | Aturan fallback bahasa, `hreflang`, canonical, sitemap                   |

---

## Penyimpangan dari PRD yang disetujui pemilik

Disetujui 31 Juli 2026, sebelum kode apa pun ditulis. Poin-poin ini **mengalahkan** teks PRD asli bila bertentangan.

| #   | Perubahan                                                          | Alasan                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Deploy pada Fase 3.5**, bukan Fase 8                             | URL yang bisa ditaruh di CV bernilai lebih tinggi hari ini daripada CMS lengkap tiga bulan lagi. Fase 4–9 dikerjakan di atas situs yang sudah live. Fase 8 tetap ada sebagai hardening penuh. |
| 2   | `ProjectMedia` + `KnowledgeEvidence` → satu `MediaAsset`           | PRD bab 12 meminta pustaka media terpusat, tapi draf skema menyebar media ke dua tabel tanpa pustaka.                                                                                         |
| 3   | Tambah relasi `Project` ↔ `KnowledgeDocument` + tag pada `Project` | PRD bab 10 meminta "SOP/lab terkait" tanpa menyediakan jalannya.                                                                                                                              |
| 4   | Hapus `viewCount` dari MVP                                         | Increment saat render memaksa halaman dinamis; bertabrakan dengan target LCP ≤ 2,5 s. Kembali di Fase 7 sebagai tabel analitik terpisah.                                                      |
| 5   | Seragamkan status ke `PublishStatus`                               | Draf memakai dua pola berbeda (`isPublished` vs `status`).                                                                                                                                    |
| 6   | Aturan fallback bahasa + `hreflang`                                | Celah nyata: `/en` yang belum lengkap akan terindeks sebagai duplikat berbahasa Indonesia.                                                                                                    |

Ditambah catatan implementasi yang diterapkan sebagai default: animasi CSS Radix tidak melanggar aturan "satu library animasi"; verifikasi konfigurasi teks `indonesian` di Postgres sebelum Fase 7; render dari JSON Tiptap, bukan dari HTML; gerbang wajib tiap fase adalah lint + typecheck + build, dengan tes difokuskan pada routing locale, privasi draft, validasi form, dan satu E2E smoke.

---

## Hasil terhadap kriteria penerimaan Fase 0

| Kriteria (`01_PHASES.md`)                | Status                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Tiga proyek, tiga SOP, tiga lab terpilih | ⏳ **Diusulkan**, menunggu konfirmasi Q7                                                                     |
| Copy profil ada dalam dua bahasa         | ⏳ **Draf ada** untuk positioning, headline, ringkasan, CTA, judul bagian. Riwayat pribadi menunggu pemilik. |
| Tidak ada metrik yang dikarang           | ✅ Terpenuhi. Semua metrik ditandai ⚠️ dan akan dihapus bila tidak ada sumbernya.                            |
| Berkas sensitif teridentifikasi          | ✅ Terpenuhi — `01` dan `02`.                                                                                |

Fase 0 belum bisa ditutup penuh sampai Q1–Q6 di `06_OPEN_QUESTIONS.md` dijawab.

---

## Yang bisa dimulai tanpa menunggu jawaban

Fase 1 bisa dimulai begitu **Q1 (database)** dan **Q2 (git)** terjawab. Q3–Q6 baru dibutuhkan di Fase 3.

Fase 1 tidak menyentuh konten sama sekali, jadi kekosongan data pribadi tidak menghalanginya.
