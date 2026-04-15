# yashvajifdar.com

Personal brand and consulting marketing site.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** with `@tailwindcss/typography`
- **MDX** via `next-mdx-remote` for articles
- **gray-matter** + **reading-time** for article frontmatter
- Deployed on **Vercel**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/                  # Next.js App Router pages
  page.tsx            # Home
  about/page.tsx
  work/page.tsx
  services/page.tsx
  writing/page.tsx
  writing/[slug]/page.tsx   # Dynamic article route
  contact/page.tsx
  layout.tsx          # Root layout (Nav + Footer)
  globals.css

components/
  layout/
    Nav.tsx
    Footer.tsx
  ui/
    Button.tsx
    Tag.tsx
    SectionLabel.tsx

lib/
  articles.ts         # Reads .mdx files from content/articles/
  cn.ts               # Tailwind class merging utility

content/
  articles/           # Drop .mdx files here to publish articles
```

## Publishing an article

Create a file in `content/articles/your-slug.mdx` with the following frontmatter:

```mdx
---
title: "Your Article Title"
description: "One-sentence summary for SEO and the writing index."
date: "2026-06-01"
tags: ["Agentic AI", "Data Engineering"]
published: true
publication: "MIT x Jackfruit.ai"   # optional
coAuthors: ["Jane Smith"]            # optional
---

Your article content here...
```

Set `published: false` to draft without it appearing on the site.

## Deploying to Vercel

```bash
# One-time setup
npx vercel

# Subsequent deploys happen automatically on git push to main
```

## Design system

Colors and typography are defined in `tailwind.config.ts`. The palette:

- `ink` / `ink-muted` / `ink-subtle` — text hierarchy
- `surface-1` through `surface-3` — background tones
- `accent` — action blue (`#1a56db`)

Components are named exports — import with `{ }`, never default imports.
