# 🌿 Faida — Kenya Benefits Access Platform

> A WhatsApp bot that connects every Kenyan to the government grants, NGO support,
> and private sector benefits they qualify for — in minutes.

Built by [Munene](https://munene.dev)

---

## What It Does

A Kenyan texts the bot. The bot asks 6 questions. The bot returns every benefit
they qualify for — with exact steps to apply. No website needed. No app to download.
Works on any phone with WhatsApp.

**Benefits covered:**
- 💰 Financial — Hustler Fund, YEDF, Uwezo, AGPO, KIEP, WIDU, Ward Grants
- 🏥 Health — SHA registration, disability support
- 💼 Employment — Google Hustle Academy, NYS, training funds
- ⚖️ Legal — LSK Legal Aid, Judiciary pro bono services
- 🏠 Housing — Boma Yangu affordable housing

---

## Project Structure

```
faida/
├── src/
│   ├── bot/
│   │   ├── index.js       ← WhatsApp connection (Baileys)
│   │   ├── handler.js     ← Conversation flow & message logic
│   │   ├── simulate.js    ← Test bot in terminal (no WhatsApp needed)
│   │   └── test.js        ← Automated tests
│   ├── db/
│   │   └── benefits.js    ← All Kenya benefits database
│   └── lib/
│       ├── eligibility.js ← Matching engine
│       ├── session.js     ← User session manager
│       ├── reminders.js   ← Deadline reminder scheduler
│       ├── logger.js      ← Structured logging (pino)
│       ├── env.js         ← Startup env validation
│       └── health.js      ← HTTP health check for Railway
├── Procfile               ← Railway/Heroku process file
├── railway.json           ← Railway deploy config
├── supabase/schema.sql    ← Database schema (when ready)
├── .env.example           ← Environment variables template
├── .auth/                 ← WhatsApp session (auto-created, gitignore this)
└── package.json
```

---

## Quick Start

### 1. Prerequisites
Make sure you have Node.js installed (v18+):
```bash
node --version   # should show v18.x or higher
```

### 2. Clone & install
```bash
git clone https://github.com/yourusername/faida.git
cd faida
npm install
```

### 3. Set up environment
```bash
cp .env.example .env
# Edit .env with your values (most can stay blank for local dev)
```

### 4. Test in terminal first (no WhatsApp needed)
```bash
npm run simulate
```
This opens an interactive terminal chat. Type messages as if you were a WhatsApp user.
Test the full 6-question flow and see your matched benefits.

### 5. Run automated tests
```bash
npm test
```
All 17 tests should pass.

### 6. Connect to WhatsApp
```bash
npm start
```
A QR code will appear in the terminal **and** as a shareable link:

```
http://localhost:3000/qr
```

Open that link on your phone to scan easily.

**To scan it:**
1. Open WhatsApp on your phone
2. Go to **Settings → Linked Devices → Link a Device**
3. Scan the QR code

The bot is now live. Text it from any number to test.

---

## Development Mode (auto-restart on file changes)
```bash
npm run dev
```

---

## How the Conversation Flow Works

```
User: "Hi"
  → Bot: Welcome + asks age

User: "25"
  → Bot: Asks gender

User: "2" (female)
  → Bot: Asks county

User: "Nairobi"
  → Bot: Asks employment status

User: "2" (business owner)
  → Bot: Asks about disability

User: "2" (no)
  → Bot: Asks which benefit categories

User: "1,3" (Financial + Employment)
  → Bot: Returns matched benefits with scores

User: "D1"
  → Bot: Full application details for benefit #1

User: "MENU"
  → Bot: Main menu

User: "SHARE"
  → Bot: Share message to forward
```

---

## Adding New Benefits

Open `src/db/benefits.js` and add a new object to the array:

```javascript
{
  id: "unique-id",
  name: "Benefit Name",
  provider: "Organisation Name",
  category: "financial",          // financial | health | employment | legal | housing
  emoji: "💰",
  description: "Plain-language description...",
  amount: "Ksh 50,000",
  howToApply: "1. Step one\n2. Step two\n3. Step three",
  documents: "National ID, KRA PIN...",
  deadline: "Rolling",
  link: "https://example.go.ke",
  eligibility: {
    minAge: 18,
    maxAge: 35,
    gender: "any",               // "any" | "male" | "female"
    employed: "any",             // "any" | true | false
    businessOwner: "any",        // "any" | true | false
    disability: "any",           // "any" | true | false
    counties: ["any"],           // ["any"] or ["Nairobi", "Kisumu", ...]
    sectors: ["any"],
    groupRequired: false,
  },
},
```

Then run `npm test` to make sure everything still passes.

---

## Deployment (Railway)

Railway is the recommended way to run Faida 24/7. The bot includes an HTTP health check on `/health` so Railway knows the process is alive.

### Prerequisites

- A [Railway](https://railway.app) account (free tier works)
- A GitHub repo with this project pushed (or deploy via Railway CLI)
- Node.js 22+ (required by Baileys and Supabase; set via `.nvmrc` / `nixpacks.toml`)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial Faida bot"
git remote add origin https://github.com/yourusername/faida.git
git push -u origin main
```

### Step 2 — Create a Railway project

1. Go to [railway.app](https://railway.app) and click **New Project**
2. Choose **Deploy from GitHub repo** and select your `faida` repository
3. Set **Root Directory** to `faida-export`
4. Railway will detect `Procfile` and `railway.json` automatically

### Step 2b — Generate a public domain (required for QR link)

Before the shareable QR link works, you must expose the service:

1. Open your Railway service → **Settings** → **Networking**
2. Under **Public Networking**, click **Generate Domain**
3. Copy the domain (e.g. `faida-bot-production.up.railway.app`)
4. Optional but recommended: add variable `PUBLIC_URL=https://faida-bot-production.up.railway.app`
5. **Redeploy** the service

Your QR scan page will then be at:

```
https://YOUR-DOMAIN.up.railway.app/qr
```

> `localhost` links never work on Railway — they only work on your own computer during local dev.

### Step 3 — Set environment variables

In Railway: **Project → your service → Variables → Raw Editor**, add:

| Variable | Required | Example |
|----------|----------|---------|
| `NODE_ENV` | Yes | `production` |
| `FAIDA_HASH_SALT` | Yes | `a-long-random-string-here` |
| `LOG_LEVEL` | No | `info` |
| `BOT_NAME` | No | `Faida` |
| `SUPABASE_URL` | No* | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | No* | your anon key |

\* If you set one Supabase variable, you must set both.

`PORT` is set automatically by Railway — do not override it.

The bot **will refuse to start** in production if `FAIDA_HASH_SALT` is missing or still set to the example default.

### Step 4 — Deploy

Railway deploys automatically on every push to `main`. You can also deploy manually:

```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

### Step 5 — Verify the health check

Once deployed, open your Railway service URL:

```
https://your-service.up.railway.app/health
```

You should see:

```json
{"status":"ok","service":"faida-bot","bot":"connected","timestamp":"..."}
```

Railway uses this endpoint (`healthcheckPath: /health` in `railway.json`) to monitor uptime.

### Step 6 — Connect WhatsApp

Baileys uses QR scan to link WhatsApp. On Railway:

1. Open **Deployments → View Logs**
2. Look for the **shareable link**, e.g. `https://your-service.up.railway.app/qr`
3. Open that link on your phone (or share it with someone who needs to scan)
4. Scan the QR on the page: **WhatsApp → Settings → Linked Devices → Link a Device**

The terminal still shows an ASCII QR as a backup. The web page auto-refreshes every 15 seconds while waiting for a scan.

Direct image link (optional): `https://your-service.up.railway.app/qr.png`

> **Important:** Railway containers are ephemeral. If the container restarts, you may need to re-scan unless you persist the `.auth` folder using a [Railway Volume](https://docs.railway.app/reference/volumes) mounted at `/app/.auth`.

To add a volume:
1. Railway → your service → **Volumes** → Add Volume
2. Mount path: `/app/.auth`
3. Redeploy

### Viewing logs in production

Logs are written to `logs/faida.log` inside the container with daily rotation. View them via Railway's log viewer, or set `LOG_LEVEL=info` for structured JSON in stdout.

---

## Other Deployment Options

### VPS (DigitalOcean, Linode, etc.)
```bash
git clone your-repo
cd faida
npm install
cp .env.example .env
# Edit .env — set NODE_ENV=production and FAIDA_HASH_SALT

npm install -g pm2
pm2 start src/bot/index.js --name faida
pm2 save
pm2 startup
```

### WhatsApp Cloud API (verified business number)
For a production-grade setup with Meta's official API:
1. Create a Meta Business account at [developers.facebook.com](https://developers.facebook.com)
2. Set up a WhatsApp Business app
3. Add `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` to `.env`
4. Update `src/bot/index.js` to use the Cloud API webhook pattern

---

## Roadmap

- [x] Benefits database (30 Kenya benefits)
- [x] Eligibility matching engine
- [x] 6-question conversation flow (English + Kiswahili)
- [x] WhatsApp connection (Baileys)
- [x] Session management (in-memory + Supabase-ready)
- [x] Terminal simulator for testing
- [x] Automated test suite
- [x] Deadline reminder system
- [x] Structured logging (pino)
- [x] Railway deployment setup
- [ ] Supabase integration (persist sessions + analytics) — database setup last
- [ ] Web dashboard (Next.js) for admins to manage benefits
- [ ] WhatsApp Cloud API migration (verified business number)
- [ ] Claude API integration (smarter matching)
- [ ] SMS fallback (Africa's Talking) for non-WhatsApp users
- [ ] B2B white-label API for SACCOs

---

## Built With

- [Baileys](https://github.com/WhiskeySockets/Baileys) — WhatsApp Web API
- Node.js — Runtime
- Supabase — Database (coming)
- Next.js — Web dashboard (coming)

---

**munene.dev** · Built in Kenya 🇰🇪
