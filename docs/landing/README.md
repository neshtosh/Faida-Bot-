# Faida public site

Static HTML, CSS and JavaScript with no build step and no dependencies. It lives
in [`faida-dashboard/public/site/`](../../faida-dashboard/public/site/) and is
served by the dashboard's Next.js app, so the whole product (site and admin) is
one Vercel project. Two pages:

| Path | File | For |
|---|---|---|
| `/` | `index.html` | **Organisations** (the main target market): reach, intake, running programmes, feedback, field, reporting |
| `/people` | `people.html` | **People**: "Everything on offer. Faida brings you yours." and one day with Faida |

The admin overview is at `/admin`. Copy for both pages comes from
[`MESSAGING.md`](MESSAGING.md), which maps the opportunity matrix to each audience.

```bash
cd faida-dashboard
npm install
ADMIN_PASSWORD=choose-a-password npm run dev   # http://localhost:3001/        (organisations)
                                               # http://localhost:3001/people  (people)
                                               # http://localhost:3001/admin   (admin, after /login)
```

The pages use absolute asset paths (`/site/...`), so open it through the dev
server rather than as a file.

## Before launch

Set the contact details in `faida-dashboard/public/site/config.js` (`FAIDA_CONFIG`). Both pages read it:

| Setting | What it does |
|---|---|
| `whatsappNumber` | Digits only with country code, e.g. `2547XXXXXXXX`. Until set, the button opens WhatsApp's chooser with a pre-filled message. |
| `orgEmail` | Where "Tell us about your programme" goes (mailto). Until set, it opens a blank email with the subject filled. |
| `orgWhatsapp` | Optional. A WhatsApp number for organisations, digits only. Shown next to the email. |

Once `orgEmail` is set, the organisations page also shows the address (and `orgWhatsapp`, if set) as text under the closing links, because `mailto` does nothing in many webmail setups.

Then:

- Have a native Kiswahili speaker review every `data-sw` string in `index.html`
  and `people.html`, and the strings in `app.js` and `org.js`.
- Check the claims in `BRIEF.md` section 7 are true of the product at launch.
  Both pages sell the finished product, not today's bot (a decision taken on
  7 November 2026). The organisations page adds programme delivery, feedback and
  grievances, field operations and reporting from `docs/PRODUCT_UPDATED2.md`.
- The figures in the organisations page's programme report are illustrative and
  labelled as such. Replace them with a real pilot's figures when there is one.
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
| `/` | the organisations page (`public/site/index.html`, rewritten) | public |
| `/people` | the people page (`public/site/people.html`, rewritten) | public |
| `/site/*` | the pages' CSS, JS and fonts | public |
| `/login` | admin sign-in | public |
| `/admin`, `/benefits`, `/users`, ... | the admin dashboard | admin session |

The Railway bot (`faida-export`) is a separate service and is unchanged.

The page itself weighs about 115 KB (25 KB code gzipped, 90 KB fonts). Fonts are
self-hosted and cached for a year, so no third-party requests are made.

## How it works

- `public/site/index.html` and `people.html`: all copy, English in the markup, Kiswahili in `data-sw`.
- `public/site/styles.css`: shared by both pages. Tokens at the top, then one block
  per section; the organisations page's blocks are at the end.
- `public/site/config.js`: WhatsApp number and organisations email, shared.
- `public/site/app.js` (people): language switch, the receipt (margin slip, chat
  playback, the 9 pm tally), the consent-level selector, and a small scroll driver.
- `public/site/org.js` (organisations): language switch, the programme report that
  prints and is stamped on the title page, chat playback, and the sticky button.
- The language choice is shared between the pages.
- **The EN / SW switch is removed for now (11 November 2026).** Both pages always show
  English, even for visitors with a saved Kiswahili choice or a Kiswahili phone
  setting. The Kiswahili copy is kept in the `data-sw` attributes. To bring the switch
  back, restore the `.lang` markup in both pages (it is in git history) and set
  `LANG_SWITCH = true` in `app.js` and `org.js`.
- With JavaScript off or reduced motion on, everything is visible and static.

Design reasoning, feeling curve and what was and was not verified: [`BRIEF.md`](BRIEF.md).
