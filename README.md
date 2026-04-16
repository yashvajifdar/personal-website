# yashvajifdar.com — Personal Website

Personal brand and consulting marketing site serving two audiences simultaneously:
Director-level hiring managers and mid-market analytics consulting prospects.

Live at **[yashvajifdar.com](https://yashvajifdar.com)**

---

## Stack

| Layer | Technology | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | RSC, static generation, Vercel-native |
| Language | TypeScript strict | Catches errors at build time, not runtime |
| Styling | Tailwind CSS + design tokens | Consistent visual language without a component library |
| Content | MDX files in `content/articles/` | No CMS dependency, version-controlled articles |
| Hosting | Vercel (free tier) | Zero-config Next.js deploy, auto SSL, global CDN |
| DNS / CDN | Cloudflare (free tier) | DDoS protection, caching, fast DNS |
| Domain registrar | GoDaddy → Cloudflare (transfer before June 5, 2026) | Saves ~$13/yr |

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
npm run build      # Production build — catches errors Vercel would catch
npm run lint       # ESLint
```

To test the Lumber AI demo page locally, add a `.env.local` file:

```bash
LUMBER_API_URL=http://localhost:8001
```

Then start the FastAPI backend in the `lumber-ai-analytics` project (see its runbook).

---

## Project Structure

```text
personal-website/
│
├── app/                               # Next.js App Router pages
│   ├── page.tsx                       # / — Hero, two-path fork, credential strip, portfolio preview
│   ├── about/page.tsx                 # /about — Story, principles, partnerships
│   ├── work/page.tsx                  # /work — Portfolio projects with demo links
│   ├── services/page.tsx              # /services — Consulting offer, pricing, fit
│   ├── writing/page.tsx               # /writing — Article index
│   ├── writing/[slug]/page.tsx        # /writing/:slug — Dynamic MDX article
│   ├── contact/page.tsx               # /contact — Consulting + recruiting paths
│   ├── demos/
│   │   └── lumber/page.tsx            # /demos/lumber — Lumber AI chat demo
│   ├── api/
│   │   └── lumber/ask/route.ts        # /api/lumber/ask — Server-side proxy to FastAPI
│   ├── layout.tsx                     # Root layout — Nav, Footer, global metadata
│   └── globals.css                    # Global styles, Tailwind base
│
├── components/
│   ├── layout/
│   │   ├── Nav.tsx                    # Sticky top nav with active route highlighting
│   │   └── Footer.tsx
│   └── ui/
│       ├── Button.tsx                 # primary / secondary / ghost variants
│       ├── Tag.tsx                    # Small pill label for tech tags
│       └── SectionLabel.tsx           # Uppercase label above section headings
│
├── content/
│   └── articles/                      # MDX files — set published: true to go live
│
├── lib/
│   ├── articles.ts                    # Frontmatter parsing, article index builder
│   └── cn.ts                          # clsx + tailwind-merge utility
│
├── docs/
│   ├── architecture.md                # Stack decisions, tradeoff tables, infrastructure diagram
│   ├── runbook.md                     # Deploy, DNS, domain transfer, lumber demo setup
│   └── roadmap.md                     # What's done, what's next
│
├── public/                            # Static assets (favicon, profile photo, OG image)
├── tailwind.config.ts                 # Design tokens — colors, fonts, spacing
├── next.config.mjs                    # Next.js config
└── tsconfig.json                      # TypeScript strict mode
```

---

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Hero, two-path fork (hiring manager vs consulting), credential strip, portfolio preview |
| `/about` | Practitioner story, principles, MIT + Kodi partnerships |
| `/work` | Portfolio — Lumber AI Analytics (with demo link), MIT research |
| `/services` | Consulting offer — deliverables, pricing, who it's for |
| `/writing` | Article index — published MDX pieces |
| `/writing/[slug]` | Individual MDX article with typography |
| `/contact` | Two paths: consulting inquiry + Director recruiting |
| `/demos/lumber` | Lumber AI Analytics live chat demo |

---

## Lumber AI Demo (`/demos/lumber`)

The demo page calls a Python analytics backend and renders responses in the site's
design language — same tokens, same card style, same feel as the rest of the site.

**How it works:**

```text
Browser → POST /api/lumber/ask  (Next.js API route — server-side)
       → POST /ask              (FastAPI backend at LUMBER_API_URL)
       → AnthropicEngine.ask()  (two-turn tool-use flow)
       → JSON response          (text, follow_ups, chart_data)
       → Chat UI renders result
```

**Environment variable required in Vercel:**

```text
LUMBER_API_URL = https://your-fastapi-app.railway.app
```

If `LUMBER_API_URL` is not set, the page shows a friendly "check back soon" message
instead of an error — so the page is always safe to render.

See [`docs/runbook.md`](docs/runbook.md) section 7 for full deployment steps.

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
| --- | --- |
| `ink` / `ink-muted` / `ink-subtle` | Text hierarchy |
| `surface-1` through `surface-3` | Background tones |
| `accent` | Links, highlights, CTAs (`#1a56db`) |

Components use named exports only — `import { Button }`, never default imports.
Pages use default exports (Next.js convention).

---

## Deployment

Every push to `main` auto-deploys to Vercel. No manual steps required.
Push to any other branch for a preview URL before merging.

Full deployment, DNS, and domain transfer runbook: [`docs/runbook.md`](docs/runbook.md)
