# Faida Supabase Setup — Step-by-Step

Follow these steps **exactly in order**. Each migration is a separate file in
`faida-export/supabase/migrations/`.

---

## 🧪 Prerequisites

1. You already created a Supabase project and connected it to this repo's
   IDE integration. ✅
2. Open your project in [supabase.com/dashboard](https://supabase.com/dashboard)
   → click the project → **SQL Editor** (left sidebar) → **New query**.

---

## 🗂️ Migration run order

Open the SQL Editor and paste the contents of each file **ONE AT A TIME**,
in this order, clicking **Run** (▶) after each one. If a file returns
success, move on. If it errors, STOP — do not proceed to the next file.

| Step | File                                               | What it does                                       |
|------|----------------------------------------------------|----------------------------------------------------|
| 1    | [00_init.sql](./00_init.sql)                       | Creates all tables & enums                         |
| 2    | [01_indexes.sql](./01_indexes.sql)                 | Adds performance indexes                           |
| 3    | [02_rls.sql](./02_rls.sql)                         | Secures tables with Row Level Security             |
| 4    | [03_seed_benefits.sql](./03_seed_benefits.sql)     | Populates `benefits` with the 30 Kenyan benefits   |
| 5    | [04_views.sql](./04_views.sql)                     | Creates dashboard analytics views                 |

**Tip:** If SQL Editor shows "1 query run" with no errors, you're good. For
`03_seed_benefits.sql` the output of the last block is a NOTICE with the
final count — it should be `30`.

---

## ✅ Verify the schema

After running all 5 migrations, paste this check query into the SQL Editor
and run it. Confirm you see `7 tables`, `6 views`, `30 benefits`:

```sql
SELECT 'tables'   AS kind, COUNT(*) AS n
  FROM information_schema.tables
 WHERE table_schema = 'public'
   AND table_type   = 'BASE TABLE'
   AND table_name   NOT IN ('pg_stat_statements', 'pg_buffercache')
UNION ALL
SELECT 'views'    AS kind, COUNT(*) AS n
  FROM information_schema.views
 WHERE table_schema = 'public'
UNION ALL
SELECT 'benefits' AS kind, COUNT(*) AS n
  FROM benefits;
```

Expected output (approximately — your `tables` count may be 8-10 if Supabase
has extensions installed, the important ones are `> 5`):

```
tables   |  7
views    |  6
benefits | 30
```

---

## 🔑 Get your API keys

Once schema is done, go to:
**Supabase Dashboard → Project Settings → API** (🔧 icon on the left sidebar).

Copy these three values. You'll paste them into two `.env` files below.

| Value              | Where in Settings → API                                        |
|--------------------|-----------------------------------------------------------------|
| Project URL        | **General → Project URL** (e.g. `https://xxx.supabase.co`) |
| `anon` public key  | **Project API keys → `anon` `public`**                     |
| `service_role` key | **Project API keys → `service_role` `secret`** — click **Reveal** first |

⚠️ **Critical security rule:** NEVER paste `service_role` into client code.
It bypasses Row Level Security. In Faida it only lives in:
  - `faida-export/.env` (bot, Node.js backend)
  - `faida-dashboard/.env.local` (dashboard, server-side route handlers only)

---

## 📝 Fill in `.env` files

### 1) Bot — `faida-export/.env`

Copy `faida-export/.env.example` → `faida-export/.env` and fill:

```
# ── Supabase ───────────────────────────────────────────
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...<anon key>
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...<service_role key>

# Must be a RANDOM string, at least 32 chars. Same as before,
# or generate a new one with:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
FAIDA_HASH_SALT=change-this-to-a-random-string
```

### 2) Dashboard — `faida-dashboard/.env.local`

Create the file and fill:

```
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...<service_role key>
FAIDA_HASH_SALT=SAME_VALUE_AS_IN_BOT_DOT_ENV
```

---

## 🎯 Test the connection from the bot

```bash
cd faida-export

# Confirm Supabase is reachable and sees 30 benefits:
node -e "
  require('dotenv').config();
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('FAIL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is empty. Check faida-export/.env');
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });
  sb.from('benefits').select('id', { count: 'exact', head: true })
    .then(r => {
      if (r.error) {
        console.error('Supabase error — code:', r.error.code, '| msg:', r.error.message);
        if (r.error.code === 'PGRST125') console.error('HINT: benefits table does not exist yet. Run the 5 SQL migration scripts in SQL Editor.');
        process.exit(2);
      }
      console.log('Supabase OK. Benefit count:', r.count);
    })
    .catch(e => console.error('FAIL:', e.message));
"
```

Expected output: `Supabase OK. Benefit count: 30`

---

## 🔁 Re-running / rolling back

All migrations are **idempotent** — safe to re-run (they use
`IF NOT EXISTS`, `ON CONFLICT`, and `CREATE OR REPLACE VIEW`).

- **Need to re-seed benefits?** Re-run `03_seed_benefits.sql`. The upsert
  overwrites all 30 benefits with the catalog from the SQL file.
- **Need to clear all user data and start fresh?** Run the following in
  the SQL Editor — it empties event data but KEEPS the benefits catalog:

  ```sql
  TRUNCATE analytics_events, application_fields, applications, sessions, users, audit_log RESTART IDENTITY CASCADE;
  ```

---

## 📦 What each table stores

| Table                | Use in app                                                                 |
|----------------------|----------------------------------------------------------------------------|
| `benefits`           | Master catalog. Dashboard edits this; bot reads it to offer matches.       |
| `users`              | One anonymised row per phone number (SHA-256 hashed only).                 |
| `sessions`           | Per-user conversation state (step, answers, matches, active application).  |
| `applications`       | Row per submitted application, with reference code and status.             |
| `application_fields` | Individual form answers for inspection / debugging.                        |
| `analytics_events`   | Append-only event log for dashboard charts.                                |
| `audit_log`          | Records every dashboard mutation (benefit create/edit/delete).             |
