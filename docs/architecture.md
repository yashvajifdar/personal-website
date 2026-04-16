# yashvajifdar.com — Architecture & Design Document

## 1. Goals

Two audiences, one site. The site must work simultaneously for:

1. **Director-level hiring managers** at top-tier tech companies — looking for evidence of technical leadership, systems thinking, and organizational scale
2. **Mid-market consulting prospects** ($2M–$50M businesses) — looking for someone who can solve a specific operational analytics problem

The dual-audience problem is solved by **positioning**, not by splitting the site. The same credentials (Amazon Alexa AI, 1.2PB+/day, 250+ person org) are impressive to a hiring manager and credible to a business owner. The framing shifts per page but the substance is the same.

---

## 2. Infrastructure Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
│              types yashvajifdar.com in browser                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │     CLOUDFLARE       │
                │   (free tier)        │
                │  ─────────────────  │
                │  DDoS protection     │
                │  DNS resolution      │
                │  Edge caching        │
                │  SSL termination     │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │       VERCEL         │
                │   (free / hobby)     │
                │  ─────────────────  │
                │  Next.js runtime     │
                │  Static file CDN     │
                │  Edge functions      │
                │  Auto SSL cert       │
                │  Preview deploys     │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │      NEXT.JS 16      │
                │   App Router (RSC)   │
                │  ─────────────────  │
                │  Static pages        │
                │  MDX rendering       │
                │  Tailwind CSS        │
                │  /demos/lumber page  │
                │  /api/lumber proxy   │
                └──────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          │                                 │
┌─────────▼──────────┐       ┌─────────────▼──────────┐
│       GITHUB         │       │   FASTAPI BACKEND       │
│   (source of truth)  │       │   (Railway / Render)    │
│  ─────────────────  │       │  ──────────────────────  │
│  Code repository     │       │  POST /ask               │
│  Push → auto-deploy  │       │  GET  /health            │
└─────────────────────┘       │  AnthropicEngine         │
                               │  metrics/kpis.py         │
                               └─────────────────────────┘

Domain registration: GoDaddy (temporary)
Transfer to: Cloudflare Registrar before June 5, 2026
```

---

## 3. Deploy Pipeline

```text
Developer pushes to main
    │
    ▼
GitHub (source of truth)
    │  webhook trigger
    ▼
Vercel build
    │  npm install
    │  next build (static generation + API routes)
    │  TypeScript check
    ▼
Vercel deployment
    │  new deployment URL created
    │  production alias updated
    ▼
Live at yashvajifdar.com
    │  Cloudflare serves from edge cache where possible
```

Push to any non-main branch creates a preview deployment at a unique URL.

---

## 4. Lumber AI Demo Architecture

The `/demos/lumber` page connects to a separate Python backend. The browser never
touches the backend directly — all requests go through a Next.js API route.

```text
Browser
  │  POST /api/lumber/ask
  ▼
Next.js API route  (app/api/lumber/ask/route.ts)
  │  reads LUMBER_API_URL env var (Vercel)
  │  POST /ask
  ▼
FastAPI backend  (Railway or Render)
  │  app/api.py in lumber-ai-analytics repo
  │  CORS whitelist: yashvajifdar.com, localhost:3000
  ▼
AnthropicEngine  (two-turn tool-use flow)
  │  LLM selects KPI tool → function executes → LLM explains
  ▼
JSON response  { text, follow_ups, chart_spec, chart_data }
  ▼
