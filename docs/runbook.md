# yashvajifdar.com — Operations Runbook

Step-by-step procedures for every operational task on this site.
If something breaks or needs changing, this is the first place to look.

---

## 1. Normal Deploy (push to main)

This is the only deploy flow you should ever need.

```bash
cd projects/personal-website
git add <files>
git commit -m "your message"
git push origin main
```

Vercel detects the push and auto-deploys within ~60 seconds. No manual action required.

**To verify:** go to [vercel.com/dashboard](https://vercel.com/dashboard) → `personal-website` → check the latest deployment shows "Ready".

---

## 2. Preview a Change Before Going Live

Push to any branch other than `main`:

```bash
git checkout -b my-feature
git push origin my-feature
```

Vercel creates a unique preview URL like `personal-website-abc123-yashvajifdar.vercel.app`. Share it or review it, then merge to `main` to go live.

---

## 3. Adding or Editing a Page

Pages live in `app/`. Each folder is a route:

```
app/about/page.tsx  →  yashvajifdar.com/about
app/work/page.tsx   →  yashvajifdar.com/work
```

To add a new page:
1. Create `app/<route>/page.tsx`
2. Export a named `Page` function (no default exports)
3. Add a link in `components/layout/Nav.tsx` if it should appear in the nav
4. Push to `main`

---

## 4. Publishing an Article

1. Create `content/articles/<slug>.mdx` with required frontmatter:

```mdx
---
title: "Your Title"
description: "One sentence for SEO."
date: "2026-06-01"
tags: ["Tag"]
published: true
---

Article body...
```

2. Push to `main` — article appears on `/writing` and at `/writing/<slug>` automatically.

To draft without publishing: set `published: false`. The file exists in git but won't appear on the site.

---

## 5. Updating DNS Records

DNS is managed in **Cloudflare**. Log in at [dash.cloudflare.com](https://dash.cloudflare.com) → `yashvajifdar.com` → **DNS**.

**Current records:**

| Type | Name | Content | Purpose |
|------|------|---------|---------|
| A | `@` | `76.76.21.21` | Root domain → Vercel |
| CNAME | `www` | `cname.vercel-dns.com` | www → Vercel |

**To add a subdomain** (e.g. `lumber.yashvajifdar.com`):
1. In Cloudflare DNS → Add record
2. Type: `CNAME`, Name: `lumber`, Content: `<target URL>`
3. Proxy status: Proxied (orange cloud)
4. Save — propagates within minutes

**Do not touch** the NS records (jade/ridge) — those point to Cloudflare itself.

---

## 6. Adding a Custom Domain to Vercel

If you add a subdomain or a new domain:
1. Go to [vercel.com](https://vercel.com) → `personal-website` → **Settings → Domains**
2. Add the domain
3. Add the corresponding DNS record in Cloudflare (see section 5)
4. Vercel will show "Valid Configuration" once DNS propagates

---

## 7. Domain Registrar Transfer (GoDaddy → Cloudflare) — Due Before June 5, 2026

The domain `yashvajifdar.com` is currently registered at GoDaddy and auto-renews June 5, 2026 at $22.99. Transfer to Cloudflare Registrar costs ~$10 and consolidates registration + DNS.

**Steps:**
1. Log into [godaddy.com](https://godaddy.com) → Domains → `yashvajifdar.com` → **Registration Settings**
2. Unlock the domain (turn off Transfer Lock)
3. Get the authorization (EPP) code — GoDaddy will email it
4. In Cloudflare: **Domain Registration → Transfer Domains** → enter `yashvajifdar.com` + auth code
5. Pay ~$10 (this is the next year's renewal)
6. Check email — GoDaddy sends a confirmation, approve it to speed transfer to ~24h
7. Once transferred: GoDaddy has no further role

**Do this at least 2 weeks before June 5, 2026** to avoid the $22.99 auto-charge.

---

## 8. If the Site Goes Down

Check in this order:

**Step 1 — Is it Vercel?**
Go to [vercel.com/dashboard](https://vercel.com/dashboard) → `personal-website`. Is the latest deployment "Ready"? If it shows "Error", click it to see the build logs.

**Step 2 — Is it DNS?**
Go to [dash.cloudflare.com](https://dash.cloudflare.com) → `yashvajifdar.com` → DNS. Verify the A record (`76.76.21.21`) and CNAME (`cname.vercel-dns.com`) are still there.

**Step 3 — Is it Cloudflare?**
Check [cloudflarestatus.com](https://www.cloudflarestatus.com) for an incident.

**Step 4 — Test with DNS bypassed**
Visit the Vercel URL directly: `personal-website-mu-seven-42.vercel.app`. If that works, the issue is DNS not the app.

---

## 9. Updating the Node.js Version on Vercel

The project requires Node >=20 (set in `package.json` under `engines`). If Vercel uses an older version:
1. Go to Vercel → `personal-website` → **Settings → General**
2. Scroll to **Node.js Version** → select 20.x or later
3. Redeploy

---

## 10. Environment Variables

This site has no environment variables today — it is entirely static.

If a contact form or API integration is added:
1. Go to Vercel → `personal-website` → **Settings → Environment Variables**
2. Add the variable for Production (and optionally Preview)
3. Redeploy

Never commit secrets to the repo. Never put API keys in `next.config.mjs`.
