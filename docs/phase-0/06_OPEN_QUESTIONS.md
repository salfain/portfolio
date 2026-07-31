# 06 — PERTANYAAN TERBUKA

**Fase:** 0
**Cara pakai:** jawab langsung di berkas ini. Pertanyaan bertanda 🔴 menghambat fase berikutnya.

---

## Menghambat Fase 1

### 🔴 Q1 — Penyedia PostgreSQL

Mesin ini tidak punya PostgreSQL maupun Docker.

| Opsi | Konsekuensi |
|---|---|
| **A. Neon** (rekomendasi) | Gratis, serverless, mendukung `pg_trgm`. Database dev sekaligus produksi. Perlu koneksi internet saat pengembangan. |
| B. Supabase | Gratis, membawa fitur lain yang tidak kita pakai. |
| C. PostgreSQL lokal | Bekerja offline. Perlu database produksi terpisah nanti. |
| D. Docker Desktop | Paling mendekati produksi. Perlu instalasi ±1 GB. |

**Jawaban:** D. Docker Desktop (PostgreSQL via container, paling dekat produksi). Prasyarat: Docker Desktop + WSL2 terpasang sebelum Fase 1.

### 🔴 Q2 — Inisialisasi git

Folder ini belum menjadi repositori git, padahal PRD mensyaratkan "small logical commits".

- Jalankan `git init`? **Ya / Tidak:** **Ya**
- Buat repositori remote di GitHub? **Ya / Tidak:** **Tidak** (lokal saja dulu, remote menyusul)
- Publik atau privat? **N/A** (tidak ada remote saat ini)

### 🔴 Q3 — Domain

Dibutuhkan lebih awal dari perkiraan: canonical, `hreflang`, sitemap, verifikasi domain Resend, dan gambar OG semuanya bergantung padanya.

- Sudah punya domain? **Ya — `salfain.web.id`**
- Kalau belum, pakai subdomain `.vercel.app` dulu untuk Fase 3.5? **Ya / Tidak:** N/A (sudah punya domain)

Mengganti domain setelah rilis berarti mengatur ulang canonical, sitemap, dan verifikasi email.

---

## Menghambat Fase 3 (konten)

### 🔴 Q4 — Nama perusahaan & sekolah

Apakah nama tempat kerja IT Support dan sekolah TKJ boleh disebut publik?

| Tempat | Boleh disebut? | Jika tidak, deskripsi generik |
|---|---|---|
| Tempat kerja IT Support | _______ | _______ |
| Sekolah TKJ | _______ | _______ |

Periksa juga perjanjian kerja atau NDA yang berlaku. Kalau ragu, pakai deskripsi generik — nilainya bagi recruiter hampir sama.

### 🔴 Q5 — Asal laporan insiden

Dua laporan insiden yang direncanakan (`insiden-apipa-dhcp`, `insiden-dns-gagal`) — berasal dari kejadian nyata di tempat kerja atau direproduksi di lab?

| Insiden | Nyata / Lab |
|---|---|
| APIPA akibat DHCP gagal | _______ |
| DNS gagal | _______ |

Jika nyata, berlaku `02_REDACTION_CHECKLIST.md` bagian G. Jika lab, wajib memakai penanda di bagian H. Tidak ada jalan tengah — menyajikan skenario lab sebagai insiden produksi adalah masalah integritas yang akan langsung terlihat oleh pewawancara teknis.

### 🔴 Q6 — Metrik yang bisa dibuktikan

Adakah angka yang benar-benar tercatat dan bisa Anda pertanggungjawabkan?

| Metrik | Ada catatannya? | Nilai |
|---|---|---|
| Lama pengalaman IT Support | _______ | _______ |
| Jumlah tiket ditangani | _______ | _______ |
| Jumlah pengguna didukung | _______ | _______ |
| Jumlah perangkat dikelola | _______ | _______ |

**Kosongkan yang tidak ada catatannya.** Metrik tanpa sumber akan dihapus dari homepage, bukan diperkirakan. Bagian "Ringkasan" dirancang agar tetap rapi dengan tiga kartu maupun enam.

### Q7 — Pilihan 3 proyek rilis

Usulan di `00_CONTENT_INVENTORY.md` bagian 5: `it-support-operations`, `lab-pnetlab-kantor`, `sop-knowledge-base`.

Setuju? _______ Kalau tidak, proyek mana? _______

Pertimbangan: HKBP, monitoring kapal, E-Gudang mungkin punya bukti visual yang lebih kuat. Kalau ada demo yang berjalan atau repositori aktif, itu lebih berharga daripada kedekatan tema.

### Q8 — Headline hero

Tiga opsi di `03_PROFILE_COPY.md` bagian 4. Rekomendasi: Opsi B.

Pilihan: _______

### Q9 — Status kerja saat ini

Draf ringkasan menulis "bekerja di bidang IT Support" (mengikuti PRD). Apakah masih akurat, atau seharusnya "berpengalaman di bidang IT Support"?

**Jawaban:** _______

### Q10 — Kontak publik

Tampilkan email dan nomor telepon secara terbuka, atau hanya lewat form kontak?

| Data | Publik / Form saja / Tidak ada |
|---|---|
| Email | _______ |
| WhatsApp | _______ |
| Nomor telepon | _______ |

Email publik akan dipanen bot. Form kontak lebih aman, tapi sebagian recruiter lebih suka mengirim email langsung. Jalan tengah: tampilkan email hanya di halaman Recruiter Mode.

---

## Menghambat Fase 3.5 (deploy)

### Q11 — Platform hosting

Vercel (rekomendasi — integrasi Next.js terbaik, gratis untuk skala ini) atau lainnya?

**Jawaban:** _______

### Q12 — Pengiriman email

Resend butuh domain terverifikasi untuk mengirim dari alamat Anda sendiri.

- Pakai Resend? _______
- Alamat email penerima notifikasi form kontak: _______

---

## Menghambat Fase 5 (media)

### Q13 — Object storage

- Sudah punya akun Cloudflare R2? _______
- Kalau belum: R2 (rekomendasi, tanpa biaya egress) atau alternatif S3-compatible lain? _______

Sampai ini tersedia, Fase 3 memakai penyimpanan berkas lokal dan bermigrasi di Fase 5.

---

## Tidak menghambat, tapi perlu diputuskan

### Q14 — Bahasa antarmuka admin

Usulan: **hanya bahasa Indonesia.** Hanya satu orang yang memakainya, dan menerjemahkan CMS menggandakan pekerjaan tanpa manfaat. Setuju? _______

### Q15 — Skala level keahlian

Usulan: `Dasar / Menengah / Mahir`. Tanpa persentase — persentase menyiratkan pengukuran yang tidak pernah dilakukan. Setuju? _______

### Q16 — Foto profil

Sudah ada foto yang layak dipakai, atau perlu waktu untuk menyiapkannya? _______

Hero dirancang mengasumsikan ada foto profil. Kalau belum ada, komposisi hero perlu alternatif — beri tahu sebelum Fase 3.
