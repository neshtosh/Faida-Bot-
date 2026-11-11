# Plain-language audit: the public site

> **Status:** v1.2 · 11 November 2026. All 24 findings applied (§6); addendum on organisations signing people up (§7). (v1: 9 November)
> **Method:** the *Universal Plain-Language Editor* skill (supplied by the team):
> context first, findings sorted by impact, each finding classified, a
> recommendation per finding, and whether it can be done now or needs
> confirmation.
> **Reviewed:** the English copy, page titles, meta descriptions, button labels
> and screen-reader labels of both pages as rendered from `main` (commit `1a8abc8`):
> - `/`: organisations (`faida-dashboard/public/site/index.html`, about 1,860 words)
> - `/people`: people (`people.html`, about 2,280 words)
>
> Kiswahili was checked for consistency only (§F21). Separately, I compared the
> reply commands the pages tell people to use with what the bot does today
> (`faida-export/src/bot/handler.js`).
> **Not reviewed:** the live deployment, the admin dashboard, the bot's own
> messages (apart from the commands), and the quality of the Kiswahili. That
> needs a native speaker.
> **Standing decision respected:** both pages show the finished product
> (decision of 7 November). This audit doesn't reopen that. It flags only the
> claims where a wrong reading could cost someone money, privacy, eligibility or
> trust, and the places where the copy contradicts itself or the bot.

---

## 1. Context

| | Organisations page (`/`) | People page (`/people`) |
|---|---|---|
| **Audience** | Programme officers and managers in counties and wards, national programmes, NGOs, foundations, SACCOs, employers and colleges. Professional and English-working, often risk-averse public bodies. Secondary readers: funders, M&E staff | Kenyans 18–60 on WhatsApp, low to medium digital confidence, many Kiswahili-first, cheap phones, scam-wary. Secondary: family members acting for a parent |
| **Purpose** | Get in touch about a programme | Start a WhatsApp chat and finish the profile |
| **Stakes** | Public money, fairness of selection, participants' data (including disability and gender), grievance handling, contracts | Eligibility, money, ID and PINs, fraud, privacy, acting in someone's name |
| **Voice to keep** | Plain, confident, specific, Kenyan | Plain, warm, short sentences, Kenyan words ("the cyber", Cucu, M-Pesa) |

## 2. Overall assessment

Both pages are clear at sentence level. Sentences are short and plain, examples
are labelled as examples, the voice is consistent, and most headings say what
follows. The main risks aren't about wording. They are:

1. **Promises that are wider than the system can keep.** How many people
   Faida reaches, whose data organisations see, what happens to a complaint, and
   what typing STOP does.
2. **Commitments made on behalf of other organisations.** Statements like
   "feedback never affects eligibility" are presented as Faida guarantees, but
   they depend on what each programme agrees to.
3. **The same thing has different names in different places.** Most visible in
   the complaints vocabulary on the organisations page, and in "programme" vs
   "app" in Kiswahili.

Most fixes are short edits. Five need a decision from a product owner, engineer
or legal reviewer first.

### What works and should stay

- Labels on every example ("Example, not a real user", "figures are illustrative").
- The consent levels and the PIN promise ("You enter your own PIN").
- Concrete scenes in place of claims: the bursary forms at the ward office, the
  fake KDF advert, Otieno's bus fare.
- The FAQ answer "Is Faida from the government? No…".
- Headings that predict their content: "Questions organisations ask", "Run the
  programme", "Taxes and permits, filed before the fine".

---

## 3. Findings, highest impact first

Categories: **L** language edit · **C** content gap or decision ·
**S** structure · **P** product, process or design · **V** fact, policy or
evidence to verify.
"Now" means an editor or developer can do it without a decision. "Confirm"
means someone has to decide or check a fact first.

### Fix before launch

#### F1. Reach is described as everyone who qualifies, but Faida can only reach its own users · V, L · Now (wording), Confirm (numbers)