Next.js chat page renders text + data table + follow-up chips
```

**If `LUMBER_API_URL` is unset:** the proxy returns a friendly "check back soon" message
with HTTP 200, so the page always renders safely without an error state.

---

## 5. Component Decisions & Tradeoffs

### 5.1 Framework: Next.js 16 (App Router)

| Option | Pro | Con |
| --- | --- | --- |
| **Next.js App Router** (chosen) | RSC, static generation, file-based routing, Vercel-native | Learning curve vs Pages Router |
| Next.js Pages Router | Simpler, more familiar | Older pattern, no RSC |
| Remix | Great DX, nested routing | Less Vercel-native |
| Astro | Minimal JS, fast | Less React ecosystem |
| Plain React (CRA/Vite) | Simple | No SSR/SSG, not SEO-friendly |

**Decision:** Next.js App Router. SEO is critical for a personal brand site — static generation gives perfect Lighthouse scores. The Vercel integration is seamless. RSC reduces client-side JS to near zero for mostly-static pages.

---

### 5.2 Hosting: Vercel

| Option | Pro | Con |
| --- | --- | --- |
| **Vercel** (chosen) | Next.js native, free tier, auto-deploy on push, preview URLs, edge CDN | Vendor lock-in |
| Netlify | Similar feature set | Less Next.js-native |
| AWS Amplify | AWS ecosystem | More configuration |
| Fly.io / Railway | Full server control | Overkill for static site |
| Self-hosted VPS | Full control | Ops burden, no auto-deploy |

**Decision:** Vercel free tier. Zero configuration, auto-deploys from GitHub, preview URLs per branch, auto-SSL, global CDN.

---

### 5.3 DNS & CDN: Cloudflare

| Option | Pro | Con |
| --- | --- | --- |
| **Cloudflare** (chosen) | Free DDoS protection, fast DNS, edge caching, future flexibility | One more service to manage |
| Vercel DNS | Simpler — one less service | Less control, no edge caching layer |
| GoDaddy DNS | Already there | Slow propagation, no extras |
| AWS Route 53 | Reliable, programmable | Cost, complexity |

**Decision:** Cloudflare free tier as DNS and CDN in front of Vercel. Adds DDoS protection, faster DNS propagation globally, and an extra caching layer at no cost. Also enables Workers, redirect rules, or rate limiting later without touching the hosting layer.

---

### 5.4 Domain Registrar: GoDaddy → Cloudflare Registrar

| Option | Pro | Con |
| --- | --- | --- |
| **GoDaddy** (current, temporary) | Already registered there | $22.99/yr, cluttered UI, upsells |
| **Cloudflare Registrar** (target) | At-cost pricing (~$10/yr), same dashboard as DNS | Transfer takes 5–7 days |
| Namecheap | Good pricing | Separate from DNS management |

**Decision:** Transfer to Cloudflare Registrar before June 5, 2026 renewal. Saves ~$13/yr, consolidates domain registration and DNS into one dashboard.

**Action required:** Transfer before June 5, 2026. See [`runbook.md`](runbook.md) section 7.

---

### 5.5 Content: MDX Files (no CMS)

| Option | Pro | Con |
| --- | --- | --- |
| **MDX files** (chosen) | Version controlled, no vendor, free, Markdown with components | No WYSIWYG editor, requires a push to publish |
| Contentful / Sanity | Visual editor, content API | Cost, vendor dependency |
| Notion as CMS | Familiar UI | Flaky API, performance |

**Decision:** MDX files in `content/articles/`. Articles are code — they live in git, deploy with the site, and never go down because a CMS vendor has an outage.

---

### 5.6 Styling: Tailwind CSS with Design Tokens

| Option | Pro | Con |
| --- | --- | --- |
| **Tailwind + custom tokens** (chosen) | Utility-first, design system via tokens, no CSS files to maintain | Verbose class lists in JSX |
| CSS Modules | Scoped styles, familiar | More files, more context switching |
| styled-components | Component-scoped | Runtime overhead, SSR complexity |
| Chakra / MUI | Pre-built components | Opinionated design, large bundle |

**Decision:** Tailwind with design tokens in `tailwind.config.ts`. Tokens (`text-ink`, `bg-surface-1`, `text-accent`) create a consistent visual language used across both static pages and the dynamic `/demos/lumber` chat page.

---

### 5.7 Lumber Demo Backend: FastAPI

| Option | Pro | Con |
| --- | --- | --- |
| **FastAPI + Railway** (chosen) | Keeps Python business logic in Python, auto-docs, async-ready | Extra deploy target to maintain |
| Streamlit Cloud embed | No new code | Iframe UX, different design language |
| Rewrite engine in TypeScript | Single codebase | Rewrites 500+ lines of Python analytics code |
| Vercel serverless function | Single deploy | Python cold starts, 10s timeout limit |

**Decision:** FastAPI wrapper in the `lumber-ai-analytics` repo, deployed separately.
The personal website proxies to it via a Next.js API route, keeping the backend URL hidden
from the browser and avoiding CORS issues. If the backend is down or not yet configured,
the proxy returns a graceful fallback message.

---

## 6. What Deliberately Does Not Exist

**No database.** Static site with one dynamic demo page. No user state. No auth.

**No analytics.** No tracking scripts. No cookies. Privacy-first. Vercel provides basic traffic data via their dashboard.

**No CMS.** Articles are version-controlled content, not database rows.

**No component library.** Three custom UI components (Button, Tag, SectionLabel) cover all static page needs. The lumber demo page is a self-contained client component.

---

## 7. Modular Replacement Guide

| Component | Current | Replace with | What changes |
| --- | --- | --- | --- |
| Hosting | Vercel free | Vercel Pro, Netlify, Fly.io | Update deployment target |
| DNS / CDN | Cloudflare free | Same — no reason to change | N/A |
| Domain registrar | GoDaddy | Cloudflare Registrar | Transfer steps in runbook section 7 |
| Content | MDX files | Contentful, Sanity | Replace `lib/articles.ts` with CMS client |
| Contact form | mailto link | Resend, Formspree | Add API route + email service |
| Analytics | None | Vercel Analytics, Plausible | Add script to `layout.tsx` |
| Lumber demo backend | FastAPI on Railway | Any Python host | Update `LUMBER_API_URL` in Vercel |
