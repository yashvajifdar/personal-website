# yashvajifdar.com — Roadmap

What's done, what's next, and why — in priority order.

---

## Done

- [x] Next.js 16 App Router site — 8 pages (home, about, work, services, writing, contact, demos/lumber)
- [x] Tailwind CSS with custom design tokens
- [x] MDX article pipeline with frontmatter, reading time, tags
- [x] Deployed to Vercel (free tier) with auto-deploy on push
- [x] Custom domain `yashvajifdar.com` via Cloudflare DNS → Vercel
- [x] Free SSL via Cloudflare + Vercel
- [x] GitHub repo: github.com/yashvajifdar/personal-website
- [x] YV monogram favicon + tab title
- [x] Profile photo (hero section)
- [x] LinkedIn icon link
- [x] Two-path home page fork (hiring manager vs. consulting)
- [x] Credential strip (1.2PB+, 250+ Person Org, 8+ yrs in Data & AI)
- [x] `/demos/lumber` — Lumber AI Analytics chat page matching site design
- [x] `/api/lumber/ask` — Server-side proxy to FastAPI backend
- [x] Full docs: README, architecture, runbook, roadmap

---

## Near-term (do these first)

### Deploy FastAPI backend → connect lumber demo

**Why:** The `/demos/lumber` page exists and looks great, but without the backend
connected it shows a "check back soon" message instead of live AI responses.
**What:**

1. Deploy `lumber-ai-analytics/app/api.py` to Railway (free tier) — ~1 hour
2. Add `LUMBER_API_URL` to Vercel environment variables — 15 minutes
3. Test end-to-end: ask a question on `/demos/lumber`, get an AI answer

See `docs/runbook.md` section 8 and `lumber-ai-analytics/docs/runbook.md` section 9.

---

### Domain transfer — GoDaddy → Cloudflare Registrar

**Why:** Saves $13/yr, consolidates registration + DNS in one place, eliminates GoDaddy.
**Deadline:** Before June 5, 2026 to avoid $22.99 auto-renewal.
**Effort:** 30 minutes.

See [`docs/runbook.md`](runbook.md) section 7 for exact steps.

---

### OG image

**Why:** When the site is shared on LinkedIn or Slack it shows no preview image. Hurts
credibility for a brand site.
**What:** `/public/og-default.png` (1200×630) — name + tagline on accent blue background.
**Effort:** 1 hour (design + add to `layout.tsx` metadata).

---

### First published article

**Why:** The `/writing` page exists but has no content. An empty writing section signals
inactivity to hiring managers and prospects alike.
**Candidate:** MIT x Jackfruit.ai agentic AI readiness piece — the research is done,
it just needs to be written up and published.
**Effort:** Writing time + 30 minutes to publish.

---

## Medium-term

### Contact form → real email

**Why:** The current contact page uses a `mailto:` link which opens the user's email
client. Some users don't have a mail client configured. A form is more reliable.
**How:** Add a Next.js API route + [Resend](https://resend.com) (free tier, 100 emails/day).
**Effort:** 2–3 hours.

---

### Vercel Analytics

**Why:** Right now there is no visibility into which pages get traffic or where visitors
drop off. Especially useful for measuring the consulting funnel (services → contact).
**How:** Add Vercel Analytics (one `import` in `layout.tsx`). Privacy-friendly, no cookies.
**Effort:** 30 minutes.

---

### MIT x Jackfruit partnership page

**Why:** The research collaboration is a strong credential for both audiences — hiring
managers see thought leadership, prospects see credibility with enterprise AI.
**What:** Dedicated section on `/about` and `/work` documenting the partnership,
framework, and publication status.
**Effort:** 1–2 hours.

---

## Long-term

### Second writing vertical — consulting case studies

Publish 2–3 pieces framed as case studies from real engagements (anonymized).
These serve as sales collateral and SEO for consulting keywords
(e.g. "analytics for building supply companies").

### Kodi Connect integration

Document the Kodi Connect partnership on `/about` and `/work` once there is
shareable output from the engagement.

### Lumber demo chart rendering

The current `/demos/lumber` chat page shows data as a table. Upgrade to Recharts
for bar, line, and pie charts matching the site's design tokens — without adding
Plotly as a browser dependency.

---

## Decisions Log

| Decision | Chosen | Rejected | Reason |
| --- | --- | --- | --- |
| CMS | MDX files | Contentful, Sanity | Version control, no vendor, no cost |
| Hosting | Vercel | Netlify, Fly.io | Next.js native, zero config |
| DNS | Cloudflare | Vercel DNS, GoDaddy DNS | Free CDN + DDoS, future flexibility |
| Domain registrar | GoDaddy (temp) → Cloudflare | Stay on GoDaddy | $13/yr savings, consolidated control |
| Contact | mailto | Form service | Ship fast — upgrade when it matters |
| Analytics | None (for now) | Google Analytics | Privacy, no cookies, ship fast |
| Lumber demo frontend | Next.js page | Streamlit embed | Consistent design language, no iframe |
| Lumber demo backend | FastAPI on Railway | Rewrite in TypeScript | Keep business logic in Python |
| Lumber demo proxy | Next.js API route | Direct browser fetch | Hide backend URL, avoid CORS |
