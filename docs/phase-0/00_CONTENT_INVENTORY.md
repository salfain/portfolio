# 00 — INVENTARIS KONTEN

**Fase:** 0 — Discovery & Content Inventory
**Status dokumen:** Kerangka terisi sebagian. Menunggu data dari pemilik.

---

## Cara membaca status

| Tanda | Arti |
|---|---|
| ✅ | Fakta sudah tersedia di PRD, boleh dipakai apa adanya |
| ⚠️ | **PERLU DIISI** oleh pemilik — tidak boleh dikarang |
| ⏸ | Backlog — tidak masuk rilis pertama |
| 🚫 | Diputuskan tidak dipakai |

**Aturan mutlak:** kolom bertanda ⚠️ tidak boleh diisi oleh siapa pun selain pemilik. Angka, durasi, jumlah tiket, jumlah pengguna, dan nama perusahaan tidak boleh diperkirakan.

---

## 1. Identitas & profil

| Field | Status | Nilai |
|---|---|---|
| Nama lengkap | ✅ | Muhammad Sya'ban Alfain |
| Gelar / pendidikan | ✅ | S1 Sistem Informasi (Bachelor of Information Systems) |
| Nama kampus | ⚠️ | |
| Tahun lulus | ⚠️ | |
| Target posisi | ✅ | IT Support / Technical Support |
| Lokasi (kota, provinsi) | ⚠️ | |
| Bersedia relokasi? | ⚠️ | |
| Email publik | ⚠️ | |
| Nomor telepon / WhatsApp | ⚠️ | Putuskan juga: tampil publik atau hanya via form kontak |
| URL LinkedIn | ⚠️ | |
| URL GitHub | ⚠️ | |
| Status ketersediaan kerja | ⚠️ | Untuk badge di hero |
| Foto profil (asli) | ⚠️ | Wajib foto sendiri, lihat `01_ASSET_CLASSIFICATION.md` |
| File CV Indonesia | ⚠️ | |
| File CV Inggris | ⚠️ | |

---

## 2. Pengalaman kerja

PRD hanya menyebut dua jenis pengalaman tanpa detail. Seluruh detail perlu diisi.

| # | Jenis | Status | Catatan |
|---|---|---|---|
| 1 | IT Support | ✅ (keberadaannya) | ⚠️ nama perusahaan, jabatan, periode, lokasi, ruang lingkup, tools |
| 2 | Pengajar produktif TKJ | ✅ (keberadaannya) | ⚠️ nama sekolah, jabatan, periode, mata pelajaran yang diampu |
| 3+ | Lainnya | ⚠️ | Magang, freelance, organisasi, proyek kampus — jika ada |

**Per pengalaman, yang dibutuhkan:**

- Nama instansi (**dan konfirmasi apakah boleh disebut publik** — lihat `06_OPEN_QUESTIONS.md` Q4)
- Jabatan (ID + EN)
- Tanggal mulai & selesai
- Lokasi
- Ringkasan tanggung jawab (ID + EN)
- 3–5 poin pencapaian nyata (ID + EN) — **tanpa angka yang tidak bisa dibuktikan**
- Daftar tools yang benar-benar dipakai

---

## 3. Keahlian (Skill)

Kategori disiapkan; isinya perlu dikonfirmasi supaya tidak mengklaim yang tidak dikuasai.

| Kategori | Contoh isi yang mungkin | Status |
|---|---|---|
| Sistem operasi | Windows, Windows Server, Linux | ⚠️ |
| Jaringan | TCP/IP, DHCP, DNS, VLAN, routing, MikroTik | ⚠️ |
| Perangkat & endpoint | Laptop, printer, imaging, driver | ⚠️ |
| Layanan & identitas | Active Directory, Microsoft 365, VPN | ⚠️ |
| Alat bantu kerja | Ticketing, remote desktop, dokumentasi | ⚠️ |
| Lab & simulasi | PNETLab | ✅ (implisit dari PRD) |
| Pengembangan | Bahasa/framework dari proyek yang dipilih | ⚠️ |
| Soft skill | Komunikasi pengguna, prioritisasi, dokumentasi | ⚠️ |

