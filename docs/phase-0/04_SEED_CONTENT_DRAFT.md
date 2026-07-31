# 04 — DRAF KONTEN AWAL & FORMAT SEED

**Fase:** 0
**Isi:** struktur konten rilis pertama + format berkas seed yang sekaligus menjadi format backup.

---

## 1. Keputusan: satu format untuk seed, import, dan backup

Fase 4 (Knowledge Base publik) berjalan sebelum Fase 5 (CMS). Supaya konten tidak ditulis dua kali, satu format dipakai untuk ketiganya:

```
content/
├── knowledge/
│   ├── sop-setup-laptop-baru.json
│   ├── sop-onboarding-pengguna.json
│   ├── sop-troubleshooting-tanpa-internet.json
│   ├── lab-dua-lan-satu-router.json
│   ├── lab-vlan-departemen.json
│   ├── lab-inter-vlan-routing.json
│   ├── insiden-apipa-dhcp.json
│   └── insiden-dns-gagal.json
└── projects/
    ├── it-support-operations.json
    ├── lab-pnetlab-kantor.json
    └── sop-knowledge-base.json
```

| Fase | Peran berkas ini |
|---|---|
| 4 | Sumber `prisma/seed.ts` untuk mengisi database |
| 5 | Format import & **export backup** CMS |
| 8 | Bagian dari prosedur backup/rollback |

Berkas ini disimpan di repositori, jadi konten punya riwayat versi lewat git sejak awal.

---

## 2. Skema berkas seed

```jsonc
{
  "type": "SOP",                    // SOP | LAB | INCIDENT | ARTICLE
  "slug": "sop-setup-laptop-baru",
  "documentCode": "SOP-002",
  "version": "1.0",
  "status": "PUBLISHED",
  "category": "endpoint",
  "tags": ["windows", "onboarding", "endpoint"],
  "tools": ["Windows 11", "PNETLab"],
  "difficulty": "BEGINNER",         // BEGINNER | INTERMEDIATE | ADVANCED
  "estimatedMinutes": 12,
  "isFeatured": true,

  "titleId": "...",
  "titleEn": null,                  // null = belum diterjemahkan
  "summaryId": "...",
  "summaryEn": null,

  "contentIdJson": { "type": "doc", "content": [] },   // dokumen Tiptap
  "contentEnJson": null,

  "metadata": {},                   // lihat bagian 4

  "evidence": [
    {
      "file": "sop-setup-laptop-baru--langkah-bitlocker--02.png",
      "kind": "SCREENSHOT",
      "altId": "...",
      "altEn": null,
      "captionId": "...",
      "captionEn": null,
      "isPublic": true,
      "redactionConfirmed": true
    }
  ]
}
```

**Aturan penting:** `contentIdJson` adalah sumber kebenaran. HTML tidak disimpan di berkas seed — HTML dihasilkan di server saat import, hanya untuk indeks pencarian, dan tidak pernah dipakai merender halaman publik (lihat `07_SCHEMA_DECISIONS.md` bagian 6).

---

## 3. Blok wajib per tipe dokumen

Diturunkan dari PRD bab 11. Ini menjadi template di editor Tiptap pada Fase 5.

### SOP

| # | Blok | Wajib |
|---|---|---|
| 1 | Tujuan | ✔ |
| 2 | Ruang lingkup | ✔ |
| 3 | Definisi & istilah | |
| 4 | Penanggung jawab | ✔ |
| 5 | Prasyarat | ✔ |
| 6 | Prosedur (langkah bernomor) | ✔ |
| 7 | Validasi / cara memastikan berhasil | ✔ |
| 8 | Eskalasi | ✔ |
| 9 | Catatan keamanan | |
| 10 | Risiko | |
| 11 | Rollback | |
| 12 | Bukti | |
| 13 | Riwayat revisi | otomatis |

### Lab PNETLab

| # | Blok | Wajib |
|---|---|---|
| 1 | Tujuan pembelajaran | ✔ |
| 2 | Skenario | ✔ |
| 3 | Topologi (gambar) | ✔ |
| 4 | Daftar perangkat & interface | ✔ |
| 5 | Rencana IP & VLAN (tabel) | ✔ |
| 6 | Langkah konfigurasi | ✔ |
| 7 | Blok perintah | ✔ |
| 8 | Test case (harapan vs hasil) | ✔ |
| 9 | Simulasi gangguan | |
| 10 | Hasil & bukti | ✔ |
| 11 | Pelajaran | ✔ |
| 12 | Unduhan tersanitasi | |

### Laporan insiden