| Where | Current |
|---|---|
| `/` hero | "Faida tells the people who qualify, on WhatsApp, before your window closes." |
| `/` Who it's for, counties | "Faida tells **every resident who qualifies**…" |
| `/` hero report | "Eligible residents told: 2,140" |
| `/` Reach and intake | "…matches your programme to **everyone who chose to hear**" |

**Why it matters:** a county reading the hero could reasonably plan outreach
on Faida alone. Residents who don't use Faida would then miss out, which is the
opposite of the fairness the page promises. The page contradicts itself:
"every resident" in one place, "everyone who chose to hear" in another.

**Recommendation:** use the accurate version everywhere, and give buyers a way
to ask about reach.
- Hero: "Faida tells the people who qualify, among everyone who uses it, on
  WhatsApp, before your window closes."
- Counties: "Faida tells residents who qualify and have chosen to hear…"
- Add an FAQ: "How many people in our area can Faida reach?" The answer needs
  real user numbers by county or ward. `[CONFIRM: product owner, with data]`

#### F2. The two pages say different things about whose data goes where · V, C · Confirm (privacy owner and legal)

| Where | Current |
|---|---|
| `/people` promises | "Your details are used only for your applications" |
| `/people` FAQ | "Your details are private and used only for your own applications." |
| `/` Fair by design | "Participants' details are used only for your programme" |
| `/` Learn and report | "reach broken down by ward, gender, age and disability, and funder reports" |
| `/` FAQ | "Faida checks each applicant against your rules and the documents they share" |
| `/` people's side | "The people you serve use the same Faida… Your programme reaches them alongside everything else" |

**Why it matters:** a person reading `/people` can't tell whether an
organisation sees their profile, documents or disability status. An
organisation reading `/` can't tell what it will receive. Disability and health
data are sensitive personal data under Kenya's Data Protection Act 2019. Both
pages also describe a profile that is used for every offer, which "used only for
your applications" doesn't cover.

**Recommendation:** decide the data-sharing rule, then state it once in the same
words on both pages. A draft to confirm, not to publish as is:
- People: "Faida uses your details to find what you qualify for. An
  organisation sees your details only when you apply to it, and only what its
  application asks for. Reports to organisations show totals, never names."
- Organisations: "You receive the applications people send you. Reports show
  totals by ward, gender, age and disability, never named individuals."

`[CONFIRM: data-protection owner, legal review, ODPC registration status]`

#### F3. "Never asks for your PIN" is ambiguous, and arguably untrue for the KRA PIN · L, V · Now

| Where | Current |
|---|---|
| `/people` hero line under the button | "Free on WhatsApp · Six quick questions · Never asks for your PIN" |

**Why it matters:** Kenyans have an M-Pesa PIN, a bank PIN and a KRA PIN. Faida
does ask for, and store, the KRA PIN for filing (`PRODUCT.md` §5.2). The
promises section says it correctly: "M-Pesa or bank PIN".

**Rewrite:** "Free to find out · Six quick questions · Never asks for your
M-Pesa PIN". Kiswahili: "…Haitakuuliza PIN yako ya M-Pesa".

#### F4. The reply commands on the page don't match the bot · P · Confirm (engineering)

| Page says | Bot today |
|---|---|
| "Say STOP and it stops. At any time." and "Reply … STOP to end them" | STOP (and SITISHA) only cancels a form in progress or leaves a mode. Reminders stop with "reminders off" / "kumbusho off" |
| "Reply NOT NOW to skip one" / "SIO SASA" | Not recognised |
| "Type 'delete my data'" | Works. Kiswahili "futa data yangu" also works |

**Why it matters:** these are the first things a worried user tries. A STOP
that doesn't stop the messages breaks trust straight away, and WhatsApp's
business rules expect a working opt-out.

**Recommendation:** make the bot match the page:
- STOP and SITISHA outside a form turn off proactive messages and reminders.
- NOT NOW and SIO SASA skip the current suggestion.

That's a small change in `handler.js`. STOP inside a form should keep its
current meaning (cancel the form), so the reply needs to say which one
happened. **Now:** on the Kiswahili page, tell people to type "futa data
yangu" instead of the English command.

#### F5. Promises made on behalf of programme teams · V, L · Now (wording), Confirm (partner terms)

