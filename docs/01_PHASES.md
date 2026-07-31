# PHASE-BY-PHASE IMPLEMENTATION PLAN

# Phase 0 — Discovery and content inventory

## Goal

Prepare facts, assets, and privacy boundaries before coding.

## Deliverables

- Content inventory.
- Public/private asset classification.
- Indonesian and English profile copy.
- Initial project, SOP, lab, incident, and certificate lists.
- Redaction checklist.
- Route and feature priorities.

## Acceptance criteria

- Three projects, three SOPs, and three labs are selected.
- Profile copy exists in two languages.
- No invented metric is used.
- Sensitive files are identified.

---

# Phase 1 — Foundation, architecture, i18n, and themes

## Goal

Create the new application foundation with bilingual routes and themes before content pages.

## Deliverables

- Current stable Next.js App Router project.
- TypeScript strict mode.
- Tailwind and CSS-variable tokens.
- next-intl with `/id` and `/en`.
- Light/dark theme without flash.
- PostgreSQL and Prisma.
- Better Auth admin-only login.
- Environment validation.
- Error/loading/not-found foundations.
- Testing and CI foundations.

## Acceptance criteria

- `/id` and `/en` render.
- Locale and theme switches work.
- Admin login works.
- Public registration is unavailable.
- Prisma migration, lint, typecheck, tests, and build pass.

---

# Phase 2 — Design system, public shell, and motion

## Goal

Create an original premium visual system using the reference site's broad rhythm, not its assets.

## Deliverables

- Typography, spacing, radius, color, shadow, and motion tokens.
- Navbar and mobile drawer.
- Footer.
- Buttons, cards, badges, forms, dialogs, loading, empty, and error states.
- Motion provider, reveal, stagger, parallax, hover, and page transitions.
- Reduced-motion policy.

## Acceptance criteria

- Components work in both languages and themes.
- Focus is visible.
- Mobile does not depend on hover.
- Reduced motion removes parallax/excessive movement.
- No layout shift from entrances.

---

# Phase 3 — Core portfolio and Recruiter Mode

## Goal

Launch the recruiter-facing portfolio and its basic admin management.

## Deliverables

- Homepage.
- About.
- Experience.
- Projects and case studies.
- Expertise.
- Certifications.
- Contact.
- Recruiter Mode.
- CV download.
- Explore My Work panel.
- Admin CRUD for core portfolio content.

## Homepage order

1. Hero.
2. Explore My Work.
3. Career metrics.
4. Featured work.
5. Why Work With Me.
6. Capabilities.
7. Troubleshooting process.
8. Experience.
9. Certifications.
10. Knowledge preview.
11. Contact CTA.

## Acceptance criteria

- Job fit is clear in under two minutes.
- Three projects are public.
- Contact and CV work.
- Recruiter Mode is printable.

---

# Phase 4 — Public Knowledge Base

## Goal

Create public experiences for SOPs, labs, incidents, and articles.

## Deliverables

- Knowledge landing.
- Type listings and details.
- Category/tag pages.
- Search and filters.
- Sticky TOC.
- Scroll progress.
- Evidence gallery/lightbox.
- Code-copy interaction.
- Revision timeline.
- Localized SEO.

## Acceptance criteria

- Only published documents are public.
- Search/filter state appears in URLs.
- Tables work on mobile.
- Evidence and commands work accessibly.

---

# Phase 5 — Admin CMS, editor, media, and revisions

## Goal

Allow all content to be managed without source-code edits.

## Deliverables

- Admin dashboard.
- Unified KnowledgeDocument CRUD.
- Tiptap editor.
- SOP/Lab/Incident/Article templates.
- Autosave and local recovery.
- Indonesian/English preview.
- Publish/archive workflow.
- Revision history.
- Evidence manager.
- Categories/tags.
- Audit logs.
- JSON/Markdown export.

## Acceptance criteria

- Admin can create, preview, and publish each document type.
- Drafts are private.
- Published edits create revisions.
- Sensitive-data confirmation is enforced.

---

# Phase 6 — PNETLab, incidents, and structured evidence

## Goal

Provide specialized technical-proof blocks stronger than ordinary blog posts.

## PNETLab deliverables

- Topology.
- Device/interface inventory.
- IP and VLAN plans.
- Configuration and command blocks.
- Test cases.
- Fault simulation.
- Actual/expected results.
- Sanitized file downloads.

## Incident deliverables

- Number, priority, impact, urgency.
- Affected service.
- Timeline and troubleshooting log.
- RCA, workaround, resolution, validation, prevention.
- Related SOP.

## Acceptance criteria

- One complete lab and incident are published.
- Public files are sanitized.
- Original/private and public/redacted evidence are separated.

---

# Phase 7 — Search, analytics, SEO, and advanced UX

## Goal

Improve discovery and credibility after the core product is stable.

## Deliverables

- Site-wide command palette.
- PostgreSQL full-text search.
- Dynamic Open Graph images.
- Structured data and RSS.
- Privacy-conscious analytics.
- Related-content ranking.
- Optional passkey and two-factor authentication.
- Optional PDF export.

## Deliberately postponed

- AI assistant.
- Vector search.
- Public comments.
- Newsletter automation.

These may be evaluated only after enough content exists.

---

# Phase 8 — QA, security, performance, and deployment

## Goal

Prepare a reliable production launch.

## Required work

- Unit, component, authorization, and E2E tests.
- Locale, theme, mobile, accessibility, upload, contact, draft, revision, and backup tests.
- Security review for auth, HTML, uploads, signed URLs, rate limiting, CSP, secrets, and dependencies.
- Bundle, image, animation, query, cache, and Core Web Vitals review.
- Production database, R2, email, domain, HTTPS, sitemap, monitoring, backup, and rollback setup.

## Acceptance criteria

- Production build succeeds.
- Critical E2E tests pass.
- Drafts cannot be accessed without authorization.
- No known high-severity issue remains.
- Backup and rollback are documented.

---

# Phase 9 — Content launch and continuous improvement

## Minimum launch content

- Complete profile and experience.
- Three strong project case studies.
- Three SOPs.
- Three PNETLab labs.
- Two incident reports.
- One verified certificate.
- CV and contact.
- Complete Indonesian UI and key English pages/content.

## Monthly maintenance

- Publish one strong SOP or lab.
- Review CV and availability.
- Check links, backups, contact, and security updates.
- Remove weak or stale content.
- Review analytics without chasing vanity metrics.