Untuk setiap skill perlu **level** yang jujur. Usul skala: `Dasar / Menengah / Mahir`. Hindari persentase — persentase menyiratkan pengukuran yang tidak pernah dilakukan.

---

## 4. Sertifikat

| # | Sertifikat | Status | Catatan |
|---|---|---|---|
| 1 | Google IT Support Professional Certificate | ✅ | ⚠️ tanggal terbit, URL kredensial, gambar sertifikat |
| 2+ | Lainnya | ⚠️ | Hanya yang benar-benar dimiliki dan bisa diverifikasi |

**Aturan:** sertifikat tanpa URL kredensial atau berkas bukti tidak ditampilkan sebagai terverifikasi.

---

## 5. Proyek — 7 kandidat dari PRD bab 10

| # | Kandidat | Rencana | Status data |
|---|---|---|---|
| P1 | Studi kasus IT Support Operations | **RILIS** | ⚠️ |
| P2 | Lab PNETLab kantor enterprise | **RILIS** | ⚠️ |
| P3 | SOP & Knowledge Base IT Support | **RILIS** | ⚠️ (bersifat meta: situs ini sendiri) |
| P4 | Sistem web HKBP | ⏸ backlog | ⚠️ |
| P5 | Sistem monitoring kapal (Android) | ⏸ backlog | ⚠️ |
| P6 | E-Gudang (inventaris) | ⏸ backlog | ⚠️ |
| P7 | Financial planner / platform sekolah | ⏸ backlog | ⚠️ |

**Pilihan 3 proyek rilis di atas adalah usulan, bukan keputusan.** Rasionalnya: ketiganya paling dekat dengan target posisi IT Support. Kalau P4–P7 punya bukti yang jauh lebih kuat (screenshot, repo aktif, pengguna nyata), tukar saja. Lihat `06_OPEN_QUESTIONS.md` Q1.

**Per proyek, yang dibutuhkan** (PRD bab 10): judul & ringkasan ID/EN, peran, periode, masalah, tujuan, tanggung jawab, solusi, fitur, teknologi, arsitektur, screenshot, pengujian, hasil, pelajaran, link repo/demo, SOP/lab terkait.

---

## 6. SOP — 10 kandidat dari PRD bab 19

| # | SOP | Rencana |
|---|---|---|
| S1 | Instalasi Windows | ⏸ backlog |
| S2 | Setup laptop baru | **RILIS** |
| S3 | Onboarding pengguna | **RILIS** |
| S4 | Offboarding pengguna | ⏸ backlog |
| S5 | Instalasi printer jaringan | ⏸ backlog |
| S6 | Troubleshooting tidak ada internet | **RILIS** |
| S7 | Dukungan VPN | ⏸ backlog |
| S8 | Backup & restore MikroTik | ⏸ backlog |
| S9 | Penanganan insiden IT | ⏸ backlog |
| S10 | Reset password & buka kunci akun | ⏸ backlog |

Usulan 3 rilis: S2, S3, S6 — mewakili tiga hal berbeda (perangkat, proses, troubleshooting) sehingga variasi kemampuan terlihat.

---

## 7. Lab PNETLab — 10 kandidat dari PRD bab 19

| # | Lab | Rencana |
|---|---|---|
| L1 | Dua LAN satu router | **RILIS** |
| L2 | DHCP MikroTik | ⏸ backlog |
| L3 | VLAN per departemen | **RILIS** |
| L4 | Inter-VLAN routing | **RILIS** |
| L5 | Isolasi jaringan tamu | ⏸ backlog |
| L6 | Static routing HQ–cabang | ⏸ backlog |
| L7 | Dasar OSPF | ⏸ backlog |
| L8 | VPN site-to-site | ⏸ backlog |
| L9 | Integrasi Windows Server & client | ⏸ backlog |
| L10 | Capstone multi-lokasi | ⏸ backlog |

