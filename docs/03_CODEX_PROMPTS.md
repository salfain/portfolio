# CODEX PHASE PROMPTS

> ⚠️ **USANG — jangan dipakai untuk penugasan.**
> Digantikan oleh [PROMPTS.md](PROMPTS.md), yang sudah memuat keputusan
> fase-0, folder `docs/rules/`, dan Fase 3.5 (deploy).
> Berkas ini disimpan sebagai arsip niat awal.

Use one phase prompt at a time. Do not request the complete product in one run.

## Global instruction

```text
Build a new production-ready personal website named
“Muhammad Sya'ban Alfain — IT Support Portfolio & Knowledge Base”.

Read 00_MASTER_PRD.md, 01_PHASES.md, and 02_DESIGN_AND_DATA.md.
Implement only the phase explicitly requested.

Global rules:
- This is a new project, not an edit of the old portfolio.
- Use current stable Next.js App Router, React, TypeScript, and Tailwind.
- Use Server Components by default.
- Use next-intl from the first commit with /id and /en routes.
- Implement light and dark themes from the first commit.
- Use PostgreSQL and Prisma.
- Use Better Auth for admin-only access.
- Do not implement public registration.
- Use Motion for React as the only animation library.
- Respect reduced-motion preferences.
- Use Tiptap only for the admin editor.
- Use Cloudflare R2 or S3-compatible storage for media.
- Use Zod on server and client boundaries.
- Never invent personal achievements, metrics, testimonials, or certificates.
- Never publish sensitive screenshots, credentials, public IPs, or production configuration.
- Do not copy Anara Travel assets, branding, text, exact layout, or code.
- Use small logical commits.
- Before completing a phase, run lint, typecheck, relevant tests, and production build.
- Report changed files, commands, migrations, environment variables, limitations, and dependencies for the next phase.
```

## Phase 0 prompt

```text
Implement Phase 0 only.
Do not build application features yet.
Create a content inventory, public/private classification, route map,
asset naming rules, redaction checklist, and seed-content drafts in
Indonesian and English. Do not invent facts.
```

## Phase 1 prompt

```text
Implement Phase 1 only.
Create the project foundation, /id and /en routing, light/dark themes,
PostgreSQL, Prisma, Better Auth admin-only login, environment validation,
error/loading/not-found foundations, tests, and CI.
Do not build the complete homepage or CMS.
```

## Phase 2 prompt

```text
Implement Phase 2 only.
Create the original design system, responsive public shell, navbar,
mobile drawer, footer, UI primitives, motion utilities, and accessibility.
Use premium spacing and layered motion inspired by broad service-site
patterns, but do not copy the reference website.
```

## Phase 3 prompt

```text
Implement Phase 3 only.
Build the public portfolio, project case studies, Recruiter Mode,
Explore My Work, contact flow, CV download, and admin CRUD for profile,
experience, skills, projects, and certificates.
```

## Phase 4 prompt

```text
Implement Phase 4 only.
Build public Knowledge Base routes for SOP, LAB, INCIDENT, and ARTICLE,
including listings, filters, details, TOC, scroll progress, evidence,
code copy, revisions, related content, and localized SEO.
Ensure drafts are never public.
```

## Phase 5 prompt

```text
Implement Phase 5 only.
Build the unified admin Knowledge CMS, Tiptap editor, templates, autosave,
local recovery, bilingual preview, media/evidence management, publish and
archive workflow, revisions, categories, tags, audit logs, and backup export.
Dynamically load Tiptap and keep it out of public bundles.
```

## Phase 6 prompt

```text
Implement Phase 6 only.
Add structured PNETLab topology/device/IP/VLAN/test-case/fault-simulation
blocks, structured incident timeline/RCA blocks, evidence redaction,
private originals, public sanitized files, and mobile-safe technical tables.
```

## Phase 7 prompt

```text
Implement Phase 7 only.
Add full-text search, command palette, privacy-conscious analytics,
dynamic Open Graph images, structured data, RSS, related-content ranking,
and optional admin passkey/2FA. Do not add AI search unless separately approved.
```

## Phase 8 prompt

```text
Implement Phase 8 only.
Run and improve security, accessibility, performance, authorization,
E2E testing, database indexing, caching, uploads, deployment, backup,
and rollback. Fix all critical issues found.
```

## Phase 9 prompt

```text
Implement Phase 9 only.
Add real launch content from approved source material, check bilingual
quality, evidence redaction, SEO, links, CV, contact, and analytics.
Do not invent achievements or publish confidential data.
```
