# Rehearsal Room — entry draft

Status: copy prepared from the implemented release candidate. Replace bracketed evidence fields after launch; do not submit unverified claims.

**Tagline:** A little room to find your words before the real conversation.

## Inspiration

A difficult workplace conversation often starts long before the meeting: rehearsing in your head, avoiding the subject, or searching for the perfect sentence. Rehearsal Room gives new managers and early-career professionals a private place to say something imperfect, notice what could help, and try again.

## What it does

Choose a moment: an overloaded workload, overlooked contribution, compensation conversation, useful feedback, a career interview, or growing client scope. Respond to a counterpart, receive a small adjustment, and retry the exact moment you want to improve. A before-and-after readiness reflection records how you feel without presenting a psychological score as a fact about you.

Two guided scenarios are free. Guided mode uses transparent wording cues and fixed responses. Pro adds the full scenario library and, with explicit consent, a responsive AI counterpart and optional voice transcription. Speech playback lets you hear a response. Saved history, deletion and export keep the space under your control. Native reminders arrive only after consent and scheduling.

## How it was built

Expo Router and React Native provide the mobile app and a web companion. The Node 24 API enforces authentication, ownership and version checks. SQLite stores encrypted content. RevenueCat handles native purchases and restore; the server verifies access against subscriber state. OneSignal delivers generic reminders. Layers records optional non-content product events and a stable first-step copy experiment. OpenAI text responses use a structured schema with storage disabled; private text is excluded from growth events.

## A design decision worth seeing

Watch the retry interaction. It replaces a selected response and the following branch, allowing the person to work on one sentence instead of restarting. Soft colors, large touch targets, clear hierarchy, supportive language and a short feedback card keep the focus on practice. See `docs/DESIGN.md` for the design rationale and accessibility review.

## Challenges and learning

The key technical challenge was preserving trust at boundaries: stale edits cannot overwrite new practice, a client cannot grant itself Pro, and optional analytics cannot contain conversation text. Automated checks exercise those boundaries. The current implementation is a release candidate; native-device behavior and external delivery must be verified separately.

Observed user learning: [date, number of consenting participants, friction observed, concrete change, follow-up result].

## Category statements

Career: the product supports active rehearsal of ordinary managerial conversations, including boundaries and feedback. Its value is the next attempt, not a promise of promotion or income.

Design: show the home hierarchy, counterpart/you conversation layout, focused retry state, and gentle feedback. Do not claim unimplemented gesture or animation systems.

HAMM: two useful scenarios demonstrate value before Pro; pricing is localized from real products. [Insert Offering, trial configuration, dated paywall exposure and verified purchase results.]

OneSignal: [insert App ID, deployed campaign, consenting audience, delivery proof and what it changed].

Layers: [insert build/SDK verification, experiment sample and measured learning].

BuildInPublic: [link real posts and identify feedback that changed the product].

Grand: [first release date, RevenueCat export, acquisition costs if any, conversion/retention, experiments and next step].

Next Gen: [verified academic eligibility, public repository URL, license and video].

## Submission fields to complete

Store URL: [pending] · Demo URL: [pending] · Native screenshot: [pending] · Judge trial/promo instructions: [pending] · Public source, if applicable: [pending].
