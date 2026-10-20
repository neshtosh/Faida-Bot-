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
- Check the claims in `BRIEF.md` section 7 are true of the product at launch.
- Add a privacy page and link it from the footer.

## Deploy

Any static host. On Vercel or Netlify set the root directory to `faida-landing`.
Total weight is about 135 KB (21 KB code gzipped, 114 KB fonts). Fonts are
self-hosted, so no third-party requests are made.

## How it works

- `index.html`: all copy, English in the markup, Kiswahili in `data-sw`.
- `styles.css`: tokens at the top, then one block per section.
- `app.js`: language switch, the bridge (real rules over example data), the hero
  art, and a small scroll driver. Pinned sections publish `--p` (0 to 1).
- Pinned sections turn into normal flow when JavaScript is off, when the user
  prefers reduced motion, and on short screens.

The bridge's rules mirror `faida-export/src/db/benefits.json` in simplified
form. If that catalogue changes, update `PROGS` in `app.js`.

Design reasoning, feeling curve and what was and was not verified: `BRIEF.md`.
