# MASTER PRODUCT REQUIREMENTS DOCUMENT

# Muhammad Sya'ban Alfain — IT Support Portfolio & Knowledge Base

**Version:** 1.0  
**Project:** New website built from zero  
**Primary purpose:** Career portfolio, technical proof, Knowledge Base, and recruiter-facing personal website  
**Languages:** Indonesian and English from the first release  
**Themes:** Light and dark from the first release  
**Delivery:** Phase-based implementation

---

## 1. Product Vision

Build a modern personal website that proves the owner can support users, troubleshoot operational technology, understand workplace networking, document solutions, build PNETLab labs, and develop practical systems.

The product must feel like a premium professional service website rather than a generic developer template.

### Main positioning

**Indonesian:**

> IT Support profesional yang membantu pengguna, menyelesaikan masalah operasional, dan mendokumentasikan solusinya.

**English:**

> An IT Support professional who helps users, resolves operational issues, and documents the solution.

---

## 2. Design-reference adaptation

The referenced Anara Travel experience is translated into an original portfolio structure:

| Reference pattern     | Portfolio adaptation                      |
| --------------------- | ----------------------------------------- |
| Large travel hero     | Professional IT Support positioning hero  |
| Trip search           | Explore My Work search/filter panel       |
| Favorite destinations | Featured projects, SOPs, and labs         |
| Why choose us         | Why work with me                          |
| Services              | IT Support capability areas               |
| Private-tour CTA      | Recruiter/client contact CTA              |
| Premium layered cards | Original project, evidence, and lab cards |

Do not copy the reference site's logo, photographs, wording, exact layout, code, or proprietary assets. Use only broad experience principles: large visual hierarchy, whitespace, content discovery, trust sections, service categories, and smooth motion.

---

## 3. Goals

### Primary

- Improve job applications for IT Support and Technical Support roles.
- Show evidence, not only skill claims.
- Provide a bilingual professional presence.
- Publish SOPs, PNETLab labs, incidents, and technical articles.
- Allow content management without editing source code.
- Help recruiters understand job fit quickly.
- Help technical interviewers inspect deeper work evidence.

### Non-goals

- Public registration.
- Comments, likes, followers, or forum.
- E-commerce.
- Course marketplace.
- Real-time collaboration.
- Public editing.
- Heavy autoplay video.
- Fake testimonials or invented achievements.

---

## 4. Target users

### Recruiter / HR

Needs a quick summary, experience, skills, certificates, CV, evidence, and contact.

### Technical interviewer

Needs troubleshooting processes, PNETLab evidence, SOP quality, commands, testing, and security awareness.

### Hiring manager

Needs evidence of ownership, communication, prioritization, onboarding/offboarding, assets, vendors, and multi-location support.

### Admin / site owner

Needs secure login, bilingual fields, rich editing, draft/publish, evidence upload, revisions, analytics, and backup.

---

## 5. Core modules

### Public portfolio

- Home.
- About.
- Experience.
- Projects and case studies.
- Expertise.
- Certifications.
- Knowledge Base.
- Recruiter Mode.
- Site-wide search.
- Contact.
- CV download.

### Knowledge Base

Unified content types:

- SOP.
- PNETLab Lab.
- Incident Report.
- Technical Article.

Shared capabilities:

- Category and tags.
- Tools and difficulty.
- Rich content.
- Evidence gallery.
- Commands and tables.
- Related content.
- Revisions.
- Search and filtering.

### Admin CMS

- Dashboard.
- Profile, experience, project, skill, and certificate management.
- Unified KnowledgeDocument management.
- Tiptap editor.
- Media/evidence manager.
- Contact messages.
- Settings.
- Analytics summary.
- Backup/export.

---

## 6. Essential, removed, and added features

### Essential

- `/id` and `/en` routes from the first commit.
- Light/dark themes from the first commit.
- Responsive and accessible design.
- Premium animation with reduced-motion support.
- Admin-only CMS.
- Rich SOP editor.
- PNETLab and incident evidence.
- Draft, publish, archive, and revisions.
- Search and filters.
- Dynamic localized SEO.
- Secure contact form.

### Removed because they do not support the goal

- Public accounts.
- Public comments.
- Likes and ratings.
- Forum.
- Newsletter in MVP.
- Public chatbot in MVP.
- Multiple admin systems for each content type.
- Multiple animation libraries.
- Heavy video backgrounds.