| # | Blok | Wajib |
|---|---|---|
| 0 | **Penanda skenario lab** (jika berlaku) | ✔ kondisional |
| 1 | Nomor insiden | ✔ |
| 2 | Dampak, urgensi, prioritas | ✔ |
| 3 | Layanan terdampak | ✔ |
| 4 | Gejala | ✔ |
| 5 | Timeline | ✔ |
| 6 | Investigasi | ✔ |
| 7 | Akar masalah (RCA) | ✔ |
| 8 | Workaround | |
| 9 | Penyelesaian | ✔ |
| 10 | Validasi | ✔ |
| 11 | Pencegahan | ✔ |
| 12 | Bukti | |
| 13 | SOP terkait | |

### Artikel teknis

Pendahuluan, konsep, contoh praktis, perintah/konfigurasi, kesalahan umum, troubleshooting, kesimpulan, referensi. Semua opsional kecuali pendahuluan dan kesimpulan.

---

## 4. Bentuk `metadata` per tipe

```jsonc
// SOP
{ "scope": "Windows endpoint", "owner": "IT Support", "riskLevel": "medium" }

// LAB
{ "topology": "HQ dan cabang", "devices": 7, "estimatedHours": 8 }

// INCIDENT
{ "impact": "medium", "urgency": "high", "priority": "P2",
  "resolutionMinutes": 35, "isLabReproduction": true }
```

`isLabReproduction` adalah tambahan dari draf PRD. Wajib ada di setiap dokumen insiden, dan mengendalikan penanda di bagian 0 tabel insiden serta di `02_REDACTION_CHECKLIST.md` bagian H.

`resolutionMinutes` **hanya diisi bila waktunya benar-benar tercatat.** Kosongkan bila tidak.

---

## 5. Outline konten rilis

Isi teknisnya **[PERLU DIISI]** — hanya kerangka dan alasan pemilihan yang disiapkan di sini.

### Proyek

| Slug | Judul kerja | Kenapa dipilih | Bukti yang diperlukan |
|---|---|---|---|
| `it-support-operations` | Studi kasus operasional IT Support | Paling langsung menjawab target posisi | ⚠️ perlu bukti yang boleh dipublikasikan |
| `lab-pnetlab-kantor` | Lab jaringan kantor di PNETLab | Menunjukkan pemahaman jaringan tanpa perlu data perusahaan | Screenshot topologi + output verifikasi |
| `sop-knowledge-base` | SOP & Knowledge Base IT Support | Situs ini sendiri; menunjukkan kemampuan dokumentasi dan pengembangan | Screenshot CMS & halaman KB |

Proyek ketiga bersifat meta dan baru bisa ditulis setelah Fase 5. Dijadwalkan di Fase 9.

### SOP

| Slug | Kode | Fokus |
|---|---|---|
| `sop-setup-laptop-baru` | SOP-002 | Perangkat / endpoint |
| `sop-onboarding-pengguna` | SOP-003 | Proses & akun |
| `sop-troubleshooting-tanpa-internet` | SOP-006 | Diagnosis jaringan |

### Lab

| Slug | Fokus | Tingkat |
|---|---|---|
| `lab-dua-lan-satu-router` | Routing dasar | Dasar |
| `lab-vlan-departemen` | Segmentasi VLAN | Menengah |
| `lab-inter-vlan-routing` | Routing antar-VLAN | Menengah |

Ketiganya berbagi satu skema pengalamatan supaya terbaca sebagai satu rangkaian, bukan lab lepas.

### Insiden

| Slug | Fokus | Sumber |
|---|---|---|
| `insiden-apipa-dhcp` | Kegagalan DHCP | ⚠️ nyata atau lab? |
| `insiden-dns-gagal` | Resolusi DNS | ⚠️ nyata atau lab? |

---

## 6. Kategori & tag awal

**Kategori** (satu dokumen satu kategori):

| Slug | ID | EN |
|---|---|---|
| `endpoint` | Perangkat & Endpoint | Devices & Endpoints |
| `jaringan` | Jaringan | Networking |
| `akun-identitas` | Akun & Identitas | Accounts & Identity |
| `proses-layanan` | Proses & Layanan | Process & Service |

**Tag** (bebas, banyak per dokumen): `windows`, `mikrotik`, `vlan`, `dhcp`, `dns`, `vpn`, `printer`, `active-directory`, `pnetlab`, `onboarding`, `offboarding`, `troubleshooting`.

Tag disimpan dengan nama tunggal tanpa terjemahan — istilah teknis ini sama di kedua bahasa, jadi menerjemahkannya justru memecah navigasi.

---

## 7. Urutan penulisan yang disarankan

1. Tulis **satu SOP lengkap** (`sop-troubleshooting-tanpa-internet`) sebagai acuan mutu.
2. Kerjakan tiga lab berurutan — labnya saling membangun, jadi lebih efisien dikerjakan sekaligus.
3. Tulis dua insiden setelah lab, karena keduanya bisa mereferensikan topologi yang sama.
4. Terjemahkan ke Inggris setelah versi Indonesia disetujui, bukan bersamaan.

Menerjemahkan sambil menulis membuat setiap revisi harus dikerjakan dua kali.
