# carlossimoni.com

Carlos Simoni's personal site — separate from his brokerage-provided agent
page. Purpose: rank and convert for "moving to Tampa" / relocation searches,
and capture leads that go straight to Carlos, not through the brokerage. No
IDX/listings search here by design — that lives on his brokerage site.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The contact form works out of the box with
no setup — with no `RESEND_API_KEY` set, a submission just gets logged to
the terminal instead of emailed, so you can test the whole flow before any
accounts exist.

## Before this goes live, you still need to

1. **Buy the domain.** `carlossimoni.com` was confirmed available via
   InstantDomainSearch on 2026-11-03 — register it before someone else does.
2. **Fill in `content/site.ts`** — specifically `brokerageName` and
   `licenseNumber`. Florida real estate advertising rules require the
   supervising brokerage's name on marketing materials, and most states
   require the license number too. The footer shows a visible warning until
   these are filled in.
3. **Add the real photos.** See `IMAGES_NEEDED.md` — every photo slot the
   site uses, with exactly what each one should show. Drop files in
   `public/images/` and set the matching `src` in `content/photos.ts`; the
   placeholder for that slot disappears automatically.
4. **Set up email delivery.** Create a [Resend](https://resend.com) account,
   verify `carlossimoni.com` as a sending domain (needs the domain bought
   first, and a couple of DNS records), then set `RESEND_API_KEY` and
   `CONTACT_FROM_EMAIL` in your deployment's environment variables (copy
   `.env.local.example` → `.env.local` for local testing with a real key).
5. **Deploy.**

## Deploying (Vercel, free tier)

Vercel is free for a site like this — personal/small projects on their
Hobby plan cost nothing, with generous bandwidth for a lightweight marketing
site. You only pay if traffic gets genuinely large or you need team features.

Steps, once you're ready (you don't need the domain yet to deploy — Vercel
gives you a free `*.vercel.app` URL immediately, and you can test on that
before `carlossimoni.com` is bought or pointed at it):

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click "Add
   New Project," and import the repo. It auto-detects Next.js — no config
   needed.
3. Add the environment variables from `.env.local.example` in the project's
   Vercel settings (Settings → Environment Variables).
4. Deploy. You'll get a working `your-project.vercel.app` URL immediately.
5. Once `carlossimoni.com` is purchased: Vercel project Settings → Domains
   → add `carlossimoni.com`, then add the DNS records it shows you at
   wherever you bought the domain (e.g. Namecheap, GoDaddy, Cloudflare). It
   walks you through it — usually just one A record and one CNAME.

## Tech

Next.js 16 (Pages Router) + Tailwind v4 + TypeScript — same stack as the
CMADraft app, kept as a fully separate project/deployment on purpose (see
the marketing plan in CMADraft's `docs/marketing/` for why).
