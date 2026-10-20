# Faida landing v2: design brief

Self-authored under explicit creative delegation. Replaces v1 (split stage, green,
"bridge draws itself"), which was scrapped on request and remains in git history
(commit 7f5f887). Evidence: the repo, `docs/PRODUCT.md`, the Faida Platform Proposal.

**This page sells the final state of Faida, not today's bot.** Everything shown is
the product Faida is being built to be: proactive outreach, voice and USSD, doing
the filing and paying on the user's behalf, family accounts, standing mandates,
partner enrolment. Examples are labelled as examples on the page.

## 1. The eight topics

1. **Vibe.** Sunlit, plain-spoken, a little bold. A Kenyan shop sign meets a
   printed feature. Confident but never cold.
2. **Journey.** The gap, then one ordinary day handled for someone, then the
   other side of the counter, then control, then everything on offer, then start.
3. **Energy.** Loud title page, a hard full-stop, then a steady human pace that
   builds to one peak at 9 pm, then a different room (cobalt) for organisations.
4. **Feeling and peak.** See the curve. Peak: the day, tallied.
5. **One thing no other site does.** A receipt in the margin that Faida stamps as
   each moment of the day completes, and that is totalled on stage at the peak.
6. **Range.** Editorial with signage energy. Large type, strong colour, hard cuts.
7. **One world or scenes.** Distinct chapters, one recurring object (the receipt)
   and one recurring act (the DONE stamp).
8. **Assets.** None supplied. All markup and SVG geometry, two self-hosted fonts.

**Faida moves first.** In every chapter Faida opens the conversation and the
person only answers. The page never shows a user having to know what to ask for.
The one thing a visitor starts is the first hello (the CTA), and the hero says so:
"Say hello once. Then Faida does the looking."

**The hero is the exchange in one picture.** Headline: "Everything on offer.
Faida brings you yours." Under it, a board of example offers from many sources
(county, NG-CDF, ministry, SACCO, UFAA, employer, co-op) drifts past in two rows;
the ones that fit Wanjiru are cobalt and tagged YOURS. It loops on transform only,
pauses off screen, and stands still with reduced motion or no JavaScript. The
board's offers are labelled as examples.

**Benefits and opportunities, not just funds and permits.** The day mixes
an opportunity (youth fund), a benefit nobody asked for (Inua Jamii for Cucu) and
obligations.

**Everything on offer, from every source.** The catalogue section is not a list of
named programmes (that reads closed). It is the shape of the exchange, from
`docs/OPPORTUNITY-MATRIX.md`: "If it's on offer, Faida knows about it", then two
lists, *what's on offer* (16 offer types with plain examples) and *who's offering
it* (12 kinds of source, "and anyone else offering something to people"). A
footer carries verification ("is this real?") and a link for organisations to
list an offer. The organisations chapter speaks to any offer, not just
programmes, and adds checking applicants against the offer's rules.

## 2. Audience and consequences

| Reality | Consequence |
|---|---|
| Many users are not technical and use cyber cafes today | The story is a day, not a feature list. Words are the ones a cafe attendant would use |
| Bright daylight, cheap phones, patchy data | High contrast, sun-yellow and paper grounds, no images, about 110 KB, no third-party requests |
| Swahili is the first language for many | EN / SW switch always reachable, all copy translated, remembered |
| Low reading fluency for some | Lexend body text, 17px+, short sentences, one idea per chapter |
| Basic phones | A chapter shows an SMS reaching a feature phone; USSD is named as a channel |
| Enterprise buyers need their own room | A full cobalt chapter for SACCOs, counties, NGOs, employers, with a listing sheet and fair-by-design terms |
| Trust is the real barrier | "You stay in charge" is interactive: four levels, the message changes |

## 3. Grammar: chaptered editorial

The page is a printed feature. Chapters are the unit. Each lands on its own ground
with a hard cut. No pinned acts. Nav is a folio in the margin (the receipt). The
hero is a title page: type on the ground, no media above the fold. The close is a
colophon with the call to action set as running lines.

Why the other seven lost: filmic and continuous world need footage we do not have.
Split stage was v1. Live surface suits a tool, and this is a service. Typographic
poster has too little room for the breadth. Gallery and rhythmic cutlist fit
neither the calm or the argument.

**Departures from the grammar, on purpose:** the hero has a filled CTA button
(low-literacy users need an obvious target), and a sticky CTA appears on phones
outside the chat chapters.

