# Faida landing: design brief

Self-authored under explicit creative delegation (the product owner asked for a
world-class result and left direction to the designer). Evidence comes from the
repo, `docs/PRODUCT.md` and the Faida Platform Proposal. Assumptions are marked.

## 1. The eight topics

1. **Vibe.** Plain, warm, trustworthy, a little bold. Closer to a good public
   noticeboard than a fintech site. Not premium-minimal, not startup-glossy.
2. **Journey.** Recognise yourself, see the gap, watch it close, see how it
   works, feel safe, (organisations: see what they get), see what is inside,
   get answers, start.
3. **Energy.** Loud at the open and the close, quiet through trust, busy in the
   middle where the bridge lives.
4. **Feeling and peak.** See the curve below. Peak: the bridge draws itself.
5. **One thing no other site does.** The visitor taps a person or a programme
   and the bridge between them draws itself from real eligibility rules.
6. **Range.** Editorial and plain, large type, high contrast. Chosen because
   the main audience reads slowly on small, bright, cheap screens.
7. **One world or scenes.** Distinct scenes joined by one motif: a thread
   (the bridge) that starts as a gap and ends as the logo.
8. **Assets.** None supplied. Everything is real markup, SVG geometry and two
   self-hosted fonts. No photos, no generated imagery, no fake screenshots.

## 2. Audience and the design consequences

| Reality | Consequence |
|---|---|
| Many users are not technical and use cyber cafes today | Words a cyber cafe attendant would use. No jargon. "Just ask." |
| Cheap Android phones, bright daylight, patchy data | Light ground, 15:1 body contrast, 135 KB total, no images, no third-party requests |
| Swahili is the first language for many | EN / SW switch in the corner of every screen, remembered |
| Low reading fluency for some | Lexend (built for reading ease), 17px+ body, short lines, one idea per screen |
| Enterprise buyers need their own proof | A full section for organisations, plus a dark ground so it feels like a different room |
| Trust is the real barrier | "You stay in charge" is its own quiet section, and the chat shows the YES moment |

## 3. Page grammar

**Split stage.** Two sides held in tension, resolved by scroll. Light ground =
people. Dark ground = organisations. One hue (green), two lightnesses, which the
skill allows for a page that hard-cuts between grounds.

Why the other seven lost: filmic one-shot and continuous world need footage we do
not have and would hide the argument behind spectacle. Chaptered editorial and
gallery are one-sided. Live surface is the right idea for the bridge section
only, and that is where its honesty rule is used (real rules over labelled
example data). Typographic poster and rhythmic cutlist have no way to hold two
audiences at once.

Nav: none. The seam is the chrome. Hero labels sit either side of it. Close: the
collapse (the seam's knot grows to fill the screen).

## 4. Feeling curve

| Act | Feeling | Caused by |
|---|---|---|
| Hero | Recognition, ease | "Just ask. Faida does it." Dots reaching squares across the seam |
| Gap | Unease, honesty | Both sides' daily frustrations, side by side, one sentence split across the seam |
| Bridge (peak) | Delight, understanding | Threads draw from a person to every programme that fits, with reasons for the ones that do not |
| How it works | Relief | A conversation that ends with "Sent" and a reference |
| Trust | Calm, confidence | Five plain promises, no motion |
| Organisations | Confidence (their side) | Three steps and a fair-by-design line, on the dark ground |
| Inside Faida | Reassurance | Real programme names, in plain lists |
| Questions | Ease | Seven short answers |
| Close | Resolve | The knot grows to fill the screen, then one action |

**Peak:** the bridge. It has the largest span on the page (3.8 viewport heights
against 2.6 for the conversation and 1.8 for the close). The gap before it is
the quietest act.

**The sentence a visitor would say to a friend:** "I tapped a person and it drew
lines to every grant they qualify for, and told me why not for the rest."

**Tell-someone sentence:** it is the site where you can watch the gap between
people and the programmes meant for them close.

## 5. Signature move

**The bridge draws itself.** Real eligibility rules (from
`faida-export/src/db/benefits.json`, simplified) run over four example people
and eight real programmes. Scroll steps through each person, then reverses to a
programme. Tapping either side takes over. Non-fits explain themselves
("Not a fit: age 62, needs 18 to 34"). It is two-way on purpose: it is the
product argument.

## 6. Device score

| Beat | Device | Why |
|---|---|---|
| Hero | Split + arcs drawn on load | Establishes the format at once |
| Gap | Flow + fill line driven by scroll | The gap closes as you read |
| Bridge | Pin + live rules + pointer | The peak |
| How it works | Pin, messages appear with scroll | Time passing in a conversation |
| Trust | Flow, sticky heading | Stillness |
| Organisations | Flow on dark ground | A different room |
| Inside Faida | Plain type lists | Proof without decoration |
| Questions | Disclosure list | Native, accessible |
| Close | Pin + clip-path reveal | The collapse |

No scrub video, no parallax, no kinetic type. Motion uses transform, opacity,
clip-path and stroke-dashoffset only.

## 7. Honesty rules applied

- No invented statistics. The only number on the page is 30 (the real count of
  programmes in the catalogue).
- Example people and the example conversation are labelled as examples on the
  page itself.
- Programme rules come from the repo catalogue and the page says to confirm with
  the provider.
- No testimonials, no logos, no "trusted by".
- **The page describes the agent Faida is meant to become.** Today the bot finds
  and prepares; it does not yet submit on a user's behalf. The conversation,
  the "You stay in charge" promises and the organisation steps are product
  commitments that must be true before launch.

## 8. Verified and not verified

Verified with a headless browser: desktop 1440x900 and 1366x700, phone 390x844
and 390x720, English and Swahili, reduced motion, no JavaScript, console clean,
rendered contrast measured on every text element (remaining flags were
measurement artefacts around rounded buttons and a fixed control).

**Not verified:** a real phone (touch scrolling, iOS Safari toolbar behaviour,
Low Power Mode), screen-reader pass, Swahili copy by a native speaker, any
network slower than local.
