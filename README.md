# Faida — Kenya's Services Agent

Faida is an agent that captures everything on offer to Kenyans, from every source:
national government, counties and wards, NGOs, foundations, SACCOs, co-operatives,
employers and colleges. Grants, jobs, training, bursaries, cash transfers, health
cover, farm inputs, tenders, unclaimed money, permits and tax. It messages people
when something fits them or falls due, then takes it up end to end with their
consent (using browser-use agents where there's no API, and guiding them where it
has to be USSD, paper or in person) and tracks every case. Organisations list an
offer once and Faida brings it to the people it's for. Nobody has to know what to
ask for. WhatsApp is its first channel.

See [`docs/PRODUCT.md`](docs/PRODUCT.md) for the full product doc.

## Projects

| Folder | Description |
|--------|-------------|
| [`faida-export/`](faida-export/) | The agent's WhatsApp channel and backend (Node.js + Baileys) |
| [`faida-dashboard/`](faida-dashboard/) | Admin dashboard (Next.js) |
| [`faida-landing/`](faida-landing/) | Landing page that sells the finished platform (static HTML) |

## Docs

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — product vision, delegation model, roadmap
- [`docs/OPPORTUNITY-MATRIX.md`](docs/OPPORTUNITY-MATRIX.md) — everything Faida can match and take up, and who offers it
- [`faida-landing/BRIEF.md`](faida-landing/BRIEF.md) — landing page design brief
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