## 4. Feeling curve

| Chapter | Feeling | Caused by |
|---|---|---|
| Title page | Recognition, relief | "Everything on offer. Faida brings you yours." over a drifting board of offers from every source, with the ones that fit marked YOURS, then a stamp landing |
| The gap | Unease, honesty | Two sentences on ink, then the turn in yellow |
| 6:40 am | Delight | Faida messages first: you qualify, shall I apply? |
| 8:05 am | Warmth | Faida flags a permit before it lapses; Wanjiru answers with a voice note |
| 12:30 pm | Care, surprise | Cucu has turned 70 and qualifies for Inua Jamii; she gets an SMS on a basic phone |
| 3:00 pm | Calm | A ledger of obligations, all filed |
| 5:40 pm | Relief | A timeline where the office's request was already handled |
| 9:00 pm (peak) | Satisfaction, awe | The whole day tallied on a receipt, then stamped |
| The other counter | Confidence (their side) | Cobalt room, one listing becomes complete applications |
| You decide | Safety | Four levels, one tap each |
| Everything on offer / FAQ | Reassurance, ease | Plain lists, plain answers |
| Colophon | Resolve | Two big lines to tap |

**Peak:** the day, tallied. It has the tallest chapter, the darkest ground, the
quietest chapter just before it (a calm timeline) and the largest type on the page.

**What a visitor tells a friend:** "It does your whole day of paperwork and hands
you a receipt with five things done, and you only said yes three times."

## 5. Signature move

**The receipt.** A paper slip sits in the margin from the first screen. As each
chapter's moment finishes (a chat completes, a ledger fills) a line is stamped DONE
on it. On phones it folds into a chip: time and count. At 9 pm it leaves the margin
and prints on stage, line by line, with a total and a final stamp. It doubles as
the folio, so nothing else is needed for navigation.

## 6. Fingerprint check (against v1, the only prior build)

| Dimension | v1 | v2 | Differs |
|---|---|---|---|
| Grammar | Split stage | Chaptered editorial | yes |
| Nav treatment | Seam labels, fixed language pill | Receipt folio in the margin, language pill | yes |
| Hero device | 50/50 split with arcs reaching across | Title page, type only, stamp lands | yes |
| Act sequence | Hero, gap, pinned bridge, pinned chat, flow sections, pinned close, 14 vh | Eleven hard-cut chapters, no pins, 14 vh | yes |
| Close pattern | Knot grows to fill the screen | Colophon, CTA as running lines | yes |
| Signature move | Bridge draws from real rules | Running receipt | yes |

Six of six. World also differs: green, light and dark halves, Bricolage, versus
sun and cobalt, four grounds, Unbounded.

## 7. Honesty rules applied

- No invented statistics. The only numbers are the example day's own.
- Wanjiru, Cucu and every conversation are labelled as examples on the page.
- No testimonials, logos or "trusted by".
- **The page describes the finished product.** Before launch these must be true
  or the copy must change: Faida messages users first; accepts voice notes;
  works over SMS and USSD; files and pays on a user's behalf; manages family
  accounts; supports standing mandates with limits; never sees PINs; deletes data
  on request; enrols users into partner systems; "All 47 counties".
- "Every offer is checked before it reaches you", "Faida only brings you offers
  it has checked are genuine" and "Ask 'is this real?'" need a working
  verification process at launch.
- Every scheme named in the 12:30 chapter and in the "What's on offer" examples (Inua Jamii's
  70+ rule, the orphan and disability transfers, NCPWD and the disability tax
  exemption, HELB, NG-CDF bursaries, farmer registration and subsidised fertiliser,
  UFAA unclaimed assets, NSSF benefits) must be in the catalogue, with current
  eligibility rules, before launch.
- "Finding what fits you is free" and "may carry a small fee" are pricing claims
  taken from the proposal and not yet decided.

## 8. Verified and not verified

Verified headlessly: 1440x900 and 1366x700 desktop; 320, 360, 375, 390, 414 phones;
768, 1024, 1199, 1280, 1920 for horizontal overflow (none); English and Swahili;
reduced motion; no JavaScript; console clean; rendered contrast measured on every
text element (remaining flags were artefacts of borders, shadows, stamps and
markers inside element boxes).

**Not verified:** a real phone (touch, iOS Safari toolbars, Low Power Mode), a
screen reader, Swahili copy by a native speaker, slow networks.
