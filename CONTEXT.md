# Project Context: Personal Website

**Standards to load:** `standards/frontend.md` + `standards/engineering.md`

---

## What This Is

Personal brand and consulting marketing site at yashvajifdar.com.
Serves two audiences simultaneously: Director-level hiring managers and mid-market consulting prospects.
The dual-audience problem is solved by positioning, not by splitting the site.

## Stack

- **Next.js 16** (App Router) — `app/` directory routing
- **TypeScript** strict mode
- **Tailwind CSS** with custom design tokens (defined in `tailwind.config.ts`)
- **`@tailwindcss/typography`** — prose styling for MDX article bodies
- **`next-mdx-remote` v6** — MDX article rendering via RSC
- **`gray-matter`** — frontmatter parsing for articles
- **`reading-time`** — auto reading time for articles
- **`clsx` + `tailwind-merge`** via `lib/cn.ts` — class merging utility
- **Vercel** — deployment target

## Key Decisions

**Named exports only for components.** No default exports. Consistent with standards/frontend.md.

**Design tokens over raw values.** `text-ink`, `bg-surface-1`, `text-accent` etc. are defined in
`tailwind.config.ts`. Never use raw hex in components.

**async params in Next.js 15+.** `params` is a `Promise<{slug: string}>` — must be awaited.
See `app/writing/[slug]/page.tsx` for the correct pattern.

**MDX via next-mdx-remote v6 RSC.** Page functions that render MDX must be `async`.

**No CMS.** Articles are `.mdx` files in `content/articles/`. Frontmatter drives the index.
Add `published: true` to make an article appear on the site.

## Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Hero, credential anchors, portfolio preview, consulting CTA |
| `/about` | `app/about/page.tsx` | Practitioner story, principles, MIT + Kodi partnerships |
| `/work` | `app/work/page.tsx` | Portfolio projects — Lumber AI, MIT research, upcoming |
| `/services` | `app/services/page.tsx` | Full consulting offer — deliverables, pricing, fit |
| `/writing` | `app/writing/page.tsx` | Article index — published + in-progress |
| `/writing/[slug]` | `app/writing/[slug]/page.tsx` | Dynamic MDX article page |
| `/contact` | `app/contact/page.tsx` | Two paths: consulting inquiry + Director recruiting |

## Shared Components

| Component | File | What it does |
|---|---|---|
| `Nav` | `components/layout/Nav.tsx` | Sticky top nav, active route highlighting |
| `Footer` | `components/layout/Footer.tsx` | Copyright, nav links |
| `Button` | `components/ui/Button.tsx` | primary / secondary / ghost variants; supports `href` and `external` |
| `Tag` | `components/ui/Tag.tsx` | Small pill label for tech tags |
| `SectionLabel` | `components/ui/SectionLabel.tsx` | Small uppercase label above headings |

## Publishing an Article

Create `content/articles/<slug>.mdx` with:

```mdx
---
title: "Title Here"
description: "One sentence for SEO and the index."
date: "2026-06-01"
tags: ["Tag One", "Tag Two"]
published: true
publication: "MIT x Jackfruit.ai"   # optional
coAuthors: ["Name Here"]            # optional
---

Article body in Markdown...
```

## Running Locally

```bash
cd projects/personal-website
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript check
npm run build      # Production build
```

## Deploying to Vercel

```bash
npx vercel          # first time — follow prompts
# After setup: push to main branch → auto-deploys
```

For the custom domain `yashvajifdar.com`:
1. Deploy to Vercel first to get the `.vercel.app` URL
2. In Vercel dashboard: Settings → Domains → Add `yashvajifdar.com`
3. In GoDaddy DNS: update A record to `76.76.21.21` (Vercel IP)
   and CNAME `www` → `cname.vercel-dns.com`
4. SSL is automatic once DNS propagates (up to 48h, usually <1h)

## What's Still Needed

- [ ] OG image (`/public/og-default.png`) — 1200×630px, branded
- [ ] Favicon (`/public/favicon.ico` + `icon.png`)
- [ ] Contact form wired to email service (current: mailto link, fine for now)
- [ ] Vercel deployment + custom domain
- [ ] First published article (MIT x Jackfruit piece — target summer 2026)
- [ ] Live link for Lumber AI project on `/work` page