| Where | Current |
|---|---|
| `/` principles | "Feedback never affects eligibility or access to services." |
| `/` principles | "Every concern gets a reference number and an outcome." |
| `/` and `/people` chats | "Only they can see it, and it won't affect your place." |

**Why it matters:** Faida records and routes concerns, but the programme team
decides the outcome and controls access to services. Faida can only keep these
promises if every programme agrees to them in writing. "Only they can see it"
also leaves out Faida's own staff. Participants and auditors will read it
literally.

**Rewrite (shows who does what):**
- "Faida gives each concern a reference number and sends it to the programme
  team. The team responds, Faida tells the participant, and the case stays open
  until it's closed."
- "Every programme on Faida agrees that feedback never affects anyone's place."
  `[CONFIRM: partner terms]`
- Chat: "Only the programme's authorised staff can see it." `[CONFIRM whether
  Faida staff can]`

#### F6. Policies stated as fact that aren't adopted yet · V · Confirm (policy owner)

- "Commercial products come only from regulated providers, are always labelled,
  and are never ranked by payment." (`/` FAQ)
- "Offers are ranked by what they give the person. Nobody can pay to skip your
  rules." (`/`)
- "Every offer is checked before it reaches you." and "Every applicant is
  checked against your rules before reaching you." (both pages)

