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
┌─────────▼──────────┐       ┌──────────────────────────┐
│       GITHUB         │       │   FASTAPI BACKEND         │
│   (source of truth)  │       │   Render (free tier)      │
│  ─────────────────  │       │  ────────────────────────  │
│  Code repository     │       │  POST /ask                 │
│  Push → auto-deploy  │       │  GET  /health              │
│  (personal-website)  │       │  AnthropicEngine           │
│  (lumber-ai-analytics│       │  metrics/kpis.py           │
│   — Render deploys   │       │  data/lumber.db (SQLite)   │
│     from this too)   │       │                            │
└─────────────────────┘       │  Auto-sleeps after 15 min  │
                               │  idle → $0 cost at rest    │
                               └──────────────────────────┘

Domain registration: GoDaddy (temporary)
Transfer to: Cloudflare Registrar before June 5, 2026

Note on the two-host architecture:
  Vercel hosts everything a Next.js app does well: static pages, RSC, API proxy routes.
  Render hosts the Python backend because Vercel serverless functions cannot generate
  or persist files — and the analytics engine requires SQLite on disk.
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
Vercel — Next.js API route  (app/api/lumber/ask/route.ts)
  │  Server-side only — browser never touches Render directly
  │  Reads LUMBER_API_URL env var (set in Vercel dashboard)
  │  30-second timeout (handles Render cold starts gracefully)
  │  POST /ask
  ▼
Render — FastAPI backend  (app/api.py in lumber-ai-analytics repo)
  │  Free tier: auto-sleeps after 15 min idle, wakes on request
  │  CORS whitelist: yashvajifdar.com, localhost:3000
  │  Reads ANTHROPIC_API_KEY from Render env vars
  ▼
AnthropicEngine  (two-turn tool-use flow)
  │  Turn 1: LLM selects KPI tool + parameters
  │  Turn 2: LLM reads data, writes plain-English explanation
  ▼
metrics/kpis.py  →  data/lumber.db  (SQLite, generated at Render build time)
  ▼
JSON response  { text, follow_ups, chart_spec, chart_data }
  ▼
Vercel — Next.js chat page renders text + data table + follow-up chips
```

**Why the proxy route exists (not direct browser → Render):**

- Hides the Render URL from the browser (no scraping, no abuse)
- Handles CORS centrally — the browser only ever talks to its own Vercel origin
- Lets us swap the backend URL in one Vercel env var without touching any code

**If `LUMBER_API_URL` is unset:** the proxy returns a friendly "check back soon" message
with HTTP 200, so the page always renders safely — no error state shown to visitors.

**Cold start behavior:** Render free tier sleeps after 15 minutes of no traffic. The first
request after sleep takes 30–60 seconds. The proxy's 30-second timeout is intentionally set
to handle this — the request will succeed, just slowly. Subsequent requests are fast (~5–10s
for the two-turn LLM flow).

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

### 5.7 Lumber Demo Backend: FastAPI on Render

| Option | Pro | Con |
| --- | --- | --- |
| **FastAPI on Render free tier** (chosen) | Auto-sleeps when idle ($0 cost at rest), Python-native, no code rewrite | Cold start 30–60s after idle; extra deploy target |
| Railway | Same Python stack | Always-on containers — continuous billing even at zero traffic |
| Vercel serverless (Python) | Single deploy target | Vercel functions use a read-only filesystem — cannot generate or persist `data/lumber.db` at runtime |
| Streamlit Cloud embed | No new code | Iframe UX, different design language, no control over styling |
| Rewrite engine in TypeScript | Single codebase, one deploy | Rewrites 500+ lines of Python analytics + AI logic |

**Decision:** FastAPI in the `lumber-ai-analytics` repo, deployed to Render free tier.

Why Render over Railway: Railway runs containers 24/7 regardless of traffic — continuous
compute cost for a demo that may go days without a visitor. Render free tier auto-sleeps
after 15 minutes of inactivity and wakes on the next request. The cold start (30–60s) is
acceptable for a demo; at production client scale, we'd upgrade to a paid tier or persistent host.

Why not Vercel serverless: The analytics engine generates and reads `data/lumber.db` — a
SQLite file built at deploy time. Vercel serverless functions run in a read-only filesystem
with no persistence between invocations. SQLite requires a writable, persistent disk.

Why a proxy route instead of direct browser → Render: see section 4 above.

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
| Lumber demo backend | FastAPI on Render (free) | Any Python host with persistent filesystem | Update `LUMBER_API_URL` in Vercel |
