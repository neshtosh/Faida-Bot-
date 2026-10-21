# Faida landing page

Static, no build step, no dependencies. Open `index.html` or serve the folder.

```bash
cd faida-landing
npx http-server -p 4600      # or: python3 -m http.server 4600
```

## Before launch

Set the contact details at the top of `app.js` (`CONFIG`):

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

**Vercel:** import the repo and leave the project's Root Directory as the repo
root. The root `vercel.json` skips install and build and publishes
`faida-landing/` as the site, so the page is served at `/`. (If you set Root
Directory to `faida-landing` instead, Vercel ignores the root `vercel.json`;
that also works, just without the font caching header.)

**Elsewhere:** any static host, with `faida-landing` as the site root.

Total weight is about 115 KB (25 KB code gzipped, 90 KB fonts). Fonts are
self-hosted, so no third-party requests are made.

## How it works

- `index.html`: all copy, English in the markup, Kiswahili in `data-sw`.
- `styles.css`: tokens at the top, then one block per section.
- `app.js`: language switch, the receipt (margin slip, chat playback, the 9 pm
  tally), the consent-level selector, and a small scroll driver.
- With JavaScript off or reduced motion on, everything is visible and static.

Design reasoning, feeling curve and what was and was not verified: `BRIEF.md`.
