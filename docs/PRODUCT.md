# Faida — Product Document

> **Status:** Draft v0.1 · October 2026
> **Owner:** _TBD_
> **What this is:** The product intent for Faida, written down for the first time.
> It combines what the code already does with the founding idea: an agent that
> handles a citizen's dealings with institutions **end to end, on their behalf**.
> Statements marked **[Assumption]** are inferred and need confirming. Open
> questions are collected in [§14](#14-open-questions).

---

## 1. One-liner

**Faida is a personal agent on WhatsApp that finds what you're entitled to, does what
you're obliged to do, and handles the paperwork for both — with your consent.**

_Faida_ (Kiswahili): benefit, gain, profit.

**The point of Faida is to make public and partner services simple to use.** The
user says what they need in plain language; Faida's agents work the portals.
Applications are submitted by **browser-use agents**, not by people doing it by
hand. The model to follow is the america.gov bot, applied to Kenyan national and
county services.

---

## 2. The problem

For most Kenyans, dealing with institutions is slow, confusing and expensive:

- **Entitlements go unclaimed.** Government funds (Hustler Fund, YEDF, Uwezo, WEF,
  AGPO), county programmes, NGO grants and SACCO products exist, but people don't
  know about them, can't tell whether they qualify, or give up partway through applying.
- **Obligations get missed.** KRA returns, SHA contributions, business permits, licence
  renewals and certificates all have deadlines and penalties. Missing them blocks
  access to other services (for example, tax compliance is needed for AGPO tenders).
- **Most services are digital in name only.** eCitizen, iTax, SHA and county e-permit
  portals are web forms behind logins, OTPs and CAPTCHAs, mostly with no public API.
  Using them takes a smartphone or laptop, data, digital literacy and patience.
- **The workaround costs money and is risky.** People pay cyber cafés, "agents" or
  brokers, hand over their ID and passwords, and get no record of what was done.

The gap isn't information. It's **execution**. Telling someone how to apply isn't
enough; most of them need it done for them, safely.

---

## 3. Vision

A Kenyan has one trusted contact on WhatsApp (later also SMS/USSD) that:

1. **Knows them**: a consented profile, documents and history, kept securely.
2. **Looks out for them**: brings up benefits they qualify for and obligations
   that are coming due, before they ask.
3. **Acts for them**: fills in and submits applications, renewals and registrations
   on the institution's own systems, through an API where one exists and through a
   browser-operating agent where it doesn't.
4. **Keeps them informed**: tracks every case to the end, relays official replies,
   and keeps a receipt of every action taken in their name.
5. **Asks before it acts**: nothing is submitted, signed or paid without the user's
   explicit consent for that action.

It starts with government and county services, then opens to **SACCOs, NGOs and
private providers**, who can reach eligible, opted-in users with their own benefits
and complete enrolment through the same agent.

---

## 4. Users

| Segment | Description | Primary need | [Assumption] priority |
|---|---|---|---|
| **Everyday citizen** | 18–60, has WhatsApp, low to medium digital confidence, often in a peri-urban or rural county | "Tell me what I qualify for and do it for me" | P0 |
| **Micro and small business owner** | Kiosk, salon, boda boda, mama mboga, small shop | Permits, KRA, AGPO, loans; staying compliant | P0 |
| **Youth / job seeker** | 18–35, student or recently graduated | Training, jobs, youth funds, HELB, certificates | P1 |
| **Vulnerable groups** | PWDs, elderly, women's groups, chamas | Targeted funds, NCPWD registration, cash transfers | P1 |
| **Diaspora / proxy helpers** | Family members acting for a parent or relative | Act on someone else's behalf, with consent | P2 |
| **Partners (B2B)** | SACCOs, county governments, NGOs, MFIs, employers | Reach eligible people and complete enrolment | P2 |

---

## 5. What Faida does (capabilities)

Six capabilities. All of them work through the same profile, document vault and
case tracker.

### 5.1 Discover & Recommend
- Matches the profile against a curated catalogue of benefits, plus approved live
  opportunities.
- Explains *why* the user qualifies and what they still need.
- Proactive: "New: Nairobi County youth bursary opens Monday. You qualify. Want me
  to apply?"
- Ranks by value, likelihood of success and effort, not just by match.

### 5.2 Apply (benefits)
- Collects only the information that's missing, reusing the vault (ID, KRA PIN,
  photos, certificates).
