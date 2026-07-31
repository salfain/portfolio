# FASE 2 — CATATAN DI LUAR CAKUPAN

## N1 — `<html lang>` tidak dinamis per-locale (SELESAI)

**Masalah awal (Fase 1):** Root layout statis tanpa `lang` per-locale. Nested layout tidak boleh render `<html>`.

**Upaya Fase 2:**
1. Baca `x-next-intl-locale` header di root layout → gagal saat static prerender (header kosong)
2. Fallback `x-invoke-path` parse → gagal (header tidak tersedia saat SSG)
3. `force-dynamic` → broke RSC (`net::ERR_ABORTED`), direvert

**Solusi akhir:** Pindah `<html lang={locale}>` ke `[locale]/layout.tsx` (punya `locale` param langsung dari segment). Root layout jadi pass-through (`return children`). Admin layout render `<html lang="id" data-theme="light">` sendiri.

**Hasil:** `/id` → `lang="id"` ✓, `/en` → `lang="en"` ✓

---

## Hydration warning dari next-themes

`next-themes` set `data-theme` di `<html>` pada client, server render kosong. `suppressHydrationWarning` di `<html>` menangani mismatch. Warning di console tidak fatal — umum di semua proyek next-themes.

---

## `next lint` deprecation

`next lint` deprecated, akan dihapus di Next.js 16. Migrasi ke ESLint CLI:
```
npx @next/codemod@canary next-lint-to-eslint-cli .
```
Ditangguhkan — tidak menghambat Fase 2.
