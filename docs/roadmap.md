# yashvajifdar.com — Roadmap

What's done, what's next, and why — in priority order.

---

## Done

- [x] Next.js 16 App Router site — 7 pages (home, about, work, services, writing, contact)
- [x] Tailwind CSS with custom design tokens
- [x] MDX article pipeline with frontmatter, reading time, tags
- [x] Deployed to Vercel (free tier) with auto-deploy on push
- [x] Custom domain `yashvajifdar.com` via Cloudflare DNS → Vercel
- [x] Free SSL via Cloudflare + Vercel
- [x] GitHub repo: github.com/yashvajifdar/personal-website

---

## Near-term (do these first)

### Domain transfer — GoDaddy → Cloudflare Registrar
**Why:** Saves $13/yr, consolidates registration + DNS in one place, eliminates GoDaddy forever.
**Deadline:** Before June 5, 2026 to avoid $22.99 auto-renewal.
**Effort:** 30 minutes.
See [`docs/runbook.md`](runbook.md) section 7 for exact steps.

---

### Favicon + OG image
**Why:** Right now browser tabs show a blank icon. When the site is shared on LinkedIn or Slack it shows no preview image. Both hurt credibility.
**What:** `/public/favicon.ico` + `/public/icon.png` (512×512), `/public/og-default.png` (1200×630).
**Effort:** 1–2 hours (design + code).

---

### First published article
**Why:** The `/writing` page exists but has no content. An empty writing section signals inactivity.
**Candidate:** MIT x Jackfruit.ai piece — the agentic AI research work is a natural first post.
**Effort:** Writing time + 30 minutes to publish.

---

## Medium-term

### Lumber AI Analytics — embed on `/work`
**Why:** The Lumber AI demo is the strongest consulting proof point. Right now `/work` only describes it. It should link to or embed the live demo.
**Options (in order of effort):**
1. Add a "Live Demo" link to the Streamlit Cloud URL — 5 minutes
2. Rebuild the chat UI as a Next.js page at `yashvajifdar.com/demos/lumber` — 3–5 days
3. Full integration with FastAPI backend — see below

**Recommended path:** Start with option 1 (link), plan option 2 for the next sprint.

---

### Contact form → real email
**Why:** The current contact page uses a `mailto:` link which opens the user's email client. Some users don't have a mail client configured. A form that sends directly is more reliable.
**How:** Add a Next.js API route + [Resend](https://resend.com) (free tier, 100 emails/day).
**Effort:** 2–3 hours.

---

### `/demos/lumber` — Chat UI in Next.js
**Why:** A lumber analytics demo embedded in the personal site looks like a real product, not a prototype. Single domain, consistent design, more impressive in client demos.
**Architecture:**
```
yashvajifdar.com/demos/lumber    → Next.js chat page (React)
        │
        ▼ API call
api.yashvajifdar.com             → FastAPI (Python)
        │  wraps metrics/kpis.py + AI engine
        ▼
lumber.db                        → SQLite (or cloud Postgres)
```
**Hosting for the API:** Railway or Render free tier.
**Effort:** 3–5 days (FastAPI layer + React chat UI).

---

## Long-term

### Second writing vertical — consulting case studies
Publish 2–3 pieces framed as case studies from real engagements (anonymized). These serve as sales collateral and SEO for consulting keywords.

### Analytics
Add [Plausible](https://plausible.io) or Vercel Analytics to understand which pages get traffic and where visitors drop off. Especially useful for the consulting funnel (services → contact conversion rate).

### MIT x Jackfruit partnership page
Dedicated page or section documenting the research partnership, publications, and outcomes. Serves both audiences — hiring managers see thought leadership, prospects see credibility.

### Kodi Connect integration
Document the Kodi Connect partnership on `/about` and `/work` once there is shareable output.

---

## Decisions log

| Decision | Chosen | Rejected | Reason |
|----------|--------|----------|--------|
| CMS | MDX files | Contentful, Sanity | Version control, no vendor, no cost |
| Hosting | Vercel | Netlify, Fly.io | Next.js native, zero config |
| DNS | Cloudflare | Vercel DNS, GoDaddy DNS | Free CDN + DDoS, future flexibility |
| Domain registrar | GoDaddy (temp) → Cloudflare | Stay on GoDaddy | $13/yr savings, consolidated control |
| Contact | mailto | Form service | Ship fast — upgrade when it matters |
| Analytics | None (for now) | Google Analytics | Privacy, no cookies, ship fast |
