# Faida landing page

Static HTML, CSS and JavaScript with no build step and no dependencies. It lives
in [`faida-dashboard/public/site/`](../../faida-dashboard/public/site/) and is
served at `/` by the dashboard's Next.js app, so the whole product (landing page
and admin) is one Vercel project. The admin overview is at `/admin`.

```bash
cd faida-dashboard
npm install
ADMIN_PASSWORD=choose-a-password npm run dev   # http://localhost:3001/  (landing)
                                               # http://localhost:3001/admin (admin, after /login)
```

The page uses absolute asset paths (`/site/...`), so open it through the dev
server rather than as a file.

## Before launch

Set the contact details at the top of `faida-dashboard/public/site/app.js` (`CONFIG`):

| Setting | What it does |
|---|---|
| `whatsappNumber` | Digits only with country code, e.g. `2547XXXXXXXX`. Until set, the button opens WhatsApp's chooser with a pre-filled message. |
| `orgEmail` | Where "Talk to us" goes (mailto). Until set, it opens a blank email with the subject filled. |

Then:

- Have a native Kiswahili speaker review every `data-sw` string in `index.html`
  and the strings in `app.js`.
- Check the claims in `BRIEF.md` section 7 are true of the product at launch. This page sells the finished product, not today's bot.
- Add a privacy page and link it from the footer.

## Deploy

One Vercel project for everything:

1. Import `neshtosh/Faida-Bot-`, branch `main`.
2. Set **Root Directory** to `faida-dashboard` (Vercel detects Next.js). Leave
   "Include files outside the root directory" on, because without Supabase the
   dashboard reads `../faida-export/src/db/benefits.json`.
3. Add the variables from `faida-dashboard/.env.local.example`
   (`ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, ...).

Routing, from `next.config.js` and `middleware.ts`:

| Path | What it serves | Auth |
|---|---|---|
| `/` | the landing page (`public/site/index.html`, rewritten) | public |
| `/site/*` | the landing page's CSS, JS and fonts | public |
| `/login` | admin sign-in | public |
| `/admin`, `/benefits`, `/users`, ... | the admin dashboard | admin session |

The Railway bot (`faida-export`) is a separate service and is unchanged.

The page itself weighs about 115 KB (25 KB code gzipped, 90 KB fonts). Fonts are
self-hosted and cached for a year, so no third-party requests are made.

## How it works

- `public/site/index.html`: all copy, English in the markup, Kiswahili in `data-sw`.
- `public/site/styles.css`: tokens at the top, then one block per section.
- `public/site/app.js`: language switch, the receipt (margin slip, chat playback, the 9 pm
  tally), the consent-level selector, and a small scroll driver.
- With JavaScript off or reduced motion on, everything is visible and static.

Design reasoning, feeling curve and what was and was not verified: [`BRIEF.md`](BRIEF.md).