These are open questions in `OPPORTUNITY-MATRIX.md` §8 (listing rules,
verification, the commercial boundary). Write each one down as policy before
launch, or soften it to what the team does today ("checked by our team before it
goes out").

#### F7. "Free" says more than it means · L, V · Now (wording), Confirm (pricing)

| Where | Current |
|---|---|
| `/people` hero, CTAs, peak | "Free on WhatsApp" |
| `/people` FAQ | "If you ask Faida to file for you and there's a fee, you see it in shillings before you say YES." |
| `/people` promises | "Faida never asks you to pay to receive a benefit." |

**Why it matters:** "Free" next to the button, then a fee in the FAQ, reads as
a bait-and-switch, which is exactly what scam-wary readers watch for.
"Free on WhatsApp" can also be read as "no data cost".

**Rewrite:** "Free to find out what you qualify for" at the button. Keep the FAQ
answer. Change the promise to: "Getting a benefit never costs money. If Faida
files for you and there's a fee, you see it first."

#### F8. The complaints vocabulary drifts on the organisations page · L, C · Now

The same idea has six names: feedback, concern, complaint, grievance, case and
safeguarding report. For development and government buyers, *grievance* is a
term of art: a formal grievance redress mechanism with its own rules. Using it
loosely makes the page read as if it doesn't know the field.

**Recommendation:** define the ladder once and use it everywhere:
- **feedback:** how it went
- **concern:** something went wrong, which becomes a **case** with a reference
  number
- **grievance:** a formal complaint handled under the programme's grievance
  procedure
- **safeguarding report:** abuse or exploitation, which goes only to authorised
  staff

Then align:
- the report line "Concerns resolved"
- the question "Which complaints are still open?", which becomes "concerns"
- "feedback and complaints" in "Run the programme"

#### F9. Screen-reader users can't read the conversations · P · Now

The chat mock-ups and the board of offers use `role="img"` with a label such as
"Example WhatsApp conversation". That hides every message inside from screen
readers, and the messages carry key content: the consent question, the reference
number, "won't affect your place", the fake-advert answer. The Kiswahili SMS
examples on the English pages also have no `lang="sw"`, so screen readers read
them with an English voice.

**Recommendation:** make each conversation a `figure` with its messages as real
text and the caption as the `figcaption`. Keep `aria-hidden` only on decorative
parts (the waveform, the typing dots). Add `lang="sw"` to the Kiswahili SMS
text.

### Clarity and structure

#### F10. Acronyms a low-literacy reader won't know · L · Now (an SME should check the glosses)

Fine without a gloss: KRA, SHA, M-Pesa, HELB, NG-CDF.

Explain at first use on `/people`:
- **e-GP**: "the government's online tender system"
- **UFAA**: "the government body that holds unclaimed money"
- **NCPWD card**: "disability registration card"
- **KUCCPS**: "university and college placement"
- **NYOTA**: "the national youth jobs and training programme" `[CONFIRM gloss]`
- **TVET college**: "technical college"
- **PWDs**: write "people with disabilities"

#### F11. The 3:00 pm chapter is the hardest paragraph on the people page · L · Now

Current: "Faida knows every deadline before you do and does the filing, within
the limits you set. It also plans the steps that open doors: a tax compliance
certificate and e-GP registration put the tenders set aside for youth and women
within Wanjiru's reach."

Rewrite: "Faida tracks your deadlines and files on time, within the limits you
set. It also sees what each step opens up. With a tax compliance certificate
and registration on e-GP, the government's tender site, Wanjiru can bid for
tenders set aside for youth and women."

#### F12. The 6:40 am paragraph carries too much in one sentence · L · Now

Current: "Faida watches everything on offer, from government, your county and
ward, NGOs, SACCOs, employers and colleges, and checks it against your life."

Rewrite: "Faida keeps track of what's on offer from government, your county and
ward, NGOs, SACCOs, employers and colleges. It checks each one against your
life."

#### F13. Inconsistent strength of the "everything" promise across pages · L · Now

| Page | Current |
|---|---|
| `/people`, 6:40 am | "Faida watches everything on offer" |
| `/` people's side | "It tells them everything they qualify for, from every source" |
| `/people`, What Faida finds | "If it's on offer, Faida is looking for it." |

Use the softer, verifiable form in all three places, as in F12 and "It tells
them what they qualify for, from many sources".

#### F14. The organisations page's audience labels leave some buyers out · L, C · Now (wording), Confirm (scope)

The hero eyebrow lists seven kinds of organisation. It leaves out wards,
co-operatives, development partners, health, agriculture and housing (all of
which appear later), and community, faith and self-help groups (which appear
nowhere on `/`). A ward administrator or a church programme may decide the page
isn't for them. "Programmes" in the headline also leaves out employers (jobs)
and SACCOs (member products).

**Recommendation:** keep "programmes" in the headline (programme teams are the
core buyer), and make the eyebrow inclusive: "For anyone offering something to
the public: counties and wards, national programmes, NGOs and community groups,
SACCOs and co-ops, employers and colleges." Add community and faith groups to
"Who it's for" if they are in scope. `[CONFIRM scope]`

#### F15. The organisations page asks buyers to read eight sections before "Who it's for" · S · Now

"Who it's for" is section 9 of 13. Buyers decide early whether a page is for
them.
- Move it to just after "How Faida works", or put a one-line version in the
  hero.
- Add a short jump menu under the hero for the three parts (Reach and intake ·
  Run the programme · Learn and report). That makes a 1,900-word page usable.
- The heading "From first contact to lasting outcomes." doesn't say what
  follows. Change it to "Three parts: reach, run, report", or keep it and let
  the dateline carry the meaning.

#### F16. The organisations page's only contact path is a blank email link · P · Confirm (product owner)

"Tell us about your programme" opens `mailto:` with no address (`config.js` is
empty). Even once the address is set, many officers use webmail, where `mailto`
does nothing. There's no phone number, no WhatsApp for organisations and no
form, and the button doesn't say what happens next.

**Recommendation:**
- Show the email address as text.
- Add a WhatsApp number for organisations, or a short form.
- Add a line under the button: "We reply within [two working days]."
  `[CONFIRM the response time]`

#### F17. The smartphone answer contradicts itself · L · Now

Current: "Do participants need a smartphone or an app? No. WhatsApp first, SMS
and USSD for basic phones…" (WhatsApp needs a smartphone.)

Rewrite: "No app to download. People with smartphones use WhatsApp. People with
basic phones get SMS and can use USSD. Field officers reach people who are
offline."

#### F18. The gap scenes can read as blaming the buyer · L · Now

"**Your** bursary forms sat at the ward office for six days. The parents who
needed them most never heard." A county officer may take that personally.
Remove "Your": "The bursary forms sat at the ward office for six days…". The
point lands just as hard without the accusation.

#### F19. Absolutes and comparatives the page can't back up · L, V · Now

| Current | Rewrite |
|---|---|
| "It answers the questions most reports can't:" | "It answers questions like these:" |
| "send funders reach and outcome data they can trust" | "send funders reach and outcome data from the records that run the programme" |
| "Members don't read circulars." | "Many members miss circulars." |
| "Every case followed to the end." (report) | "Each case followed to its outcome." (it's an example card) |
| "Jobs: … all checked" | "checked before they reach you" (ties to F6) |
| "Government recruitment never asks you to pay." | Keep. It's the public warning issued by KDF, NPS and TSC. Cite it in the docs |

#### F20. The illustrative figures could be screenshotted as real results · P, V · Now

The hero report labels its figures "Example: figures are illustrative." in small
grey text under the title. Add a visible EXAMPLE tag on the card itself (as the
people page does with YOURS), so a cropped screenshot still carries the label.

#### F21. Kiswahili: "programu" means both "programme" and "app" on the same page · L, V · Confirm (native speaker)

The organisations page uses *programu* for programme (title, headline) and for
app ("simu janja au programu" in the FAQ). Ask the native speaker whether
*mpango / mipango* fits better for "programme". Also check:
- *ofa* (borrowed) vs *fursa*
- the English command "delete my data" in the Kiswahili copy (see F4)

### Lower priority

#### F22. Small wording fixes · L · Now

- "Nothing is sent without your YES, unless you allowed it." is circular.
  Change to "…unless you've said yes to it in advance."
- The last people FAQ answer ends with a dangling link "Faida for
  organisations." Make it "See **Faida for organisations**."
- The button labels for the same action vary ("See what I qualify for", "Let
  Faida find you", "See what I qualify for on WhatsApp"). This is acceptable.
  Keep "Let Faida find you" as the deliberate peak line and use "See what I
  qualify for" everywhere else.

#### F23. Story continuity across the pages · L · Now

Wanjiru applies to the *Kisumu County youth fund* at 6:40 but trains with
*YEDF* at 5:40. The organisations page calls it the *county youth fund* and an
unnamed *business training*. Pick one programme for both moments, or say on the
people page that she's in two programmes.

#### F24. Nothing says the person confirms what's submitted in their name · C · Now (consistent with `PRODUCT.md` §6.1)

Add to "You stay in charge": "Before Faida submits anything in your name, you
see what it will send, including any declaration, and confirm it."

---

## 4. Terminology to standardise

| Concept | Use | Avoid mixing with |
|---|---|---|
| What an organisation puts on Faida | **programme** (organisations page); **offer** (people page, and for jobs and member products) | listing (except for the act of listing), opportunity, benefit as a general word |
| A person in a programme | **participant** (after enrolment), **applicant** (before) | beneficiary, user, "your people" (keep only in headings) |
| Problems raised | the ladder in F8 | complaint and grievance used loosely |
| Reaching people | **people who qualify and chose to hear** | "every resident", "everyone" |
| The PIN | **M-Pesa PIN**, **bank PIN** | "your PIN" alone |
| Reply words | Exactly what the bot accepts (F4) | Words the bot doesn't recognise |

---

## 5. Action plan

| Priority | Findings | Who | Effort |
|---|---|---|---|
| 1. Before launch, now | F1 wording, F3, F5 wording, F7 wording, F9, F18, F20 | Editor and developer | About half a day |
| 1. Before launch, needs a decision | F2 data sharing, F5 partner terms, F6 policies, F7 pricing | Product owner, data-protection and legal | Policy work |
| 1. Before launch, engineering | F4 reply commands; F16 contact path | Engineer, product owner | Small |
| 2. Clarity pass, now | F8, F10, F11, F12, F13, F17, F19, F22, F23, F24 | Editor | About half a day |
| 2. Structure | F14, F15 | Editor and designer | Small |
| 3. Language review | F21, and the full Kiswahili copy | Native Kiswahili speaker | 1 day |
| 3. Evidence | F1 reach numbers by area; sources for F19 | Product owner | Ongoing |

All the "now" items can be applied in one pass without changing any decision
already made. The "confirm" items need the named owner before the copy can say
anything stronger than the cautious wording proposed here.

---

## 6. Applied on 10 November 2026

All findings were applied to `index.html`, `people.html`, `org.js` and
`config.js`, in English and Kiswahili. F4 was also fixed in the bot. Where a
finding needed confirmation, the cautious wording from this audit was used, not
a stronger claim. Those items are marked **sign-off needed**: the wording is
live, but the named owner still has to confirm it's true.

| Finding | What changed | Status |
|---|---|---|
| F1 reach | Hero: "among everyone who uses it"; counties: "residents who qualify and have chosen to hear"; new FAQ "How many people in our area can Faida reach?" (no numbers) | Done. Real reach numbers still to come |
| F2 data | Same rule on both pages: an organisation sees your details only when you apply to it, and reports show totals, never names | **Sign-off needed** (data protection, legal) |
| F3 PIN | "Never asks for your M-Pesa PIN" | Done |
| F4 commands | Bot: STOP / SITISHA / UNSUBSCRIBE outside a form turn reminders off; inside a form STOP still cancels the form; NOT NOW / SIO SASA / SI SASA / LATER / BAADAYE acknowledged; the "reminders on" reply now mentions STOP / SITISHA. 4 new tests, 44/44 pass. Kiswahili page now says "futa data yangu" | Done |
| F5 partner promises | "Programmes on Faida agree that feedback never affects eligibility…"; "Your team responds, and Faida tells the participant"; chats: "Only the people handling it can see it" | **Sign-off needed** (partner terms) |
| F6 policies | "checked by the Faida team before it reaches you". The advertising and ranking rules are kept as stated | **Sign-off needed** (written listing and commercial policy) |
| F7 free | "Free to find out" at every button; promise rewritten around fees shown first | Done. Pricing still to be decided |
| F8 vocabulary | "concerns" for issues; "formal grievances follow your grievance procedure" | Done |
| F9 accessibility | Conversations are `role="group"`, so screen readers read every message (checked with an accessibility snapshot); `lang="sw"` on the Kiswahili SMS examples. The board of example offers stays an image with a summary label, since it's a looping decoration | Done |
| F10 acronyms | NYOTA, HELB, KUCCPS, NCPWD, e-GP glossed; "TVET college" → "Technical college"; "PWDs" → "people with disabilities" | Done. The NYOTA gloss needs an SME check |
| F11, F12 | 3:00 pm and 6:40 am paragraphs rewritten | Done |
| F13 | "what they qualify for, from many sources"; 6:40 am no longer says "everything" | Done |
| F14 audience | Hero eyebrow covers wards, community groups and co-ops; "NGOs, community and faith groups, foundations and development partners" | Done. Scope still to be confirmed |
| F15 structure | "Who it's for" moved to straight after "How Faida works"; the three parts link to their sections | Done |
| F16 contact | Email (and an optional organisations WhatsApp, `orgWhatsapp`) shown as text once set in `config.js` | Done. Address and response time still to come |
| F17–F20 | Smartphone answer, neutral gap scene, absolutes softened, EXAMPLE tag on the report card | Done |
| F21 Kiswahili | "programme" is now *mpango / mipango* on both pages; *programu* is kept only for "app" | Done. Native speaker to confirm |
| F22–F24 | Circular promise fixed, dangling link fixed, button labels aligned, story continuity (Wanjiru is also on a YEDF course), and a new promise: "You see what Faida will send in your name before it goes" | Done |

Checks after the changes:
- No console errors at 320–1440px.
- No horizontal scroll in either language.
- Reduced motion and no-JavaScript still work.
- The contact line appears in both languages once configured.

---

## 7. Addendum (11 November 2026): organisations signing people up

> **Request:** the site is missing one statement. Organisations can sign people
> up for their programme themselves, and those people only have to reply to
> Faida. This section audits where and how to say it, with the same skill. No
> page copy has changed yet.

### 7.1 What the statement has to carry

| Element | Why it matters |
|---|---|
| **Who acts:** the organisation (or its field officers) signs people up | Organisations are the main buyers. This is a second route in, alongside "Faida finds people among its users" |
| **How:** from a list it already holds (members, beneficiaries, residents), or in person (a baraza, a ward office, a distribution day) | Makes it concrete for a SACCO with a member list and for a county with a registration drive |
| **What the person does:** reply. No app, no forms, no office visit to start | This is the point the user asked for. Say it in one short sentence |
| **Consent:** each person confirms with one reply before Faida messages them about the programme | Without this, the statement contradicts "People choose to hear from you" (Fair by design). It also contradicts what the people page says about trust, and it risks breaking the Data Protection Act and WhatsApp's opt-in rules |
| **Who added them:** Faida's first message names the organisation | People who get an unexpected WhatsApp about money will assume it's a scam unless they can see who added them |

### 7.2 Findings

#### F25. The capability is missing, and it changes the reach story · C · Now (copy), Confirm (product)

After F1, the hero says Faida reaches "the people who qualify among everyone who
uses it". That's accurate, but it leaves the reader thinking reach depends on
Faida's user base. Signing up your own people answers that limit directly. It's
the strongest missing line for organisations.

#### F26. Adding it unchanged would contradict "Fair by design" · L, V · Now

Current: "People choose to hear from you, and can stop at any time." If
organisations can sign people up, that's only true if each person confirms.
Change it to: **"People confirm before they hear from you, and can stop at any
time."**

#### F27. People who were signed up need an explanation on the people page · C, P · Now (copy), Confirm (product)

Someone added by their SACCO gets a message from a number they never contacted.
The people page has to answer "Why did Faida message me?". The first message
itself (a product decision) has to name the organisation and ask the person to
confirm.

#### F28. Words: "sign up", not "onboard" or "enrol" · L · Now; Kiswahili to confirm

- **"Bring on board" / "onboard":** an idiom and internal jargon. Avoid it on
  the page.
- **"Enrol":** already means *after selection* on the organisations page
  ("Enrolled: 388", "Enrol and deliver"). Using it for signing people up would
  blur two different steps.
- **Use "sign up"** for adding people to Faida and your programme's list, and
  keep "enrol" for selected participants.
- **Kiswahili:** "Waliosajiliwa" already translates "Enrolled". For "sign up",
  use *kuwaongeza* ("add them"), and keep *usajili / kusajili* for enrolment.
  `[CONFIRM: native speaker]`

#### F29. Product and legal dependencies · P, V · Confirm

- **Not built yet.** The dashboard only lists bot users. There's no list
  import, no field-officer sign-up, and no first-contact confirmation.
  - Add these to the launch list in `BRIEF.md` §7, since the page sells the
    finished product.
  - Pick the bot reply that confirms; YES is the obvious choice. STOP already
    works.
- **Lawful basis.** An organisation passing its members' or beneficiaries'
  numbers to Faida needs a lawful basis and a data-sharing agreement under the
  Data Protection Act 2019. `[CONFIRM: legal]`
- **WhatsApp opt-in.** WhatsApp Business rules require opt-in before
  business-initiated messages. Check whether an organisation's list counts as
  opt-in, or whether the first contact should be an SMS, or a field officer
  saying "reply to this number". `[CONFIRM: WhatsApp policy]`

### 7.3 Where to say it, and proposed wording

In priority order. Each item lists the English, then the Kiswahili for native
review.

**1. Organisations page, Reach and intake: a new step between 1 and 2** (the
core statement).

> **2. Sign up the people you already serve.**
> Add them from a member or beneficiary list, or let your field officers sign
> people up at a baraza or a ward office. Faida's first message says you added
> them and asks them to confirm. To apply, all they do is reply, on WhatsApp,
> by SMS or by USSD.

SW:
> **2. Waongeze watu unaowahudumia tayari.**
> Waongeze kutoka orodha ya wanachama au wanufaika, au waache maafisa wako wa
> uwanjani wawaongeze kwenye baraza au ofisi ya wadi. Ujumbe wa kwanza wa
> Faida unasema wewe ndiye uliyewaongeza na kuwaomba wathibitishe. Ili
> kuomba, wanachohitaji ni kujibu tu, kwenye WhatsApp, kwa SMS au kwa USSD.

The existing steps 2 and 3 become 3 and 4. Step 3 ("The right people hear
first") still holds, because it covers both routes.

**2. Organisations page, hero lede: the first sentence** (makes the reach story
complete where buyers read first).

Current: "Faida finds the people who qualify among everyone who uses it, and
tells them on WhatsApp before your window closes."

Proposed: **"Sign up the people you serve, and Faida finds others who qualify
among everyone who uses it. It tells them on WhatsApp before your window
closes, and to apply, all they do is reply."**

SW: "Waongeze watu unaowahudumia, na Faida inawatafuta wengine wanaostahili
miongoni mwa wote wanaoitumia. Inawaambia kwenye WhatsApp kabla dirisha lako
halijafungwa, na ili kuomba, wanachohitaji ni kujibu tu."

The meta description should be updated to match.

**3. Organisations page, Fair by design (F26).**

"People confirm before they hear from you, and can stop at any time." · SW:
"Watu wanathibitisha kabla ya kusikia kutoka kwako, na wanaweza kusimamisha
wakati wowote."

**4. Organisations page, FAQ.**
- **New: "Can we sign people up ourselves?"**
  "Yes. Add them from a list you already hold, such as members, beneficiaries
  or residents, or have field officers sign people up in person. Each person
  confirms with one reply before Faida messages them about your programme. They
  need no app and no forms: they reply on WhatsApp or by SMS, or use USSD."
- **Update "How many people in our area can Faida reach?"** Add: "You can also
  sign up the people you already serve, so your reach doesn't depend only on
  who uses Faida today."

**5. People page, FAQ: new "Faida messaged me, but I never signed up. Why?"** (F27).

> "An organisation you deal with, such as your county, your SACCO or an NGO,
> may have added your number for one of its programmes. Faida's first message
> says who added you. Reply YES to continue, or STOP and you won't hear from
> Faida again. Faida never asks for money or your M-Pesa PIN."

SW: "Taasisi unayohusiana nayo, kama kaunti yako, SACCO yako au NGO, huenda
imeongeza namba yako kwa mmoja wa mipango yake. Ujumbe wa kwanza wa Faida
unasema nani alikuongeza. Jibu NDIYO kuendelea, au SITISHA na hutasikia
kutoka kwa Faida tena. Faida haikuombi pesa wala PIN yako ya M-Pesa kamwe."

**6. Supporting lines (optional, lower priority).**
- **Organisations page, "How Faida works" chain:** "You list a programme once
  and sign up the people you serve. Faida reaches them, and others who qualify.
  They apply by replying. You run the programme. Faida follows up on delivery
  and outcomes."
- **Organisations page, In the field:** add a tick: "Field officers sign people
  up on the spot, with just a phone number."
- **Who it's for, SACCOs:** "…Sign up your members once, and Faida tells each
  one about the dividend, loan, bonus or cover that fits them…"
- **People page, the organisations teaser:** add "Your county, SACCO or NGO can
  also sign you up. All you do is reply."
- **People page, "Do I need to download an app?":** add "Whether you message
  Faida first or an organisation signs you up, all you do is reply."

### 7.4 Recommended order

| Step | Items | Who |
|---|---|---|
| 1 | Placements 1, 3, 4 and 5 together. The statement, the fairness fix and the people page explanation must ship as a set, or the pages contradict each other | Editor |
| 2 | Placement 2 (hero), then 6 | Editor |
| 3 | First-message design (names the organisation, YES to confirm), list import and field sign-up | Product and engineering |
| 4 | Lawful basis, data-sharing agreement, WhatsApp opt-in | Legal |
| 5 | Kiswahili: *kuwaongeza* vs *kusajili* | Native speaker |

**Also set:** the organisations email is now `ian_warutere@gartsafrica.com` in
`faida-dashboard/public/site/config.js`. Once merged, it appears as text and as
the mailto target on the organisations page.