Usulan 3 rilis: L1, L3, L4 — berurutan naik tingkat dan saling menyambung, jadi terbaca sebagai kurikulum, bukan lab acak.

**⚠️ Prasyarat penting:** setiap lab butuh screenshot topologi PNETLab asli dan output terminal asli. Lab tanpa bukti tidak boleh diterbitkan.

---

## 8. Laporan insiden — 8 kandidat dari PRD bab 19

| # | Insiden | Rencana |
|---|---|---|
| I1 | APIPA akibat kegagalan DHCP | **RILIS** |
| I2 | DNS gagal padahal IP publik bisa diakses | **RILIS** |
| I3 | Printer jaringan offline | ⏸ backlog |
| I4 | Outlook meminta password berulang | ⏸ backlog |
| I5 | VPN tersambung tapi resource internal tidak bisa | ⏸ backlog |
| I6 | Gagal join domain karena DNS | ⏸ backlog |
| I7 | VLAN tamu bisa menjangkau server internal | ⏸ backlog |
| I8 | Laptop lambat karena storage / startup | ⏸ backlog |

**⚠️ Keputusan penting yang belum diambil:** apakah insiden ini berasal dari kejadian nyata di tempat kerja, atau direproduksi di lab?

- Jika **nyata** → wajib anonimisasi penuh dan konfirmasi izin (lihat `02_REDACTION_CHECKLIST.md`).
- Jika **direproduksi di lab** → wajib ditandai jelas sebagai skenario lab di halamannya.

Menyajikan insiden lab seolah-olah insiden produksi termasuk mengarang pengalaman dan dilarang. Lihat `06_OPEN_QUESTIONS.md` Q5.

---

## 9. Artikel teknis

Belum ada kandidat di PRD. ⏸ Seluruhnya backlog, dikerjakan setelah rilis.

---

## 10. Metrik karier (bagian homepage)

PRD bab 9 meminta bagian "Career metrics based only on real data".

| Metrik yang mungkin | Status |
|---|---|
| Lama pengalaman IT Support | ⚠️ |
| Jumlah SOP yang ditulis | ✅ dihitung otomatis dari database |
| Jumlah lab yang diselesaikan | ✅ dihitung otomatis dari database |
| Jumlah sertifikat | ✅ dihitung otomatis dari database |
| Jumlah tiket ditangani | ⚠️ **hanya jika ada catatan nyata** |
| Rata-rata waktu penyelesaian | ⚠️ **hanya jika ada catatan nyata** |
| Jumlah pengguna didukung | ⚠️ **hanya jika ada catatan nyata** |

**Keputusan yang direkomendasikan:** metrik yang tidak punya sumber data tidak diisi dengan tebakan — kartunya dihapus. Bagian ini akan dibangun agar berfungsi dengan 3 kartu maupun 6 kartu, sehingga menghapus metrik tidak merusak tata letak.

---

## 11. Halaman statis

| Halaman | Status |
|---|---|
| Privacy Policy | ⚠️ perlu ditulis — wajib karena ada form kontak & analitik |
| Terms | ⚠️ perlu ditulis |
| About (naratif panjang) | ⚠️ |

---

## Ringkasan target rilis

| Jenis | Target rilis | Sumber |
|---|---|---|
| Proyek | 3 | PRD Fase 9 |
| SOP | 3 | PRD Fase 9 |
| Lab | 3 | PRD Fase 9 |
| Insiden | 2 | PRD Fase 9 |
| Sertifikat terverifikasi | 1 | PRD Fase 9 |
| Artikel | 0 | backlog |

Sisanya di PRD bab 19 adalah **backlog**, bukan utang rilis.
