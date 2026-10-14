# Faida — Kenya Benefits Access Platform

WhatsApp bot + admin dashboard for matching Kenyans to government grants, NGO support, and private sector benefits.

## Projects

| Folder | Description |
|--------|-------------|
| [`faida-export/`](faida-export/) | WhatsApp bot (Node.js + Baileys) |
| [`faida-dashboard/`](faida-dashboard/) | Admin dashboard (Next.js) |

## Quick start (bot)

```bash
cd faida-export
npm install
npm run simulate   # test in terminal
npm test           # run tests
npm start          # connect to WhatsApp
```

See [`faida-export/README.md`](faida-export/README.md) for full documentation.

## Quick start (dashboard)

```bash
cd faida-dashboard
cp .env.local.example .env.local   # set SUPABASE_* and ADMIN_PASSWORD
npm install
npm run dev                        # http://localhost:3001 — sign in with ADMIN_PASSWORD
```

Database setup: [`faida-export/supabase/migrations/README.md`](faida-export/supabase/migrations/README.md).

Built by [Munene](https://munene.dev) · Kenya 🇰🇪
