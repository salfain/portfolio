# DESIGN SYSTEM AND DATA MODEL DIRECTION

## 1. Visual direction

### Light palette

- Background: `#F5F8FC`
- Surface: `#FFFFFF`
- Elevated: `#EEF4FA`
- Text: `#0B1F35`
- Muted: `#5C6B7A`
- Border: `#DDE6EF`
- Primary: `#176BFF`
- Cyan: `#18BDEB`
- Success: `#169B62`
- Warning: `#D99A13`
- Danger: `#D74646`

### Dark palette

- Background: `#06111F`
- Surface: `#0C1B2D`
- Elevated: `#11253B`
- Text: `#F4F8FC`
- Muted: `#A8B6C6`
- Border: `#213A54`
- Primary: `#5B9CFF`
- Cyan: `#36D4F4`
- Success: `#42D392`
- Warning: `#F2BE4E`
- Danger: `#FF7070`

### Shape and typography

- Large card radius: 28 px.
- Standard card radius: 20–24 px.
- Pill buttons/badges when appropriate.
- Display font: Geist, Manrope, or Plus Jakarta Sans.
- Body: Geist or Inter.
- Code: Geist Mono or JetBrains Mono.
- Maximum layout container: 1280–1440 px.
- Reading width: 720–860 px.

### Asset policy

Use original:

- Profile photography.
- Project screenshots.
- PNETLab screenshots.
- Sanitized terminal output.
- Draw.io/Excalidraw diagrams.
- CSS gradients and grids.
- Open-license iconography.

Do not scrape or reuse the reference travel site's images, logo, text, or proprietary graphic assets.

---

## 2. Motion tokens

```ts
export const motionTokens = {
  duration: {
    fast: 0.18,
    normal: 0.35,
    slow: 0.6,
    hero: 0.8
  },
  ease: {
    standard: [0.22, 1, 0.36, 1],
    enter: [0.16, 1, 0.3, 1],
    exit: [0.4, 0, 1, 1]
  },
  distance: {
    small: 8,
    medium: 20,
    large: 36
  }
}
```

Hero choreography:

1. Background and grid fade.
2. Eyebrow.
3. Headline.
4. Summary.
5. CTA group.
6. Main visual.
7. Floating cards with small stagger.

Total hero entrance should not block interaction or exceed roughly 1.5 seconds.

---

## 3. Unified data model

### Main entities

- User.
- SiteProfile.
- Experience.
- Skill.
- Project.
- ProjectMedia.
- Certificate.
- KnowledgeCategory.
- KnowledgeTag.
- KnowledgeDocument.
- KnowledgeEvidence.
- KnowledgeRevision.
- ContactMessage.
- SiteSetting.
- AuditLog.

### Knowledge enums

```prisma
enum KnowledgeType {
  SOP
  LAB
  INCIDENT
  ARTICLE
}

enum PublishStatus {
  DRAFT
  IN_REVIEW
  PUBLISHED
  ARCHIVED
}
```

### KnowledgeDocument minimum fields

```prisma
model KnowledgeDocument {
  id               String        @id @default(cuid())
  authorId         String
  categoryId       String?
  type             KnowledgeType
  status           PublishStatus @default(DRAFT)
  slug             String        @unique
  documentCode     String?       @unique
  version          String        @default("1.0")
  titleId          String
  titleEn          String?
  summaryId        String
  summaryEn        String?
  contentIdJson    Json
  contentEnJson    Json?
  contentIdHtml    String?
  contentEnHtml    String?
  coverUrl         String?
  difficulty       String?
  estimatedMinutes Int?
  tools            String[]
  metadata         Json?
  isFeatured       Boolean       @default(false)
  viewCount        Int           @default(0)
  publishedAt      DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}
```

### Metadata examples

SOP:

```json
{
  "scope": "Windows endpoint",
  "owner": "IT Support",
  "riskLevel": "medium"
}
```

Lab:

```json
{
  "topology": "HQ and Branch",
  "devices": 7,
  "estimatedHours": 8
}
```

Incident:

```json
{
  "impact": "medium",
  "urgency": "high",
  "priority": "P2",
  "resolutionMinutes": 35
}
```

### Bilingual strategy

Because the product has two fixed languages, paired fields are simpler than a generalized translation platform. Admin draft can contain incomplete English fields, but publication status must clearly show locale completeness.
