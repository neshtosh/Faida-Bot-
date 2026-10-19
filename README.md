# Faida — Kenya's Services Agent

Faida is an agent that handles Kenyans' dealings with government, county, NGO and
SACCO services end to end, with their consent. It finds what they're entitled to,
checks eligibility, applies and fulfils obligations on their behalf (using
browser-use agents where there's no API), tracks every case, and reaches out first
when something new fits them. WhatsApp is its first channel.

See [`docs/PRODUCT.md`](docs/PRODUCT.md) for the full product doc.

## Projects

| Folder | Description |
|--------|-------------|
| [`faida-export/`](faida-export/) | The agent's WhatsApp channel and backend (Node.js + Baileys) |
| [`faida-dashboard/`](faida-dashboard/) | Admin dashboard (Next.js) |

## Docs

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — product vision, delegation model, roadmap
- [`docs/archive/`](docs/archive/) — early build conversations

## Quick start (agent backend)

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
