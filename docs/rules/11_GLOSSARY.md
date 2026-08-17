# 11 — GLOSARIUM

Istilah yang muncul di dokumen dan kode proyek ini.

---

## Istilah proyek

| Istilah                      | Arti                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------- |
| **Knowledge Base (KB)**      | Kumpulan dokumen teknis: SOP, Lab, Insiden, Artikel                              |
| **KnowledgeDocument**        | Satu model database untuk keempat tipe di atas                                   |
| **Recruiter Mode**           | Halaman ringkas satu layar untuk recruiter, dirancang untuk dicetak              |
| **Explore My Work**          | Panel pencarian/filter di homepage, lintas tipe konten                           |
| **Evidence / bukti**         | Screenshot, output terminal, atau diagram yang membuktikan pekerjaan nyata       |
| **Redaksi**                  | Menghapus atau menyensor data sensitif sebelum publikasi                         |
| **Translation completeness** | Apakah semua field bahasa Inggris terisi                                         |
| **Fase**                     | Satu tahap pengerjaan. Fase berikutnya tidak dimulai sebelum yang sekarang lolos |
| **DoD**                      | Definition of Done — [09_DEFINITION_OF_DONE.md](09_DEFINITION_OF_DONE.md)        |

---

## Istilah IT Support (konteks konten)

| Istilah                | Arti                                                         |
| ---------------------- | ------------------------------------------------------------ |
| **SOP**                | Standard Operating Procedure — prosedur langkah demi langkah |
| **PNETLab**            | Emulator jaringan untuk membangun topologi virtual           |
| **RCA**                | Root Cause Analysis — analisis akar masalah insiden          |
| **Insiden**            | Gangguan tak terencana pada layanan                          |
| **P1 / P2 / P3**       | Prioritas insiden, P1 paling mendesak                        |
| **Impact**             | Seberapa luas dampaknya                                      |
| **Urgency**            | Seberapa cepat harus ditangani                               |
| **Workaround**         | Solusi sementara sebelum perbaikan permanen                  |
| **Onboarding**         | Proses menyiapkan akun dan perangkat karyawan baru           |
| **Offboarding**        | Proses mencabut akses karyawan yang keluar                   |
| **Eskalasi**           | Meneruskan masalah ke tingkat dukungan lebih tinggi          |
| **VLAN**               | Segmentasi jaringan logis di atas switch fisik yang sama     |
| **Inter-VLAN routing** | Merutekan lalu lintas antar-VLAN                             |
| **DHCP**               | Layanan yang memberikan IP otomatis ke perangkat             |
| **APIPA**              | IP `169.254.x.x` yang muncul saat DHCP gagal                 |
| **DNS**                | Menerjemahkan nama domain menjadi alamat IP                  |
| **MikroTik**           | Merek perangkat jaringan yang umum di Indonesia              |
| **TKJ**                | Teknik Komputer dan Jaringan, jurusan SMK                    |

---

## Istilah teknis (konteks kode)

| Istilah                      | Arti                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **RSC / Server Component**   | Komponen React yang dirender di server. Default proyek ini                   |
| **Client Component**         | Komponen bertanda `'use client'`, berjalan di browser                        |
| **Hydration**                | Proses React "menghidupkan" HTML dari server di browser                      |
| **Hydration mismatch**       | HTML server ≠ hasil render klien. Selalu bug                                 |
| **Server Action**            | Fungsi bertanda `'use server'`, dipanggil dari klien tapi berjalan di server |
| **Middleware**               | Kode yang berjalan sebelum request mencapai halaman                          |
| **Locale**                   | Kode bahasa. Di sini `id` atau `en`                                          |
| **i18n**                     | Internationalization — dukungan banyak bahasa                                |
| **hreflang**                 | Tag HTML yang memberi tahu mesin pencari versi bahasa lain                   |
| **Canonical**                | URL yang dianggap versi utama sebuah halaman                                 |
| **Slug**                     | Bagian URL yang bisa dibaca manusia: `sop-setup-laptop-baru`                 |
| **Prisma**                   | ORM — mengakses database lewat TypeScript, bukan SQL mentah                  |
| **Migrasi**                  | Berkas berversi yang mengubah struktur database                              |
| **Seed**                     | Skrip yang mengisi database dengan data awal                                 |
| **Zod**                      | Library validasi. Skema Zod sekaligus menghasilkan tipe TypeScript           |
| **Tiptap**                   | Editor teks kaya. Menyimpan dokumen sebagai JSON                             |
| **R2**                       | Object storage Cloudflare, kompatibel S3                                     |
| **Signed URL**               | URL berumur pendek untuk mengakses berkas privat                             |
| **CLS**                      | Cumulative Layout Shift — seberapa banyak tata letak bergeser saat memuat    |
| **LCP**                      | Largest Contentful Paint — kapan elemen terbesar tampil                      |
| **INP**                      | Interaction to Next Paint — seberapa cepat halaman merespons                 |
| **WCAG AA**                  | Standar aksesibilitas yang menjadi target proyek ini                         |
| **ARIA**                     | Atribut HTML yang menjelaskan makna elemen ke screen reader                  |
| **N+1**                      | Antipola: satu query lalu N query di dalam loop                              |
| **Idempoten**                | Dijalankan berkali-kali hasilnya sama seperti sekali                         |
| **Revalidate**               | Memperbarui halaman yang di-cache setelah data berubah                       |
| **`server-only`**            | Paket yang menggagalkan build bila modul server terimpor ke klien            |
| **Motion for React**         | Satu-satunya library animasi di proyek ini                                   |
| **`prefers-reduced-motion`** | Preferensi OS untuk mengurangi animasi                                       |
| **Better Auth**              | Library autentikasi yang dipakai untuk login admin                           |
| **Turnstile**                | Perlindungan bot dari Cloudflare, alternatif CAPTCHA                         |
| **Honeypot**                 | Field tersembunyi yang hanya diisi bot                                       |
| **Rate limiting**            | Membatasi jumlah permintaan per pengguna per waktu                           |
| **Audit log**                | Catatan siapa melakukan apa dan kapan                                        |