- Prepares the application, shows the user a summary, gets their consent, then
  **submits it on the provider's system**.
- Captures proof: confirmation numbers, screenshots, receipts.

### 5.3 Fulfil (obligations)
- An obligations calendar per user: KRA annual returns (by 30 June), SHA
  contributions, business permit renewal, driving licence renewal, and so on.
- The same flow as applications: prepare → consent → execute → receipt.
- Examples: register a business name, get a KRA PIN, file a nil return, get a
  certificate of good conduct, apply for a county single business permit.

### 5.4 Track
- Every request becomes a **case** with a status (draft → awaiting consent →
  submitted → under review → action needed → approved / rejected / done).
- Faida checks status on the provider's portal on a schedule and reports changes.
- The user can ask "where is my application?" at any time.

### 5.5 Communicate
- One thread for everything: reminders, status updates, OTP requests, document
  requests, official decisions.
- Translates official language into plain English or Kiswahili.
- Follows up: "SHA asked for a photo of your ID's back side. Send it here."

### 5.6 Assist
- Free-text Q&A grounded in verified sources (already partly built).
- Escalation to Faida support when something goes wrong (complaints, disputes,
  account problems). Support fixes problems; it doesn't do submissions.
- Directions to the nearest Huduma Centre or office when something must be done
  in person.

---

## 6. Acting on the user's behalf — the delegation model

This is the core of the product and its biggest risk. Trust is the product.

### 6.1 Consent levels

The user grants a level **per service**, not globally. Faida defaults to the lowest
level that still gets the job done.

| Level | Name | What Faida may do | Example |
|---|---|---|---|
| L0 | **Inform** | Tell, explain, remind | "Your permit expires in 14 days" |
| L1 | **Prepare** | Fill in forms and assemble documents; the user submits | PDF or pre-filled form for the user to file |
| L2 | **Act with approval** | Submit or pay **only after** a per-action "YES" on a summary | "Submit YEDF application with these details? YES / NO" |
| L3 | **Standing mandate** | Repeat a pre-approved routine action within limits | "File my nil return every June"; "renew permit if fee < Ksh 5,000" |

Rules that apply at every level:
- **Money:** every payment needs a fresh approval (M-Pesa STK push to the
  official payee). Faida never holds user funds. [Assumption: confirm the
  regulatory position before changing this.]
- **Legal declarations** ("I declare the above is true") are always shown to the
  user word for word and confirmed by them.
- **Revocable:** "STOP" or "REVOKE <service>" ends a mandate immediately, and any
  stored credentials for that service are deleted.
- **Auditable:** each action produces a receipt the user can request
  ("HISTORY") showing what was done, when, on which site, and with what data.

### 6.2 Identity & credentials
- Many portals need a personal login (eCitizen, iTax, SHA). Options, in order of
  preference:
  1. **Partner / intermediary access**: Faida registered as an official agent or
     intermediary where the institution allows it.
  2. **User-held session**: the user logs in once through a Faida-hosted secure
     browser link; Faida keeps the session token, not the password.
  3. **Vaulted credentials**: encrypted, per user and per service, used only by the
     executor, never shown to the language model or to staff.