### Added for stronger job value

- Recruiter Mode.
- Explore My Work search panel.
- Translation-completeness indicator.
- Evidence-redaction confirmation.
- Copyable command blocks.
- Scroll progress and sticky table of contents.
- Dynamic Open Graph images.
- PNETLab IP-plan and test-case blocks.
- Incident timeline and RCA blocks.
- Admin audit log.
- JSON/Markdown content backup.

---

## 7. Technology architecture

Use current stable versions at implementation time.

### Application

- Next.js App Router.
- React and TypeScript.
- Server Components by default.
- Client Components only where interaction is required.

### Styling

- Tailwind CSS.
- CSS-variable design tokens.
- shadcn/ui only for useful accessible primitives.
- Lucide icons.

### Animation

- Motion for React as the only animation library.
- CSS transitions for simple hover/focus.
- Centralized motion tokens.
- Reduced-motion support.

### Internationalization

- next-intl.
- Always-prefixed routes: `/id` and `/en`.
- Indonesian default redirect.
- Locale-aware date, number, metadata, and sitemap.

### Theme

- Visible choices: light and dark.
- Initial preference may follow the operating system.
- Store explicit preference.
- Prevent incorrect-theme flash.

### Data and server

- PostgreSQL.
- Prisma ORM.
- Better Auth for admin-only access.
- No public registration.
- React Hook Form and Zod.

### Content and storage

- Tiptap rich editor.
- Structured JSON as source of truth.
- Sanitized HTML for rendering and search.
- Cloudflare R2 or S3-compatible object storage.
- Public thumbnails and private originals.

### Email and protection

- Resend.
- Cloudflare Turnstile.
- Honeypot and rate limiting.

### Quality

- Vitest and React Testing Library.
- Playwright.
- Accessibility checks.
- Production build required per phase.

---

## 8. Route structure

```text
/[locale]
├── /
├── /about
├── /experience
├── /projects
├── /projects/[slug]
├── /expertise
├── /certifications
├── /knowledge
│   ├── /sop
│   ├── /sop/[slug]
│   ├── /labs
│   ├── /labs/[slug]
│   ├── /incidents
│   ├── /incidents/[slug]
│   ├── /articles
│   ├── /articles/[slug]
│   ├── /category/[slug]
│   └── /tag/[slug]
├── /recruiter
├── /contact
├── /privacy
└── /terms

/admin
├── /login
├── /
├── /profile
├── /experiences
├── /projects
├── /skills
├── /certifications
├── /knowledge
├── /knowledge/new
├── /knowledge/[id]/edit
├── /categories
├── /tags
├── /media
├── /messages
├── /analytics
├── /settings
└── /backup
```

---

## 9. Homepage requirements

### Navbar

- Name/logo.
- Home, Projects, Expertise, Knowledge Base, About, Contact.
- Language selector.
- Theme toggle.
- CV button.
- Transparent over hero, solid/blurred after scroll.
- Accessible animated mobile drawer.

### Hero

Left:

- Availability badge.
- Professional role.
- Strong headline.
- Short summary.
- View Portfolio CTA.
- Explore Knowledge Base CTA.
- CV and social links.

Right:

- Original profile photo.
- Floating SOP card.
- PNETLab topology card.
- Resolved-ticket card.
- Network-status card.
- Tool badges.

### Explore My Work panel

- Content type: Project, SOP, Lab, Incident.
- Skill/tool.
- Keyword.
- Search action.

### Remaining sections

1. Career metrics based only on real data.
2. Featured work in an editorial card layout.
3. Why Work With Me.
4. IT Support Capabilities.
5. Troubleshooting workflow.
6. Experience timeline.
7. Certifications and learning.
8. Knowledge Base preview.
9. Contact CTA.
10. Footer.

---

## 10. Project case study

Each project supports:

- Indonesian and English title/summary.
- Role and date.
- Problem.
- Objectives.
- Responsibilities.
- Solution.
- Features.
- Technology.
- Architecture.
- Screenshots.
- Testing.
- Results.
- Lessons learned.
- Repository/demo links.
- Related SOP/lab.
- Featured status.

Recommended initial projects:

- IT Support Operations case study.
- PNETLab enterprise-office lab.
- IT Support SOP and Knowledge Base.
- HKBP web system.
- Android ship-monitoring system.
- E-Gudang inventory system.
- Financial planner or school platform.

