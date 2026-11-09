# Product Marketing Context

**Document version:** v2
**Last updated:** 2026-11-07

Shared context for marketing work on Faida. The `marketingskills` skills
(copywriting, copy-editing, cro and the rest) read this file before they do
anything. Drafted from `docs/PRODUCT.md`, `docs/OPPORTUNITY-MATRIX.md`,
`docs/landing/BRIEF.md`, the landing page and the bot's code. Items marked
`[NEED: ...]` are gaps only the team can fill.

## Product Overview

**One-liner:** Faida tells you what you and your family qualify for before it
closes, checks it's real, and applies for you when you say yes. On WhatsApp.

**What it does:** Faida tracks what's on offer to Kenyans from every source
(government, county, ward, NGOs, SACCOs, employers, colleges) and every deadline
a person has (KRA, permits, SHA). It matches them to a person's life and
messages them first. With their consent it prepares the application, submits it
where it can, and tracks it to the end, keeping a receipt of everything.

**Product category (the shelf people look on):** there's no shelf yet. People
"look for bursaries", "look for youth funds", "check if a job is real", "go to
the cyber". Faida competes with those habits, not with an app category.

**Product type:** three connected offerings (`docs/PRODUCT_UPDATED2.md`):
**Faida for organisations** (reach and intake), **Faida for programmes**
(running programmes: enrolment, cases, delivery, feedback and grievances, field
operations, monitoring and reporting) and **Faida for people** (the personal
agent on WhatsApp). Organisations are the main target market.

**Business model:** discovery and eligibility free for users. Paid: filing on
the user's behalf (proposal: Ksh 500–2,000 per application; Ksh 299/month
premium), B2B white-label for SACCOs/MFIs, NGO listings, county and national
outreach contracts, pay-per-verified-enrolment. `[NEED: pricing decision. The
page says "may carry a small fee".]`

**Live today vs. sold on the page:** the page sells the finished product (see
`docs/landing/BRIEF.md` §7). Live today: 6-question profile in EN/SW, ~30
curated benefits plus admin-approved scraped opportunities, matching, guided
in-chat forms with PDF export, deadline reminders, AI Q&A on verified sources,
delete-my-data. Not live: submission, payments, obligations filing, voice notes
(the bot replies that it reads text only), SMS/USSD, family accounts, "is this
real?" checks, the organisation listing desk.

## Target Audience

**Main target market (buyers):** organisations offering something to people,
and the programme teams who run it: counties, wards and constituencies; national
programmes and agencies; NGOs, foundations and development partners; SACCOs,
co-operatives, banks and insurers; employers, colleges and training providers;
health, agriculture, housing and utilities. The site's main page (`/`) is for them.

