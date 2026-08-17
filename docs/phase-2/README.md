# FASE 2 — DESIGN SYSTEM, PUBLIC SHELL, MOTION

**Status:** ✅ Selesai
**Tanggal mulai:** 31 Juli 2026
**Tanggal selesai:** 31 Juli 2026

---

## Yang dibuat

### Design tokens & motion

- `src/lib/motion.ts` — token durasi (`fast/normal/slow/hero`), easing (`standard/enter/exit`), jarak (`small/medium/large`), preset `transitions`
- 4 komponen motion: `reveal.tsx` (scroll reveal), `stagger.tsx` (stagger container/item), `parallax.tsx` (scroll parallax), `hover.tsx` (hover scale) — semua mati saat `prefers-reduced-motion: reduce`

### UI components (14 file)

- `button.tsx` — variants primary/secondary/ghost/danger, sizes sm/md/lg, `asChild` via Radix Slot, loading spinner, forwardRef
- `card.tsx` — Card/CardHeader/CardBody/CardFooter, `rounded-3xl border bg-surface`
- `badge.tsx` — variants default/primary/success/warning/danger
- `input.tsx`, `textarea.tsx`, `label.tsx` — form controls, forwardRef
- `dialog.tsx` — Radix Dialog, overlay, close button (inline SVG)
- `drawer.tsx` — Radix Dialog as slide-in, side prop (left/right)
- `skeleton.tsx`, `spinner.tsx` — loading states
- `empty-state.tsx`, `error-state.tsx` — status states
- `index.ts` — barrel export

### Public shell

- `navbar.tsx` — sticky top, logo "MSA", desktop nav (md+), LocaleSwitch (sm+), ThemeToggle, mobile menu trigger (md:hidden)
- `mobile-drawer.tsx` — Radix Drawer, nav links, LocaleSwitch in footer, close on link click
- `footer.tsx` — brand, nav links, copyright with year
- `locale-switch.tsx` — toggle ID↔EN, `usePathname`/`useRouter` from `@/i18n/navigation`
- `skip-link.tsx` — `sr-only focus:not-sr-only`, href="#main-content"
- `index.ts` — barrel export

### i18n keys

- `nav.*` (siteName, home, projects, knowledge, menu, openMenu, closeMenu)
- `footer.*` (name, role, home, projects, knowledge, rights)
- `a11y.skipToContent`
- ID: "Knowledge Base" dan "IT Support" TIDAK diterjemahkan

  Catatan lama di baris ini menyebut "Basis Pengetahuan" dan "Dukungan IT".
  Itu bertentangan dengan `docs/phase-0/03_PROFILE_COPY.md` — sumber
  kebenaran tertinggi menurut CLAUDE.md — yang memakai "Jelajahi Knowledge
  Base" (§7), "Dari Knowledge Base" (§8), "Kemampuan IT Support" (§8), dan
  "IT Support · Dukungan Teknis · Dokumentasi" (§3) di kolom Indonesia.

  Akibatnya `id.json` sempat memakai dua istilah sekaligus: navigasi dan
  footer menerjemahkannya, sementara hero, pencarian, dan halaman
  Ketentuan tidak. Sekarang disamakan mengikuti Fase 0. Alasan yang sama
  dipakai untuk tag di `docs/phase-0/04_SEED_CONTENT_DRAFT.md` §222:
  istilah teknis yang diterjemahkan justru memecah navigasi.

### Layout

- Root layout → pass-through (tidak render `<html>`)
- `[locale]/layout.tsx` → render `<html lang={locale}>` + `<body>` + Navbar/Footer/SkipLink
- `admin/layout.tsx` → render `<html lang="id" data-theme="light">` + `<body>`

---

## N1 — `<html lang>` dinamis per-locale (SELESAI)

**Masalah:** Root layout tidak bisa akses `locale` param. Header `x-next-intl-locale` & `x-invoke-path` tidak tersedia saat static prerender.

**Solusi:** Pindah `<html lang={locale}>` dari root layout ke `[locale]/layout.tsx` (punya `locale` param langsung). Root layout jadi pass-through. Admin layout render `<html lang="id">` sendiri.

**Hasil:** `/id` → `lang="id"` ✓, `/en` → `lang="en"` ✓

---

## Acceptance criteria

| Kriteria                                               | Status |
| ------------------------------------------------------ | ------ |
| Komponen bekerja di kedua bahasa dan tema              | ✅     |
| Focus visible                                          | ✅     |
| Mobile tidak bergantung hover                          | ✅     |
| Reduced motion menghilangkan parallax/gerakan berlebih | ✅     |
| Tidak ada layout shift dari entrance                   | ✅     |

---

## Gates

| Gate      | Hasil        |
| --------- | ------------ |
| typecheck | ✅           |
| lint      | ✅           |
| test      | ✅ 13/13     |
| build     | ✅ 8/8 pages |

---

## Uji manual (8 titik)

| Titik                                | Hasil |
| ------------------------------------ | ----- |
| `/id` render navbar/footer/skip-link | ✅    |
| `/en` render navbar/footer/skip-link | ✅    |
| `<html lang>` dinamis (id/en)        | ✅    |
| Locale switch ID↔EN                  | ✅    |
| Theme toggle + hard reload persist   | ✅    |
| Mobile 375px + drawer                | ✅    |
| Desktop 1440px desktop nav           | ✅    |
| Keyboard tab order + reduced motion  | ✅    |