Never publish confidential company data without permission.

---

## 11. Knowledge Base requirements

### Shared metadata

- Type.
- Status.
- Category.
- Tags.
- Tools.
- Difficulty.
- Reading time.
- Document code.
- Version.
- Publication/update dates.
- Featured status.
- Translation completeness.

### Shared detail components

- Breadcrumb.
- Type badge.
- Title and summary.
- Version and document code.
- Tools and reading time.
- Scroll progress.
- Sticky table of contents.
- Rich content.
- Evidence gallery.
- Related documents.
- Revision timeline.
- Share and print.

### SOP blocks

Purpose, scope, definitions, responsibility, requirements, procedure, validation, escalation, security, risks, rollback, evidence, and revisions.

### Lab blocks

Objective, scenario, topology, devices, IP/VLAN plan, steps, commands, test cases, fault simulation, results, evidence, lessons learned, and sanitized downloads.

### Incident blocks

Incident number, impact, urgency, priority, service, symptoms, timeline, investigation, root cause, workaround, resolution, validation, prevention, evidence, and related SOP.

### Article blocks

Introduction, concept, practical example, commands/configuration, mistakes, troubleshooting, conclusion, and references.

---

## 12. Admin CMS requirements

### Workflow

- Draft.
- In review.
- Published.
- Archived.

Rules:

- Public routes only show published content.
- Editing published content creates a revision draft.
- Indonesian is required to publish Indonesian routes.
- English publication requires the defined minimum completeness.
- Destructive actions require confirmation and audit logging.

### Rich editor

- Paragraph and headings.
- Bold, italic, underline.
- Lists and checklist.
- Link, image, caption, table, quote, divider.
- Inline code and code block.
- Callout.
- Procedure block.
- Evidence block.
- Validation block.
- Risk/rollback block.
- Slash commands.
- Autosave and local recovery.
- Indonesian/English preview.
- Reading time and completeness indicator.

### Evidence manager

- Drag-and-drop.
- Multi-upload.
- Preview and reorder.
- Thumbnails.
- Alt text and captions in both languages.
- Public/private status.
- Sensitive-data warning.
- Redaction confirmation.

### Backup

- JSON export.
- Markdown export when possible.
- Media inventory.
- Documented database backup process.

---

## 13. Bilingual requirements

- All public UI strings use translation keys from the first commit.
- No hard-coded public labels.
- Locale switch retains the current route where possible.
- Dynamic public content uses paired fields such as `titleId`, `titleEn`, `contentIdJson`, and `contentEnJson`.
- English may be optional in draft but completeness is visible.
- Localized metadata, canonical links, hreflang, and sitemap are required.

---

## 14. Theme and visual design

### Light direction

- Light blue-gray background.
- White surfaces.
- Deep navy text.
- Blue/cyan accents.
- Soft borders and shadows.

### Dark direction

- Deep navy, not pure black.
- Elevated blue-gray surfaces.
- White-gray text.
- Blue/cyan accents.
- Controlled glow.

### Suggested tokens

Light:

- Background `#F5F8FC`
- Surface `#FFFFFF`
- Text `#0B1F35`
- Muted `#5C6B7A`
- Border `#DDE6EF`
- Primary `#176BFF`
- Cyan `#18BDEB`
- Success `#169B62`

Dark:

- Background `#06111F`
- Surface `#0C1B2D`
- Elevated `#11253B`
- Text `#F4F8FC`
- Muted `#A8B6C6`
- Border `#213A54`
- Primary `#5B9CFF`
- Cyan `#36D4F4`
- Success `#42D392`

Use original profile photos, screenshots, diagrams, terminal outputs, icons, and CSS-generated decorations. Do not reuse travel-brand assets.

---

## 15. Animation system

Patterns:

- Hero text reveal.
- Layered floating cards.
- Scroll-triggered section reveals.
- Staggered featured cards.
- Image hover scale.
- Navbar transformation.
- Active-link underline.
- Scroll progress.
- TOC highlight.
- Lightbox fade/scale.
- Layout animation for media reorder.
- Page transitions.

Rules:

- Transform and opacity first.
- Content remains usable during animation.
- No animation for every paragraph.
- No dependence on hover on mobile.
- Respect reduced motion globally.
- Disable parallax and perpetual movement when requested.
- Pause optional looping motion when the page is inactive.

