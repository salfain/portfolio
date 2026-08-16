# FASE 7 — CATATAN & TEMUAN

---

## N1 — `indonesian` tersedia, tapi terlalu agresif pada satu kata penting

Menjawab N4 Fase 1: konfigurasi `indonesian` **ada** di PostgreSQL 16, dan
hasilnya jauh lebih baik daripada `simple` untuk korpus ini.

Satu kasus yang meleset dan perlu diketahui:

```
perangkat  →  angkat
```

"Perangkat" adalah kata dasar yang berarti *device* — kosakata inti untuk
Knowledge Base IT Support. Stemmer-nya mengira "per-" adalah imbuhan dan
memangkasnya menjadi "angkat" (*to lift*).

**Dampaknya terbatas, dan sengaja diterima:** mencari "perangkat" tetap
menemukan dokumen yang memuat "perangkat", karena keduanya menjadi leksem
yang sama. Yang berkurang hanya presisi — mencari "angkat" ikut memunculkan
dokumen tentang perangkat. Untuk korpus yang tidak membahas kegiatan
mengangkat, ini tidak merugikan.

Bila suatu saat mengganggu, jalan keluarnya kamus `synonym` atau `thesaurus`
milik sendiri — bukan mengganti seluruh konfigurasi ke `simple`, yang akan
menghilangkan seluruh manfaat stemming demi satu kata.

---

## N2 — Peringkat konten terkait memakai leksem teratas, bukan seluruhnya

`searchRelatedDocumentIds` menyusun kueri dari maksimal **30 leksem** dengan
posisi terbanyak di dokumen sumber, bukan dari seluruh `searchVector`.

Memakai seluruh leksem membuat `to_tsquery` menerima ratusan istilah yang
disambung `OR` — sangat lambat, dan urutan hasilnya nyaris tidak berubah
karena leksem berekor panjang muncul sekali dan hampir tidak menyumbang
peringkat.

Tiga puluh adalah angka yang dipilih, bukan diukur. Bila korpus sudah cukup
besar untuk diukur, angka ini yang pertama patut ditinjau.

---

## N3 — Endpoint pencarian belum dibatasi lajunya

`/api/search` publik dan menjalankan full-text query per permintaan. Yang
sudah ada: panjang kata kunci dibatasi 120 karakter, kueri di bawah dua
huruf dibalas tanpa menyentuh database, dan hasil dipotong 12 baris.

Yang belum: pembatasan laju. Ini bagian dari pekerjaan yang sama dengan
perlindungan form kontak (N3 Fase 3) — keduanya butuh pembatas laju per IP
yang sama, dan keduanya menunggu keputusan tabel hash IP yang ditunda
pemilik.

Dicatat sebagai penghambat deploy, bukan penghambat fase.

---

## N4 — Gambar OG tidak memakai font kustom

`next/og` bisa memuat font khusus dengan mengambil berkasnya saat render.
Yang dipakai di sini font sans-serif bawaan sistem render.

Alasannya sederhana: font kustom berarti berkas font ikut dimuat setiap kali
gambar dibuat, dan gambar OG dibuat untuk perayap — bukan untuk pengunjung.
Bila nanti tampilannya terasa kurang, memuat satu berkas WOFF dari
`public/` cukup, dan itu pekerjaan lima baris.

---

## N5 — RSS memuat ringkasan, bukan isi penuh

Disengaja. Isi penuh dokumen memuat tabel bukti, gambar, dan blok
terstruktur Fase 6 yang tidak terbaca di pembaca RSS mana pun tanpa konteks
halamannya. Ringkasan memang sudah ditulis untuk berdiri sendiri.

Konsekuensinya: pembaca RSS harus membuka situs untuk membaca isinya. Itu
pertukaran yang disengaja, bukan keterbatasan.
