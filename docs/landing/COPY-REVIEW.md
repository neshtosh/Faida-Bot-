# Landing page: copy and presentation review

> **Status:** v1 · 5 November 2026
> **Reviewed:** `faida-dashboard/public/site/index.html` (English copy, title and
> meta), the consent-level messages in `app.js`, and the page as rendered at
> 1440×900, 390×844 and 360×640. The Kiswahili was reviewed for structure only; it
> still needs a native speaker.
> **Method:** the [`marketingskills`](https://github.com/coreyhaines31/marketingskills)
> skills: **copywriting** (diagnosis, the three-question gate, the "Now you can"
> test, the Human Action Model, no AI tells), **copy-editing** (the seven sweeps),
> **cro** (the seven-dimension page analysis), **product-marketing** (positioning,
> four forces, objections), **marketing-psychology** and **offers** (the value
> equation).
> **Read against:** `docs/PRODUCT.md`, `docs/OPPORTUNITY-MATRIX.md`, `BRIEF.md`.
> **Companion:** [`.agents/product-marketing.md`](../../.agents/product-marketing.md) is
> the product-marketing context the skills read first. It was drafted alongside
> this review.

---

## 1. Verdict

**Diagnosis: B, real voice present.** The page has a point of view (Faida moves
first) and a recognisable voice. It uses plain words ("Say STOP and it stops"),
Kenyan specifics (Cucu, the M-Pesa PIN, ward offices) and honest labels
("Example, not a real user."). The job is to keep that voice and fix what's
missing. A rewrite would throw away the best thing about the page.

**What works and should stay:**
- The day story. It shows the product instead of describing it, and every chapter
  has Faida speak first.
- "You stay in charge" with the four levels. It is the best objection handling on
  the page.
- The promises list ("Faida never sees or asks for your M-Pesa or bank PIN.").
- The receipt and the stamp as one memorable device.
- The bilingual switch, the speed (about 115 KB) and the contrast.

**The five changes that matter most, ranked by likely impact:**

1. **Make the need felt.** Today the page sells a pleasant mechanism (Faida
   watches, matches, applies), but it never shows what a visitor is losing *now*.
   Missed windows, penalties, cyber café fees, scams and money already in their
   name are all in the matrix and none are on the page. Without that beat there's
   no reason to act today. See §2.
2. **Promise what the first chat delivers.** A visitor who taps the button meets
   today's bot. That bot rejects voice notes ("I can only read typed text right
   now") and doesn't submit anything. The page shows both happening. With a
   scam-wary audience, the first broken promise loses them for good. See §4.
3. **Answer "is this a scam?" before they tap.** An unknown WhatsApp number that
   says "you qualify, shall I apply?" is exactly what fraudsters send. The page's
   reassurance is real but sits eight screens down. Move it next to the CTA. See
   §3.1 and §3.8.
4. **Speak the customer's words.** "On offer", "take it up", "eligible", "opted
   in", "good standing" and "standing OK" are product-doc words. People say
   bursary, fund, kazi, apply, claim and closes. See §5.
5. **Put the consumer story first and give organisations their own room.** The
   organisation chapter sits between the peak and "You stay in charge", so a
   worried visitor has to read a pitch to counties before their own fears are
   answered. See §6.

---

## 2. Why this is an essential need, and how to show it

### 2.1 The argument

The page has to take people from "nice to have" to "I'm losing out without
this". The material is already in the product doc and the matrix. The essential
need rests on four facts:

1. **Every household has a reason.** A child in school (bursaries, HELB), a
   parent getting older (Inua Jamii at 70), someone looking for work (jobs,
   training, and fake adverts), a small business (permit, KRA, funds, tenders), a
   farm (subsidised fertiliser needs farmer registration). Anyone with a KRA PIN
   has a return due every June. Faida isn't for a niche. It's for whoever in the
   house has one of those moments, and many houses have more than one.
2. **Timing decides who gets it.** Windows are short and local: the Teso North
   NG-CDF bursary was open for 6 days, Climate WorX registration ran about two
   weeks, and Inua Jamii drives come and go. Hearing late is the same as not
   qualifying. (Matrix §6.1: "Timing is the product.")
3. **The workaround costs money and puts you at risk.** People pay a cyber café
   or a broker, hand over their ID and passwords, and get no record. Fake KDF,
   police and TSC adverts take money from exactly the people Faida is for.
4. **Some of it is already yours.** UFAA reportedly holds tens of billions of
   shillings in unclaimed assets. There's no deadline, and nobody knows to look.
   (Matrix §6.5 calls this "the strongest story for marketing".)

In the skills' terms (**marketing-psychology**), the page leans on gain framing
("good news", "brings you yours"). For low-income visitors, **loss aversion** is
the stronger lever, used honestly: a bursary that closed while you didn't know,
a penalty you didn't need to pay. **Status-quo bias** is the real competitor,
because doing nothing feels free. Missing out has to become visible before
switching is worth it.

### 2.2 Show it without inventing statistics

The brief's rule "no invented statistics" stands. The page can still make the
need concrete in three honest ways:

- **Let the reader qualify themselves.** Use a checklist of life moments in the
  reader's own words (the matrix §4 table, rewritten). The visitor ticks their
  own boxes, so the page never claims "most Kenyans qualify".
- **Use sourced facts with a source line.** The 6-day bursary window, UFAA's
  unclaimed billions, the KDF/NPS/TSC scam warnings and AGPO's 30%. Each has a
  citation in the matrix. Check each against the official source before
  publishing (the matrix's Caveats).
- **Use concrete amounts in the examples.** "The Kisumu County youth fund opens
  today" leaves the value unseen. "Up to Ksh 50,000" makes it real, as long as
  the example is labelled and the amount matches a real scheme. (Value equation:
  name the *dream outcome* specifically.)

### 2.3 Proposed new section: "Which of these is happening at home?"

Place it straight after the hero and replace the current "gap" intertitle with
it (that intertitle moves, see §3.2). This section carries the essential-need
argument.

> **Which of these is happening at home?**
>
> - A child finishing Grade 9, Form 4 or college → bursaries, HELB, scholarships
> - A parent or grandparent turning 70 → Inua Jamii, a monthly payment
> - Someone looking for work → jobs and training, checked for scams
> - A kiosk, salon, shop or boda → permit, KRA, youth and women funds, tenders
> - A baby on the way → SHA maternity cover, a birth certificate
> - Planting season → farmer registration for subsidised fertiliser
> - A death in the family → succession, NSSF survivor benefits, money left behind
> - A KRA PIN → a return due by 30 June, every year
>
> Each one opens something, and most of it closes on a date. Faida tells you
> before it does.
>
> **[See what I qualify for]** *Free on WhatsApp. Six quick questions.*

Notes:
- "Six quick questions" is true today (the bot's profile has 6). It lowers the
  effort the visitor expects, so it goes right under the button (**cro**:
  friction; **psychology**: activation energy).
- Check the school transitions (Grade 9 to 10 under CBC, Form 4) and the 30 June
  KRA date before launch.
- Each line can become a tappable chip that opens WhatsApp with that moment
  pre-filled ("Hi Faida, my mother is turning 70"). That's a cheap way to
  personalise the first chat and to measure which moments pull hardest.

---

## 3. Section by section

The **copywriting** three-question gate was applied to each unit: Can the reader
picture it? Can it be proven true or false? Could a competitor write the exact
same sentence?

### 3.1 Title page (hero)

| Unit | Current | Assessment |
|---|---|---|
| `<title>` | "Faida: before you ask, it is handled" | Passive and abstract. It doesn't match the H1 and says nothing a search result can use. |
| Meta description | "Faida is your agent for everything on offer: grants, jobs, training, bursaries, cover, payouts and more, from every source. It brings you what fits first and takes it up with your OK. And it helps every organisation…" | 270+ characters, so it gets cut off. It mixes in the B2B pitch and uses jargon ("takes it up"). |
| H1 | "Everything on offer. Faida brings you yours." | Ownable ("yours" pays off on the board). But "on offer" is abstract and reads as shopping. Without the board the reader can't picture it. The "Now you can" test gives "…be brought yours", which is weak. The vision is there, but not the discomfort or the path. |
| Board | Example tags, with yours marked YOURS | The strongest visual on the page. Keep it. The tags use real institution names (UFAA, NG-CDF, Ministry of Labour, Kisumu County) beside a small "Examples" caption, which can read as affiliation. Make the caption stronger (see below). |
| Subhead | "From government, your county and ward, NGOs, SACCOs, employers and colleges. Faida watches it all, tells you what fits, and takes it up when you say yes." | Leads with the supply side (who offers), which is the company's view. The reader cares about what they get and when. "Takes it up" is jargon. |
| CTA | "Get Faida on WhatsApp" | Clear, and WhatsApp is the right word. It names the channel, not the gain. |
| Microcopy | "Say hello once. Then Faida does the looking." | Good, and on-message. |
| Secondary | "My organisation has something to offer" | Fine as a quiet text link. |
| Missing | Any reassurance next to the CTA | Free? Safe? Is it the government? Will it ask for my PIN? All answered, but far below. |

**Headline options** (each run through the "Now you can" test):

- **A. Keep the H1 and fix the rest.** "Everything on offer. Faida brings you
  yours." with the new subhead and CTA below. *Rationale:* least change, keeps
  the brand line and the board's payoff, and the subhead carries the clarity.
  Recommended for launch.
- **B. "Find out what you qualify for, before it closes."** *Now you can find out
  what you qualify for before it closes:* compelling and true today. It names
  the discomfort (closing dates) and the path. *Rationale:* the clearest option
  and the best fit for paid and social traffic. Test it against A.
- **C. "Bursaries, funds, jobs, Cucu's Inua Jamii. Faida tells you first."**
  *Rationale:* the visitor can picture each item. It's longer, and it lists, so
  use it as a variant for traffic from a specific campaign (such as a bursary
  season ad).

For the Kiswahili H1, the brand name means "benefit". A native speaker should
try a line that uses it, such as *"Kila faida ina mwenyewe. Hii ni yako."*
(roughly "Every benefit has an owner. This one is yours."). Treat that as a
direction to test, not final copy.

**Proposed subhead:**
> Bursaries, youth funds, jobs, Inua Jamii for your parents, and money already
> in your name. Faida checks what you qualify for, tells you before it closes,
> and applies when you say yes.

(Once submission is live, keep "applies when you say yes". Until then, use
"fills in the form for you". See §4.)

**Proposed CTA and microcopy:**
> **[See what I qualify for]** (WhatsApp icon stays)
> Free on WhatsApp · Six quick questions · Faida never asks for your PIN

**Board caption:** "Examples of the kind of thing Faida finds. Faida is
independent and isn't run by any of these organisations." This is honest and
heads off "is this the government?" (§3.8). `[NEED: legal check on using
institution names in the hero]`

**Title and meta:**
> `<title>` Faida: find out what you qualify for, on WhatsApp
> `description` Bursaries, youth funds, jobs, Inua Jamii and deadlines like KRA,
> matched to you and your family. Faida tells you first and fills in the forms.
> Free on WhatsApp.

### 3.2 The gap (intertitle)

Current: "People never hear what's on offer. / Those offering can't find their
people. / Faida brings them together. Nobody has to go looking."

Two problems. Line two speaks to organisations in the middle of the consumer
story. And the gap is described from above, not felt from inside. It also
repeats the hero's idea without adding a cost.

**Proposed (consumer side, scenes the reader recognises):**
> The bursary forms were at the ward office for six days. Nobody told you.
> The job advert asked for a "registration fee". It was fake.
> The cyber filled in your form, kept your password and gave you no receipt.
> **Faida tells you first, checks it's real and keeps the receipt.**

Then the life-moments section (§2.3) follows. Move the two-sided line ("Those
offering can't find their people") to the top of the organisation chapter, where
it belongs.

### 3.3 The day (6:40 am to 5:40 pm)

The day works: one idea per chapter, Faida speaks first, and examples are
labelled. Changes:

- **6:40, "Good news before breakfast."** Keep the heading. Add the deadline and
  the amount to the message so that timing and value show:
  "The Kisumu County youth fund opens today and closes Friday. You qualify for up
  to Ksh [amount]. Shall I apply for you?" `[NEED: a real scheme and amount for
  the example]`
- **8:05, "Answer however suits you."** It promises voice notes, SMS and USSD,
  and none of them work today. A visitor who acts on this chapter by sending a
  voice note is refused. Either ship voice transcription before launch (the bot
  already calls Claude/OpenAI, so it's a contained change) or cut voice and keep
  this chapter about text in English or Kiswahili. Mark SMS and USSD "coming".
- **12:30, "For the people you look after."** The best chapter for the essential
  need. It's the one that makes Faida a family thing, not a me thing. Consider
  moving it to second place. Change "with their permission" to "with Cucu's OK".
  It's warmer and still true.
- **3:00, "It keeps you in good standing."** "Good standing" is formal and the
  reader can't picture it. Proposed: **"Taxes and permits, filed before the
  fine."** Change "Wanjiru gave one standing OK for tax, with a limit" to
  "Wanjiru said yes once for her tax return, up to a limit she set."
- **5:40, "It follows up so you don't have to."** Fine. The lede ends in a list
  of three ("training days, reports, repayments"). Keep it, but cut the other
  lists in this chapter (see §5).
- **Add "money already yours."** The matrix (§7) recommends it, the board
  teases it ("Money held in your name"), and the day never pays it off. Either
  swap 5:40 for it or add a short beat: "Faida found Ksh [x] from an old bank
  account in your name, held by UFAA. Shall I prepare the claim?" This is the
  page's most surprising, most shareable moment. `[NEED: confirm the UFAA claim
  route Faida can support]`
- **Add "Is this real?"** It could be one message in an existing chapter: Wanjiru
  forwards a "KDF recruitment, pay Ksh 3,000" advert and Faida answers "This is
  fake. KDF never charges to apply." That shows the verification promise in
  action instead of asserting it.

### 3.4 The peak (9:00 pm)

- "The day, tallied." works as a beat, and the receipt carries it.
- The lede "This is a day of paperwork when you never had to go looking." is
  awkward. Proposed: **"Five things done. Wanjiru said yes three times, and
  never once went looking."**
- CTA "Let Faida find you" is good and on-message. Keep it. Add the same
  microcopy as the hero ("Free on WhatsApp · Six quick questions").
- This is the emotional high point (**psychology**: peak-end rule), so the
  objection answers should come straight after it. Today the organisation chapter
  comes next. See §6.

### 3.5 The other side of the counter (organisations)

The copy is good and the "Fair by design" line is a real differentiator. The
problem is the room it's in and what a buyer needs from it:

- **Placement.** Move it after the FAQ, or better, give it its own `/partners`
  page with a short teaser here. A county officer and a mama mboga need
  different proof (**copywriting**: the Perception Gap). One page that serves
  both reads as written for neither.
- **Lead with the buyer's metric.** Organisations pay for completed uptake, not
  reach (matrix §6.7). Proposed heading: **"Reach the people your offer is for,
  and get complete applications back."**
- **Six benefit blocks is too many.** Merge them into three:
  1. **List it once:** a form, WhatsApp or your system.
  2. **The right people hear first:** eligible residents or members who opted
     in, told in their language, under your name.
  3. **Applications arrive complete and checked:** with a report of who was
     told, who applied and who was approved.
- **CTA.** "Talk to us" opens an empty `mailto:` (`CONFIG.orgEmail` is blank).
  Proposed: **"List an offer"**, or **"Start a pilot in one ward"**, which is a
  concrete, low-risk first step for a county or SACCO. `[NEED: what a pilot is,
  and the price model to mention]`
- **Proof.** Name pilot partners as soon as any exist. Until then, use the
  sourced AGPO-capture and scam facts to explain why verified applicants
  matter.

### 3.6 You stay in charge

The strongest section. It shows the consent model, it's interactive, and it
answers the biggest objection. Changes:
- Move it straight after the peak (§6).
- "Nothing is sent without your YES, unless you allowed it." Tighten to "Nothing
  is sent without your YES, unless you've said yes to it in advance." It's longer
  but clearer. Or keep the original and rely on the levels above it.
- Add **"Faida will never ask you to pay to receive a benefit."** It's the most
  common scam pattern, and the FAQ already says it for government recruitment.
- "Faida only brings you offers it has checked are genuine." This needs a
  verification process at launch (§4).

### 3.7 Everything on offer

- **"If it's on offer, Faida knows about it."** is an absolute claim. The
  catalogue has about 30 curated benefits plus approved scraped items.
  Alternatives you can stand behind: **"If it's on offer, Faida is looking for
  it."** or, once there's a count, **"[N] things open in Kisumu this week."** A
  live number is the best proof this section could have.
- **"From every source, in all 47 counties"** can't be backed up yet (§4).
- **"Most of what's on offer in Kenya goes unclaimed for one reason"** has no
  source. Replace it with a sourced fact: "UFAA holds billions of shillings in
  unclaimed money for Kenyans, and most people never check." (check the current
  figure first).
- **The two long lists** (16 offer types, 12 sources) are honest about range
  but slow to scan (**psychology**: Hick's law). With the life-moments section
  (§2.3) doing the selling, this section can shrink to one compact grid of offer
  types. Fold the source list into one line ("from national government to your
  SACCO, your ward and your employer") plus the open-ended "and anyone else
  offering something to people".

### 3.8 FAQ

The existing answers are clear. Add the questions this audience actually asks
before tapping:

- **"Is Faida from the government?"** "No. Faida is an independent Kenyan
  service. The rules for each offer come from the organisation offering it, and
  Faida applies through their official channels." This is the most important
  missing answer, because brokers and scammers claim to be official.
- **"How does Faida make money if it's free?"** Answer honestly: organisations
  pay to reach the people their offers are for, and filing for you may carry a
  fee shown in Ksh first. People trust free more when they know who pays.
- **"Will Faida message me all the time?"** "Only when something fits you or a
  deadline is close. Reply 'not now' or STOP." State the frequency cap once it's
  decided.
- **"What if Faida gets something wrong?"** `[NEED: the policy]`
- **Tighten "Does it cost anything?"** "may carry a small fee" is vague, and
  vague prices read as hidden ones. Until pricing is decided: "Finding out what
  you qualify for is free. If you ask Faida to file for you and there's a fee,
  you'll see it in shillings before you say YES." `[NEED: pricing decision]`
- **"Is my information safe?"** Name the command: "Type 'delete my data' at any
  time." It works today and is more believable than a general promise. Add the
  ODPC registration number once registered.

### 3.9 Colophon

- "Built in Kenya." Add the person: "Built in Kenya by Munene and team." Add a
  real contact. A named human is the cheapest trust signal available before
  launch (**cro**: trust signals). `[NEED: what the team is comfortable
  publishing]`
- The footer needs a privacy page link (already flagged in `docs/landing/README.md`).

---

## 4. Claims audit

The brief says the page sells the finished product. The **copywriting** skill's
rule is that claims must be supportable, and that a declined claim names the
evidence that would unlock it. The stakes are higher here than on most pages:
the CTA puts the visitor straight into the real product, so any gap shows up in
the first minute.

| Claim on the page | Where | True today? | Say until it is | Unlocked by |
|---|---|---|---|---|
| "Shall I apply for you?" … "Done." | 6:40 | No. The bot guides and exports a PDF; it doesn't submit | "Your form is filled in. Here it is to send." or mark the chapter "Coming 2027" | Consent flow and a submitting executor for that scheme |
| Reply "by voice note" | 8:05, FAQ | **No. The bot replies that it reads text only** | Text in English or Kiswahili | Voice transcription in `src/bot/index.js` |
| SMS and USSD channels | 8:05, 12:30, FAQ | No | "Coming soon" | SMS provider; USSD partner |
| Renews permits, files KRA, pays via M-Pesa | 8:05, 3:00, levels | No | "Reminds you before it's due" (reminders exist) | Obligations engine, payment flow |
| Family members (Cucu) | 12:30 | No | Keep as "coming" or ask on the profile | Proxy profiles with consent |
| Tracks application status | 5:40 | Partly (admin sets status) | "Tells you when there's news" | Case engine |
| "Every offer is checked" / "only brings offers it has checked are genuine" | Promises, Everything on offer | Partly: curated and admin-approved items only | "Every offer is checked by our team before it reaches you" | A written verification process |
| "Ask 'is this real?'" | Everything on offer, FAQ | No | Drop until live | The verification feature |
| "If it's on offer, Faida knows about it" / "all 47 counties" | Everything on offer | No (~30 curated) | "Faida is looking for it" | A live offer count by county |
| "Most of what's on offer in Kenya goes unclaimed" | Everything on offer | Unsourced | A sourced UFAA line | A citable study, or the UFAA figure |
| "Delete your details at any time" | Promises, FAQ | **Yes** ("delete my data") | Keep, and name the command | — |
| "Never sees or asks for your PIN" | Promises | Yes by design | Keep | Keep true at every step |
| Organisations list "through a form or on WhatsApp", "shows who it would reach" | Organisations, FAQ | No (admin dashboard only) | "Tell us about your offer and we'll set it up with you" | The offer-listing desk |
| "May carry a small fee" | FAQ | Undecided | See §3.8 | Pricing decision |

**Recommendation:** run two versions.
- **The consumer page at `/`** promises what a new user gets in their first chat
  today (matching, reminders, forms filled in, delete my data), with clearly
  labelled "coming" items. Here the message has to match what the visitor gets
  when they tap. That's the **cro** skill's first principle, applied between page
  and product.
- **The full-vision page** (this one, nearly as is) goes to investors, funders
  and partners, at `/vision` or as the `/partners` page.

As each "unlocked by" item ships, move its chapter from the vision page to the
consumer page.

---

## 5. Line-level sweep

**Customer language (Sweep 1, clarity).** Replace these on consumer copy:

| Current | Use instead |
|---|---|
| "take it up", "takes it up for you" | "applies for you", "claims it", "registers you" |
| "everything on offer", "offers" | name the thing: bursaries, funds, jobs, cover; or "what you qualify for" |
| "eligible people who opted in" | "people who qualify and asked to hear" |
| "in good standing" | "up to date", "no fines" |
| "standing OK" | "said yes once, up to a limit" |
| "listing" (consumer side) | — (keep for organisations only) |

**Who the sentences are about.** "Faida" appears 55 times in about 1,500 words
of English copy, and Faida is the subject of most sentences ("Faida watches",
"Faida brings", "Faida checks"). In ledes and promises, rewrite a share of them
around the reader: "You hear first", "You get a receipt", "You choose how much it
does". The chat bubbles are fine as they are.

**AI tells (the copywriting skill's blacklist):**
- *Lists of three* in nearly every section ("training days, reports,
  repayments"; "tax returns, licences, permits, contributions"; "where you live,
  your work, your family"; "who was told, who applied, who was approved"; "tells
  you first, checks it's real and keeps the receipt"). Keep at most one per
  section.
- *Contrast reveal:* "…reaches the people it was meant for, not the well
  connected." It's a good line. Keep it, but make it the only one.
- *Colon reveal:* "Fair by design: people choose…" Acceptable as a label. Leave
  it.
- No em dashes, exclamation marks or stock openers. Good.

**Prove it (Sweep 4).** No unsourced numbers apart from the "Most … goes
unclaimed" line (§3.7). Keep the brief's rule.

**Specificity (Sweep 5).** Add amounts and closing dates to the example chats
(§3.3). Change "a small fee" to a number when it's decided.

**Zero risk (Sweep 7).** Risk reversal near the CTAs is missing (§3.1, §3.4).

---

## 6. Presentation and conversion (cro)

**Section order.** Current: Hero → Gap → Day (6) → Organisations → In charge →
Everything on offer → FAQ → Close.

Proposed, following the Human Action Model (discomfort → vision → path) and
answering objections at the point of decision:

1. Hero: vision and path, with reassurance next to the CTA
2. The gap, rewritten: discomfort the reader recognises
3. **Which of these is happening at home?** The essential need, self-qualified. CTA
4. The day: the vision, shown (including money already yours and "is this real?")
5. The peak. CTA
6. **You stay in charge:** objections answered at the decision point
7. What Faida finds: compact
8. FAQ, including the new questions
9. Close, with a CTA
10. Organisations, or a link to `/partners`

**Above the fold.**
- At 360×640 (a common budget Android size) the WhatsApp button is below the
  fold. Shorten the hero board to one row on small phones, or move the CTA above
  the board on screens under about 700px tall.
- On phones the hero stamp overlaps the EN/SW switch at the top right. Move the
  stamp or shrink it there.
- The receipt chip reads "6:00 · 0 done" on first view. It means nothing yet and
  is the first thing a phone user sees. Hide it until the first chapter starts.
  On desktop, the empty receipt in the margin reads "Wanjiru's day. Example, not
  a real user." above blank paper. Same fix.

**CTA hierarchy.** It's clear: one filled consumer button, quiet links for
organisations, and a sticky button on phones. Two launch blockers:
`CONFIG.whatsappNumber` and `CONFIG.orgEmail` are empty in `app.js`, so the
buttons open WhatsApp's chooser and a blank email.

**Length.** About 16,600 px on a 390 px phone, roughly 20 screens. That's fine
for a story page, provided there's a CTA after the life-moments section and the
peak (the sticky button already helps). The cuts in §3.5 and §3.7 bring it down
by about a fifth.

**Trust signals.** None yet, honestly. Add them in this order as they become
true: a verified WhatsApp business name, the ODPC registration number, a named
founder or team, partner names, a live count of offers or cases.

**Measure.** There's no analytics on the page. Add a privacy-respecting counter
(no third-party cookies, to keep the speed promise) for button taps by position.
Each WhatsApp link can carry a `?text=` variant per CTA ("Hi Faida" vs "Hi Faida
(bursary)") so the bot can attribute first messages.

---

## 7. Test ideas

| Test | Hypothesis | Metric |
|---|---|---|
| H1 A vs B (§3.1) | "Find out what you qualify for, before it closes" beats "Everything on offer" for cold traffic | CTA tap rate; profile completion |
| CTA "Get Faida on WhatsApp" vs "See what I qualify for" | Naming the gain lifts taps | CTA tap rate |
| Reassurance line under CTA, on vs off | "Never asks for your PIN" cuts scam hesitation | CTA tap rate; first-reply rate |
| Life-moment chips vs one button | A pre-filled moment lifts first-chat completion and tells us which needs pull | Profile completion by moment |
| Lead story: Wanjiru (business) vs a parent-and-Cucu day | The family angle widens appeal | Tap rate by traffic source |
| UFAA "money already yours" chapter on vs off | The surprise drives shares | Shares/forwards; taps |

Test only with enough traffic to read a result. Before then, five short
interviews at a cyber café, asking "What is this? Would you tap it? What worries
you?", will teach more than any split test.

---

## 8. Open items for the team

- `[NEED]` Pricing: what (if anything) a user pays, and when.
- `[NEED]` Whether to split into a consumer page and a vision/partners page (§4).
- `[NEED]` Real example amounts and closing dates for the day's schemes.
- `[NEED]` The verification process behind "checked as genuine".
- `[NEED]` Legal view on naming institutions in the hero board.
- `[NEED]` What the team will publish about itself (names, ODPC number).
- `[NEED]` A native Kiswahili review, including whether the H1 can use the word
  *faida*.
- `[NEED]` 10–20 verbatim quotes from real users, to replace guessed customer
  language in `.agents/product-marketing.md`.
