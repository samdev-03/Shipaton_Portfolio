## Start with the working app

[Watch the 90-second native iPhone demo](https://vimeo.com/1231760753) · [Inspect the public MIT source and judging guide](https://github.com/samdev-03/Shipaton_Portfolio/blob/main/portfolio/docs/submission/NEXT-GEN-JUDGING.md)

The demo shows a real workload rehearsal, wording feedback, the retry control, saved reflection, and native monthly/annual Pro options. The judging guide maps the Next Gen criteria to implementation and dated test evidence. Rehearsal Room is submitted by student owner Alessandra Ascarza, whose product ideas and creative direction guided the project; contracted technical assistance supported implementation and release.

## Inspiration

A difficult workplace conversation often starts long before the meeting. We rehearse it in our heads, avoid the subject, or search for a perfect opening sentence.

Rehearsal Room gives new managers and early-career professionals a private place to say something imperfect, receive one practical adjustment, and try the moment again before the stakes are real.

## What it does

Choose a realistic workplace situation:

- Set a boundary when your workload is full
- Make an overlooked contribution visible
- Ask for a raise
- Give useful feedback
- Tell your story in an interview
- Clarify growing client scope

Respond in your own words, see a supportive wording cue, and continue the conversation. The central interaction is retry: select the exact response you want to improve and explore a different branch without restarting the entire rehearsal.

A before-and-after reflection records how ready you feel without pretending to measure your personality, employability, or career potential.

Two guided scenarios are available free from age 16, with parent or guardian permission required for ages 16–17. Rehearsal Room Pro adds the complete scenario library. Optional AI practice and voice transcription require explicit permission and an adult account (18+). Users can save, revisit, export, or delete their practice.

## How we built it

Rehearsal Room is built with Expo Router, React Native, and TypeScript, supported by a Node.js API and SQLite storage.

RevenueCat makes the paid boundary explicit: two useful guided scenarios are free, while Pro unlocks all six scenarios and optional adult-only AI practice. Monthly and annual Apple subscriptions map to the same rehearsal_pro entitlement through the default offering. The native SDK handles purchase and restore; the backend independently verifies access and processes authenticated subscription webhooks. The client cannot grant itself Pro. A live webhook check and complimentary entitlement verification passed. The iPhone tester reported successful purchase and Restore Purchases in TestFlight build 2; these were sandbox transactions, with no production revenue claimed.

The source includes optional OneSignal reminders and Layers analytics, but these services are not enabled in this release and no delivery or experiment results are claimed. Private rehearsal text is excluded from growth events. Optional AI responses use structured output, and AI processing remains disabled until the user explicitly enables it.

Authentication, encrypted stored content, expiring sessions, recovery codes, data export, account deletion, ownership checks, and stale-update protection are enforced by the API.

## A design decision worth seeing

The most important interaction is not a score—it is the next attempt.

Feedback is deliberately short and actionable. The interface uses gentle colors, large touch targets, clear speaker labels, and a focused retry state. Rather than judging someone’s personality, Rehearsal Room helps them test a different sentence.

## Challenges

The hardest part was preserving trust across system boundaries.

A stale client should not overwrite a newer rehearsal. A user should not be able to manufacture a premium entitlement. Optional analytics should never contain private conversation text. Notification retries should not produce duplicate reminders. Account deletion must remove content and queue deletion requests for connected providers.

The automated test suite exercises these boundaries alongside the core rehearsal workflow. TestFlight testing exposed two crashes around microphone refusal and leaving a practice. We isolated unsafe recorder access during cleanup, added nine lifecycle regression tests, and shipped safe cleanup and visible keyboard dismissal. A later voice report exposed a recording-format mismatch at the transcription provider; a synthetic AAC test reproduced it, and correcting the upload filename and MIME made the live test pass. The tester then confirmed that recording/transcription, microphone-denial fallback, reflection save/reopen and disposable-account export/deletion all pass on build 4.

## Accomplishments

We created a complete practice loop that moves from choosing a difficult moment to responding, receiving a useful adjustment, retrying one turn, reflecting, and saving the result.

The same codebase supports web review and signed native builds while keeping purchases, notifications, analytics, and optional AI processing behind explicit controls.

## What we learned

Our design hypothesis is that people preparing for difficult conversations benefit from trying one sentence, noticing what could improve, and immediately trying it again. This still needs validation with consenting users.

That hypothesis shaped the product around focused rehearsal, without personality scoring or promises about career outcomes.

## What’s next

As of September 30, the production backend is deployed, the source is public under the MIT license, and iOS 1.0.0 (build 4) has passed the final tester-reported phone checks. All 31 automated tests pass, together with type checking, lint, browser workflows and iOS/Android bundle exports. Live checks also passed for account creation, guided practice, saved reflection, subscription verification, real AI feedback, synthetic-audio transcription and deletion. The app, monthly and annual subscriptions, and subscription group were submitted to Apple at 12:49 p.m. EDT and are Waiting for Review. The [90-second native iPhone demo](https://vimeo.com/1231760753) is public, narrated by Alessandra and captioned in English. It shows the actual app, edited for pacing. The [Devpost entry](https://devpost.com/software/tbd-27jfd0) is submitted for the Next Gen Award, which evaluates the demo and public source without requiring a published store release.

Rehearsal Room is owned by active student entrant Alessandra Ascarza and reflects her ideas and creative direction. A contractor assisted with implementation and release operations. No production revenue, user-study outcome, or sponsor experiment result is claimed.

After launch, the first product experiment will test which starting prompt helps more users complete their first rehearsal while preserving the app’s supportive, privacy-conscious experience.

[Judging guide and implementation map](https://github.com/samdev-03/Shipaton_Portfolio/blob/main/portfolio/docs/submission/NEXT-GEN-JUDGING.md) · [Public MIT source](https://github.com/samdev-03/Shipaton_Portfolio)