**End users (the people they serve, and Faida's own users), at `/people`:**

**Primary end users (P0):**
- Everyday citizen, 18–60, on WhatsApp, low to medium digital confidence,
  often peri-urban or rural.
- Micro and small business owner: kiosk, salon, boda boda, mama mboga, small
  shop.

**Secondary (P1):** youth and job seekers (18–35); vulnerable groups (PWDs,
elderly, women's groups, chamas).

**P2:** family members acting for a parent (incl. diaspora); organisations
offering something (SACCOs, counties, wards, NGOs, foundations, employers,
colleges), who are the fastest route to revenue.

**Primary use case:** "Tell me what I qualify for before it closes, and do it
for me."

**Jobs to be done:**
- Don't let me miss money or a place I qualify for (bursary, fund, Inua Jamii).
- Keep me out of trouble with deadlines (KRA, permit, SHA) without me tracking them.
- Tell me if this offer or job advert is real before I pay anyone.
- Do the forms for me, safely, and show me proof.

**Life moments that create the need** (from the matrix §4): turning 18, KCSE
results or a school transition, out of work, starting a business, pregnancy and
birth, disability, a parent turning 70, a death in the family, planting
season, drought or floods, moving county, joining a SACCO or employer, and every
June (KRA).

## Personas (B2B)

| Persona | Cares about | Challenge | Value we promise |
|---|---|---|---|
| County / ward programme officer | Funds reaching the right residents, audit-proof lists, fewer queues | Notices on PDFs and notice boards; incomplete paper forms; proxy applicants | Eligible residents told in time; complete, checked applications; a report of who was told, applied and approved |
| SACCO / MFI manager | Member uptake, loan book quality, retention | Members don't read circulars; branch visits are costly | Members told about products that fit them, under your name; complete applications |
| NGO / foundation programme lead | Reaching the target group, completion rates, donor reporting | Reaching people outside their networks; drop-off after approval | Outreach to opted-in eligible people; follow-up on attendance, reports, repayments |
| Employer / college | Qualified applicants, fewer scams using their name | Fake adverts; unqualified floods | Verified listing, matched applicants, "is this real?" protection |
| NGO / foundation programme lead | Participants completing, safeguarding, outcomes | People drop off between selection and the last session; grievance routes nobody uses | Enrolment, cases, reminders, feedback and private grievances in one WhatsApp thread |
| M&E officer | Reliable reach and outcome data | Data collected after the fact, on paper or with survey links nobody opens | Attendance, completion, feedback and outcomes recorded as the programme runs; reach broken down by ward, gender, age and disability |
| Development partner / funder | Evidence the money reached the target group and changed something | Reports count applications, not delivery | Funder reports from the same records that run the programme |

## Problems & Pain Points

**Core problem:** the people an offer is meant for hear about it late or never,
and when they do, applying is hard, risky or costs money.

**Why the alternatives fall short:**
- **Word of mouth, WhatsApp groups, radio, chiefs:** arrive late or not at all;
  windows are short (an NG-CDF bursary window of 6 days in Teso North).
- **Cyber cafés, "agents" and brokers:** cost money, take your ID and
  passwords, give no record of what was done.
- **Government portals (eCitizen, iTax, SHA):** logins, OTPs, CAPTCHAs, data
  costs; built for people who already know what to look for.
- **Doing nothing:** the default. Missed money is invisible, so it never feels
  urgent.

**What it costs them:** bursaries and funds missed because the window closed;
KRA and permit penalties; fees paid to brokers; money lost to fake job and
grant adverts; money already in their name (UFAA) never claimed.

**Emotional tension:** "These things are for people who know someone." Shame
at not understanding the forms. Fear of being scammed. Fear of handing over ID
and PIN.

## Competitive Landscape

**Direct:** none known in Kenya (proposal claim). `[NEED: confirm before saying it publicly]`

**Secondary (same problem, different solution):** cyber cafés and agents;
Facebook pages and Telegram/WhatsApp channels that post "opportunities";
eCitizen and county portals; ward administrators and chiefs.

**Indirect:** doing nothing; asking a relative who "knows these things".

**How each falls short:** late, unverified, costly, risky with your data, or
needs you to already know what to ask for.

## Differentiation

**Key differentiators:**
- It messages you first. You never need to know what to ask for.
- It looks at the whole household (a parent turning 70, a child finishing school).
- It checks the offer is real.
- It does the paperwork with your yes, and keeps a receipt.
- WhatsApp, Kiswahili and English, any phone.

**Why that's better:** you hear in time, you don't pay a broker, you don't hand
your password to a stranger, and you have proof.

## Objections

| Objection | Response |
|---|---|
| "Is this a scam? A WhatsApp number saying I qualify for money?" | Faida never asks for your M-Pesa PIN, and never asks you to pay to receive a benefit. Every message says where the offer comes from. `[NEED: verified WhatsApp business account; ODPC registration number; named team]` |
| "Is this the government?" | No. Faida is an independent Kenyan service. Rules for each offer come from the organisation offering it. `[NEED: decide wording; add to FAQ]` |
| "Who sees my ID and details?" | Used only for your applications; delete any time with "delete my data". |
| "What will it cost?" | Finding out is free. Any fee for filing is shown in Ksh before you say yes. `[NEED: pricing decision]` |
| "Will it spam me?" | Only when something fits you or a deadline is close. Reply "not now" or STOP any time. `[NEED: frequency cap to state]` |
| "What if it gets my application wrong?" | You see a summary and say yes before anything is sent. `[NEED: what Faida owes the user if it errs]` |

**Anti-persona:** people looking for instant loans or "get rich" schemes;
people who want Faida to bend eligibility rules.

## Switching Dynamics

- **Push:** missed a bursary or fund because they heard late; paid a cyber café
  or broker; lost money to a fake advert; a penalty for a late return.
- **Pull:** being told first, by name, with the form already done; a receipt.
- **Habit:** asking the cyber attendant, the chief or a relative; waiting for
  the WhatsApp group to post it.
- **Anxiety:** scams, handing over ID, an unknown number acting "for you".

## Customer Language

**How people describe the problem (likely, to validate):** "I didn't know",
"nilichelewa" (I was late), "they need someone who knows people", "the cyber
charged me", "is this one real?", "the forms are at the ward office",
"karo" (school fees).

**Words to use:** bursary, fund, loan, grant, job, kazi, school fees/karo,
apply, register, claim, deadline, closes, form, receipt, M-Pesa, ward office,
cyber, Cucu, "you qualify".

**Words to avoid on consumer copy:** "take up" / "uptake", "on offer" as a
noun phrase, "offers" (reads as shopping deals), "eligible", "opted in",
"standing mandate", "good standing", "enrol", "listing", "programmes" (use the
name or the thing).

**Glossary:** *Faida* (Kiswahili) means benefit, gain, profit. "Pata faida"
reads as "get the benefit". Use it.

`[NEED: verbatim lines from 10–20 real users and pilot conversations]`

## Brand Voice

| Attribute | Means | Doesn't mean | Line from current copy |
|---|---|---|---|
| Plain-spoken | Words a cyber attendant would use; short sentences | Childish or vague | "Say STOP and it stops. At any time." |
| Kenyan, specific | Cucu, M-Pesa PIN, ward office, Kisumu | Stereotype or slang-heavy | "You enter your own PIN." |
| Honest | Examples labelled; no invented numbers | Hedged or apologetic | "Example, not a real user." |
| Warm, in charge of the boring stuff | Faida does the work and says so plainly | Hype, exclamation marks | "Good news before breakfast." |

## Proof Points

None from users yet (pre-launch). Usable, sourced facts (check against the
official source before publishing; see the matrix's Sources and Caveats):
- NG-CDF bursary windows can be days long (Teso North: 6 days, Sh5,000 each).
- UFAA holds tens of billions of shillings in unclaimed assets (reported Ksh 65–82B; sources conflict).
- KDF, National Police Service and TSC have publicly warned about fake recruitment adverts.
- AGPO reserves 30% of public procurement for youth, women and PWDs.
- Inua Jamii pays older people (70+), orphans and people with severe disabilities monthly (catalogue: Ksh 2,000–4,000 by category).

`[NEED: pilot results, partner names, ODPC registration, a named founder or team line]`

## Goals

**Primary business goal:** organisations running programmes on Faida; cases
completed (benefit received, obligation met, programme finished).
**Key conversion action (main page):** an organisation gets in touch about a
programme ("Tell us about your programme").
**Key conversion action (`/people`):** start a WhatsApp chat ("Hi Faida") and
finish the 6-question profile.
**Current metrics:** `[NEED]`

## Learnings

_Empty. Add what tests and launches teach us, with dates._

## Changelog

- v2, 2026-11-07: organisations made the main target market; added Faida for
  programmes (from `docs/PRODUCT_UPDATED2.md`) and the programme lead, M&E and
  funder personas.
- v1, 2026-11-05: auto-drafted from the repo during the landing copy review (`docs/landing/COPY-REVIEW.md`).