---

## 16. Recruiter Mode and search

### Recruiter Mode

A focused, printable page containing:

- Summary and target role.
- Experience.
- Top skills.
- Selected achievements.
- Certifications.
- Three projects.
- Three knowledge documents.
- CV and contact.

### Search

Search projects, SOPs, labs, incidents, articles, skills, and tools.

- Command-palette shortcut.
- Search page fallback.
- Keyboard support.
- URL-based filters.
- PostgreSQL full-text search in an advanced phase.

---

## 17. Security

- Admin-only authentication.
- No public signup.
- Server-side authorization on every mutation.
- Zod validation.
- Sanitized HTML.
- Upload MIME and size checks.
- Signed private URLs.
- Rate limiting.
- Turnstile.
- Secure headers and CSP.
- No secrets in client bundles.
- Evidence redaction checks.
- Audit logs.
- Avoid raw visitor-IP storage unless required and disclosed.

---

## 18. Performance and accessibility

### Targets

- LCP ≤ 2.5 seconds.
- INP ≤ 200 ms.
- CLS ≤ 0.1.

### Performance rules

- Server Components on public pages.
- Dynamic import for editor and lightbox.
- Responsive optimized images.
- Lazy-load below the fold.
- No large hero video.
- One animation library.
- Cache public data and revalidate after publish.
- Generate thumbnails.

### Accessibility

- WCAG AA contrast.
- Semantic headings.
- Keyboard navigation.
- Visible focus.
- Skip link.
- 44 px touch targets.
- Required alt text.
- Accessible tables and dialogs.
- Reduced motion.
- No color-only meaning.

---

## 19. Initial content plan

### Profile

- Muhammad Sya'ban Alfain.
- Bachelor of Information Systems.
- IT Support experience.
- Productive TKJ teaching experience.
- Google IT Support certificate.
- Target: IT Support / Technical Support.

### Initial SOPs

1. Windows installation.
2. New laptop setup.
3. User onboarding.
4. User offboarding.
5. Network printer installation.
6. No-internet troubleshooting.
7. VPN support.
8. MikroTik backup and restore.
9. IT incident handling.
10. Password reset and account unlock.

### Initial labs

1. Two LANs and one router.
2. MikroTik DHCP.
3. Department VLANs.
4. Inter-VLAN routing.
5. Guest isolation.
6. HQ-branch static routing.
7. OSPF fundamentals.
8. Site-to-site VPN.
9. Windows Server/client integration.
10. Multi-location capstone.

### Initial incidents

- APIPA due to DHCP failure.
- DNS failure while public IP remains reachable.
- Network printer offline.
- Outlook repeated password prompt.
- VPN connected but internal resource unavailable.
- Domain join failure due to DNS.
- Guest VLAN reaching an internal server.
- Slow laptop due to storage/startup load.

---

## 20. Delivery phases

- Phase 0 — Discovery and content inventory.
- Phase 1 — Foundation, architecture, i18n, and themes.
- Phase 2 — Design system, public shell, and motion.
- Phase 3 — Core portfolio and Recruiter Mode.
- Phase 4 — Public Knowledge Base.
- Phase 5 — Admin CMS, editor, media, and revisions.
- Phase 6 — PNETLab, incidents, and structured evidence.
- Phase 7 — Search, analytics, SEO, and advanced UX.
- Phase 8 — QA, security, performance, and deployment.
- Phase 9 — Content launch and continuous improvement.

---

## 21. Launch acceptance criteria

- `/id` and `/en` work.
- Light and dark themes work without flashing.
- Responsive public pages work.
- Admin authentication is secure.
- Portfolio content is manageable.
- Knowledge documents can be drafted and published.
- Evidence can be uploaded and reordered.
- Drafts remain private.
- Revisions work.
- Search and Recruiter Mode work.
- Contact form works with spam protection.
- Localized SEO is present.
- Critical accessibility and E2E tests pass.
- Production build succeeds.
- At least three projects, three SOPs, and three labs are published.
- No secret or confidential data is public.

---

## 22. Definition of done per phase

Every phase must:

- Pass lint.
- Pass type checking.
- Pass relevant tests.
- Pass production build.
- Work in Indonesian and English.
- Work in light and dark.
- Work on mobile and desktop.
- Preserve previous completed phases.
- Update documentation.
- Use small logical commits.