- **OTPs** are relayed live over WhatsApp ("KRA sent you a code. Reply with it
  here."). Faida never asks for an M-Pesa PIN.
- **CAPTCHAs and anti-bot checks are never bypassed.** They are passed to the user
  to solve, then the agent carries on.

### 6.3 Legal & regulatory guardrails (needs legal review)
- **Data Protection Act 2019:** register with the ODPC as data controller (and
  processor where relevant). Do a DPIA, since this involves high-risk processing
  of national IDs, health and disability data. Collect the minimum, set
  retention limits, support access and deletion requests, keep data in Kenya or
  use approved transfers.
- **Computer Misuse and Cybercrimes Act 2018:** access to a user's accounts must be
  clearly authorised by that user and recorded (consent record per mandate).
- **Portal terms of use:** check each target portal. Prefer official agent or
  intermediary routes where they exist.
- **Payments:** stay out of holding funds; route payments directly to official
  paybills.
- **A written user mandate** (terms + per-service consent) that a court or regulator
  would recognise.

---

## 7. How execution works (where there's no API)

### 7.1 Execution ladder

For each service, Faida uses the highest rung available:

1. **Official / partner API**: fastest and most reliable (e.g. partner feeds like
   M-Taji, M-Pesa Daraja for payments, SACCO core-banking APIs).
2. **Browser agent (computer use)**: a sandboxed browser driven by an AI agent
   following a **playbook** for that portal.
3. **Guided self-service**: Faida prepares everything and walks the user through
   doing it themselves, or sends them to a Huduma Centre. This is the fallback
   when a playbook is broken or a step has to be done in person.

No rung has people submitting for users. When the agent needs something only the
user can give (an OTP, a CAPTCHA, a photo, a decision), it asks over WhatsApp and
waits.

### 7.2 Browser agent design

```
WhatsApp ─► Orchestrator (LLM) ─► Case engine ─► Executor
                 ▲                     │            ├─ API adapter
                 │                     │            ├─ Browser agent (sandbox per task)
                 └── OTP / consent ◄───┘            └─ Guided self-service (fallback)
                       requests                          │
                                                Evidence store (screens, receipts)
```

- **Playbooks per portal:** a structured description of the steps (login →
  navigate → fill → review → submit), the expected screens and success signals.
  The agent follows the playbook and only improvises within bounds. Changes to a
  portal are detected and flagged for re-certification.
- **Hard checkpoints:** the agent *pauses* before submit, pay or declare, and asks
  the user to approve.
- **Isolation:** one short-lived browser per task; no shared cookies between
  users; credentials are injected by the executor, never put in the model's prompt.
- **Evidence:** screenshots of the final review and confirmation pages, plus
  extracted reference numbers, are saved to the case.
- **Monitoring:** success rate per playbook. After N failures a playbook is paused,
  users get guided self-service, and the team is alerted to fix it. A console lets
  the team replay agent runs to debug them.
- **Model:** a computer-use-capable model drives the browser; a cheaper model
  handles conversation and classification.

### 7.3 Rolling out a portal

1. Write the playbook and test it end to end on the team's own accounts.
2. Launch it to a small group of users, with hard checkpoints on every step that
   submits or pays.
3. Widen it once its success rate passes a set bar; keep monitoring after that.

---

## 8. Partners & distribution (B2B)

**Who:** SACCOs, county governments, NGOs, MFIs, insurers, employers, training
providers.

**What they get:**
- **Reach:** place their benefit or product in the catalogue; Faida matches it to
  eligible, opted-in users.
- **Enrolment:** Faida completes sign-up through the partner's API or form (same
  execution ladder).
- **Partner portal:** listings, eligibility rules, funnel analytics (matched →
  interested → applied → approved), applicant hand-off.
- **White-label / API (later):** Faida's matching and agent inside a SACCO's own
  channel.

**Guardrails:**
- Users opt in to partner offers; every offer is clearly labelled as sponsored or
  partner.
- Partners are verified before listing; consumer-credit products are checked for
  fair terms.
- Ranking is based on what's good for the user; partners can't pay to override
  eligibility.
- Partners only receive applicant data the user has consented to share for that
  application.

---

## 9. Business model (options, not decided)

| Stream | Who pays | Notes |
|---|---|---|
| Partner placement / enrolment fee | SACCOs, MFIs, insurers, training providers | Per qualified application or per enrolment |
| Government / county contracts | Counties, programmes | Faida as an outreach and enrolment channel for public programmes |
| Donor / NGO funding | Development partners | Financial inclusion and social protection goals |
| User service fee | Users | Small fee for obligations (e.g. filing, permit renewal), cheaper than a cyber café. Benefits discovery stays free. |
| White-label licence | SACCOs, counties | Later stage |

---

## 10. Where we are today

What the repo has now (October 2026), compared with the vision:

| Capability | Today | Gap to vision |
|---|---|---|
| Channel | WhatsApp via Baileys (unofficial), QR-linked | Move to WhatsApp Cloud API; SMS/USSD fallback |
| Profile | 6-question questionnaire (EN/SW), long-term memory in Supabase | Richer profile, document vault, proxy users |
| Discover | ~30 curated benefits + rule/keyword matching; approved scraped opportunities (M-Taji, World Bank, USAID) | Bigger, maintained catalogue; county coverage; better ranking; proactive alerts |
| Apply | Guided in-chat forms (8 field templates), reference code, PDF export; `FORM <url>` reads verified web forms | **No submission.** Needs consent flow, executors, evidence |
| Fulfil obligations | — | Obligations calendar, playbooks for KRA, eCitizen, SHA, county permits |
| Track | Applications stored; admin can set status manually | Case engine, status checks on portals, user-facing status |
| Communicate | Deadline reminders, feedback | Unified case thread, OTP relay, document requests |
| Assist | AI chat (OpenAI/Claude) limited to verified sources; nearest office | Support escalation; console to replay and debug agent runs |
| Partners | Admin dashboard (one shared password) for benefits and opportunities | Partner portal, roles and permissions, analytics |
| Trust & compliance | Hashed user IDs, encrypted reminder contacts, rate limiting | Consent records, DPIA, ODPC registration, credential vault, audit trail for users |

