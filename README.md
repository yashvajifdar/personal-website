# yashvajifdar.com — Personal Website

Personal brand and consulting marketing site serving two audiences simultaneously:
Director-level hiring managers and mid-market analytics consulting prospects.

Live at **[yashvajifdar.com](https://yashvajifdar.com)**

---

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | RSC, static generation, Vercel-native |
| Language | TypeScript strict | Catches errors at build time, not runtime |
| Styling | Tailwind CSS + design tokens | Consistent visual language without a component library |
| Content | MDX files in `content/articles/` | No CMS dependency, version-controlled articles |
| Hosting | Vercel (free tier) | Zero-config Next.js deploy, auto SSL, global CDN |
| DNS / CDN | Cloudflare (free tier) | DDoS protection, caching, fast DNS, free SSL |
| Domain registrar | GoDaddy (transfer to Cloudflare before June 2026) | Transfer saves ~$13/yr |

Full architecture decisions and tradeoff tables: [`docs/architecture.md`](docs/architecture.md)

---

## Running Locally

```bash
cd projects/personal-website
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run typecheck  # TypeScript check — run before every push
npm run build      # Production build — catches errors locally before Vercel does
npm run lint       # ESLint
```

---

## Project Structure

```
personal-website/
│
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # / — Hero, credential anchors, portfolio preview
│   ├── about/page.tsx            # /about — Story, principles, partnerships
│   ├── work/page.tsx             # /work — Portfolio projects
│   ├── services/page.tsx         # /services — Consulting offer, pricing, fit
│   ├── writing/page.tsx          # /writing — Article index
│   ├── writing/[slug]/page.tsx   # /writing/:slug — Dynamic MDX article
│   ├── contact/page.tsx          # /contact — Consulting + recruiting paths
│   ├── layout.tsx                # Root layout — Nav, Footer, global metadata
│   └── globals.css               # Global styles, Tailwind base
│
├── components/
│   ├── layout/
│   │   ├── Nav.tsx               # Sticky top nav with active route highlighting
│   │   └── Footer.tsx
│   └── ui/
│       ├── Button.tsx            # primary / secondary / ghost variants
│       ├── Tag.tsx               # Small pill label for tech tags
│       └── SectionLabel.tsx      # Uppercase label above section headings
│
├── content/
│   └── articles/                 # MDX files — set published: true to go live
│
├── lib/
│   ├── articles.ts               # Frontmatter parsing, article index builder
│   └── cn.ts                     # clsx + tailwind-merge utility
│
├── docs/
│   ├── architecture.md           # Stack decisions, tradeoff tables, infrastructure diagram
│   ├── runbook.md                # Deploy, DNS, domain transfer, troubleshooting
│   └── roadmap.md                # What's next — lumber integration, articles, features
│
├── public/                       # Static assets (favicon, OG image — see roadmap)
├── tailwind.config.ts            # Design tokens — colors, fonts, spacing
├── next.config.mjs               # Next.js config
└── tsconfig.json                 # TypeScript strict mode
```

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Hero, credential anchors (Amazon Alexa AI, 250+ org), consulting CTA |
| `/about` | Practitioner story, principles, MIT + Kodi partnerships |
| `/work` | Portfolio — Lumber AI Analytics, MIT research, upcoming |
| `/services` | Consulting offer — deliverables, pricing, who it's for |
| `/writing` | Article index — published MDX pieces |
| `/writing/[slug]` | Individual MDX article with typography |
| `/contact` | Two paths: consulting inquiry + Director recruiting |

---

## Publishing an Article

Create `content/articles/<slug>.mdx`:

```mdx
---
title: "Title Here"
description: "One sentence for SEO and the article index card."
date: "2026-06-01"
tags: ["Data Engineering", "AI"]
published: true
publication: "MIT x Jackfruit.ai"   # optional
coAuthors: ["Name Here"]            # optional
---

Article body in Markdown...
```

Set `published: false` to draft. Push to `main` and Vercel deploys automatically.

---

## Design Tokens

All colors defined in `tailwind.config.ts`. Never use raw hex in components.

| Token | Use |
|-------|-----|
| `ink` / `ink-muted` / `ink-subtle` | Text hierarchy |
| `surface-1` through `surface-3` | Background tones |
| `accent` | Links, highlights, CTAs (`#1a56db`) |

Components use named exports only — `import { Button }`, never default imports.

---

## Deployment

Every push to `main` auto-deploys to Vercel. No manual steps required.
Push to any other branch for a preview URL before merging.

Full deployment and DNS runbook: [`docs/runbook.md`](docs/runbook.md)
