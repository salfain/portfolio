# <!-- feat: judul singkat -->

**Fase:** <!-- 1 / 2 / 3 / … -->

## Apa yang diubah

<!-- 2–4 kalimat. Apa dan kenapa, bukan daftar berkas. -->

## Keputusan yang diambil

<!-- Ada pilihan teknis yang perlu diketahui pemeriksa? Tulis di sini. Kosongkan bila tidak ada. -->

## Screenshot

| Terang | Gelap |
|---|---|
| <!-- gambar --> | <!-- gambar --> |

<!-- Perubahan yang terlihat WAJIB menyertakan keduanya. Tambahkan mobile bila relevan. -->

---

## Gerbang otomatis

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`

## Gerbang manual

- [ ] Bahasa Indonesia (`/id`)
- [ ] Bahasa Inggris (`/en`)
- [ ] Tema terang
- [ ] Tema gelap — **hard reload, tanpa kedipan**
- [ ] Mobile 375 px — **tanpa scroll horizontal**
- [ ] Desktop 1440 px
- [ ] Navigasi keyboard, fokus terlihat
- [ ] Reduced motion aktif

## Isi kode

- [ ] Tidak ada teks langsung di JSX pada rute publik
- [ ] Tidak ada warna hex atau kelas warna Tailwind bawaan
- [ ] Tidak ada `console.log`, `any`, atau `@ts-ignore` tanpa alasan tertulis
- [ ] Query publik menyaring `status: 'PUBLISHED'`
- [ ] Server action memanggil `requireAdmin()` di baris pertama
- [ ] Tidak ada rahasia di kode, tes, atau data seed
- [ ] Tidak ada dependency baru di luar rencana fase
- [ ] `Link` berasal dari `@/i18n/navigation`

## Dokumentasi

- [ ] `docs/phase-N/README.md` diperbarui
- [ ] Temuan di luar cakupan dicatat di `NOTES.md`
- [ ] Env var baru ada di `.env.example` dengan nilai kosong

---

## Cakupan

- [ ] PR ini **hanya** mengerjakan fase yang sedang berjalan
- [ ] Tidak merombak kode fase sebelumnya tanpa diminta

## Keterbatasan yang tersisa

<!-- Yang sengaja belum dikerjakan, beserta alasannya. Jujur di sini lebih baik daripada ditemukan pemeriksa. -->