---

## 11. Roadmap (proposed)

### Phase 0 — Foundations (no new user features)
- WhatsApp Cloud API (verified business number); retire Baileys.
- Consent and terms flow; DPIA; ODPC registration started.
- **Case model** (one record per request, with status history and evidence).
- Document vault (encrypted ID, KRA PIN, photos, certificates).
- Real admin auth and roles in the dashboard; view of cases and agent runs.

### Phase 1 — Agent MVP
- Pick **3–5 high-volume services** (candidates: SHA registration, KRA PIN + nil
  return, business name registration, county single business permit, certificate
  of good conduct, plus 2–3 benefits such as youth or women's funds).
- Flow: discover → prepare in chat → user approves → **browser agent submits** →
  tracked case → status updates on WhatsApp.
- Playbooks for each launch portal, hard checkpoints, OTP relay, evidence capture,
  automatic status checks.

### Phase 2 — Payments & more services
- Payments via M-Pesa STK push to official paybills (permits, licences, fees).
- More playbooks, chosen by demand; county portals.

### Phase 3 — Proactive agent
- Obligations calendar and standing mandates (L3).
- Proactive benefit alerts; deeper county coverage.
- Proxy / family accounts.

### Phase 4 — Partners
- Partner portal, SACCO and county onboarding, enrolment via API or agent.
- SMS/USSD channel; white-label API.

---

## 12. Success metrics

| Stage | Metric |
|---|---|
| North star | **Cases completed successfully per month** (benefit received or obligation fulfilled) |
| Activation | % of new users who complete their profile; % who start a case |
| Execution | Case completion rate; median time to complete; playbook success rate; % of cases needing guided self-service |
| Value | Ksh in benefits unlocked; penalties avoided; cost per case vs cyber café |
| Trust | Consent decline rate; revocations; complaints; data incidents (target: 0) |
| Retention | Users with 2+ cases in 90 days; reminder → action rate |
| Partners | Qualified applications per partner; approval rate |

---

## 13. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Agent acts wrongly in a user's name | Legal and financial harm, lost trust | Hard checkpoints, evidence, scoped mandates, insurance, extra user confirmation for high-stakes actions |
| Credential / data breach | Severe | Vault, no credentials in prompts, least privilege, pen-testing, DPIA |
| Portal changes break playbooks | Failed cases | Monitoring, pause the playbook and fall back to guided self-service, quick re-certification |
| Portals block automation or forbid it in their terms | Execution blocked | Pursue official intermediary status; guided self-service fallback; work with institutions |
| WhatsApp number banned (Baileys) | Channel down | Cloud API migration (Phase 0) |
| Seen as an unofficial broker / fraud vector | Reputation | Verified business identity, clear branding, no upfront fees for benefits, partnerships with institutions |
| Stale catalogue | Bad recommendations | Partner self-service listings, scraping with admin approval, expiry dates |
| Partner incentives distort recommendations | User harm | Ranking based on user benefit; sponsored labels; partner vetting |

---

## 14. Open questions

1. **Launch services:** which 3–5 services go first? Which counties?
2. **First users:** who are the first 100 users, and how do we reach them (chamas,
   SACCOs, churches, county youth offices)?
3. **Legal route:** can Faida register as an agent or intermediary with eCitizen,
   KRA or SHA? What does counsel say about acting on user credentials?
4. **Money:** charge users for obligations? Fee level? Who pays for benefits work?
5. **Agent stack:** which computer-use model and browser sandbox to use; hosting in Kenya or abroad?
6. **Channels:** is USSD/SMS needed for launch, or after?
7. **Partners:** is there a first SACCO or county partner in view?
8. **Team & ownership:** product owner, data protection officer, legal counsel.

---

## Appendix A — Earlier design history

The original AI-assisted build conversations are in [`docs/archive/`](archive/).
They record the "apply directly from the bot" idea (the A/B/C menu: apply now /
apply yourself / save) that the guided application flow came from.
