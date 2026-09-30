# Rehearsal Room — Next Gen judging guide

Rehearsal Room helps new managers and early-career professionals practice a difficult workplace conversation before the real meeting. The central interaction is **retrying one moment**: change a response, explore a different branch, then reflect on readiness.

Student entrant and owner: **Alessandra Ascarza**. The product reflects her ideas and creative direction, with contracted technical assistance for implementation and release operations. The entrant confirmed active student status, academic Devpost email and ownership on September 30, 2026. The academic address is provided privately to the organizers.

## Start here

- [Public MIT source](https://github.com/samdev-03/Shipaton_Portfolio) and [license](../../../LICENSE).
- [Live web companion](https://rehearsal-room-api-tooj.onrender.com), useful for the free guided workflow. This is a companion; the submitted mobile app is iOS.
- Native release: **1.0.0 (4)** passed the tester-reported phone checks for recording/transcription, microphone-denial fallback, keyboard dismissal and send, reflection save/reopen, and disposable-account export/deletion. Build 4 and both subscriptions were submitted to Apple at **12:49 p.m. EDT on September 30** and are **Waiting for Review**. App Store publication remains pending.
- [Original native home screenshot](native-captures/home-1179x2556.png), [readiness and mode selection](native-captures/scenario-1179x2556.png), and [guided response with retry](native-captures/practice-1179x2556.png): unmodified iPhone 14 Pro simulator PNGs, each 1179 × 2556 without device frames. [Capture provenance and hashes](native-captures/manifest.json).
- [Watch the 90-second native iPhone demo](https://vimeo.com/1231760753), narrated by Alessandra Ascarza. It shows guided practice, wording cues, the retry control, saved reflection, Pro options and privacy controls. Real footage is edited for pacing, with some frames held for readability; English captions are included. The recording shows the retry control, while the complete retry path is covered by the source and workflow tests below.

The public demo has been upgraded from the original higher-resolution iPhone recording without changing the approved content. A captioned [YouTube mirror](https://youtu.be/mEiuTSCOYX4) is also available. The Devpost entry is submitted. Google Play preparation encountered a 12-tester / 14-day production gate; Android store publication is not claimed.

## Where the Next Gen criteria appear

| Criterion | What to look for |
| --- | --- |
| Clear, useful idea | A new manager can rehearse a workload boundary and leave with a concrete next sentence. The focused retry makes changing one response the central action. |
| Meaningful working progress | The native walkthrough connects readiness, response, feedback and saved reflection, and shows the retry control. Source and workflow tests cover executing a retry. Dated phone and automated test evidence appears below. |
| Thoughtful RevenueCat use | Two useful scenarios stay free; one entitlement covers both subscription durations. [Purchase/restore UI](../../src/app/pro.tsx), [SDK integration](../../src/lib/sdk.ts), and [server verification/webhooks](../../server/app.mjs) show the complete boundary. |
| Product and technical care | Optional AI consent, age enforcement, encrypted stored content, export/deletion, stale-update protection, and regression tests address risks created by private rehearsal data and native lifecycle changes. |

## What to inspect

1. Choose **Workload**, one of two free guided scenarios, and set initial readiness.
2. Enter a fictional response such as “I cannot take on another project.” Read the short wording cue.
3. Retry that response with a concrete alternative, such as “I can finish the deck tomorrow if we move the report to Friday. Which is the priority?”
4. Finish, reflect on readiness, and reopen the saved practice. Readiness is self-report, not a validated assessment or a prediction of career outcomes.
5. Inspect the native Pro page: all six scenarios, monthly and annual offerings, localized prices, purchase and restore controls.
6. With verified Pro on an adult account, explicitly enable AI to practice with a responsive counterpart or transcribe a voice response.

Guided practice is available from age 16; ages 16–17 require guardian permission. AI and transcription are enforced as adult-only on the server. Export and deletion controls are in Settings. Use fictional content for testing.

## RevenueCat and technical decisions

| Decision | Reason | Source |
| --- | --- | --- |
| Two free scenarios before Pro | A useful rehearsal can be completed before buying | `shared/catalog.ts`, `src/app/pro.tsx` |
| One `rehearsal_pro` entitlement for monthly and annual | Duration choices unlock the same feature set | `src/lib/sdk.ts`, `server/providers.mjs` |
| SDK purchase/restore followed by server reconciliation | A client-side flag cannot grant premium access | `src/app/pro.tsx`, `server/app.mjs` |
| Authenticated subscription webhooks | Subscription state can be reconciled independently of the device | `server/app.mjs`, `tests/api.test.mjs` |
| Retry replaces the following branch; updates use versions | Conflicting or stale requests must not overwrite newer practice | `server/app.mjs`, `tests/api.test.mjs` |
| Encrypted stored content and explicit processing consent | Practice can be sensitive; optional processing is a user choice | `server/store.mjs`, `server/providers.mjs` |
| Structured AI output, `store: false` | Keep feedback focused and validate the response shape | `server/providers.mjs`, `tests/providers.test.mjs` |

Monthly and annual Apple products are mapped through RevenueCat's default offering. The iPhone tester reported successful purchase and Restore Purchases in TestFlight build 2 on September 30. These are sandbox transactions, not production revenue. Complimentary review access is not counted as a purchase or revenue.

The server can decrypt stored content; this is not end-to-end encryption. Account email is not verified identity. OneSignal and Layers integrations exist in source but are not enabled in the current release; no delivered campaign or experiment result is claimed.

## Reproduce the free workflow

Use Node.js 24. From a fresh checkout:

```sh
cd portfolio
npm ci
node scripts/dev.mjs rehearsal
```

Open the Expo web URL printed in the terminal. Create a fictional account, save the recovery code privately, and choose Workload. No provider key is needed for free guided practice. Local development uses a development-only database key; do not expose it as a production service.

For a native build, follow [the release setup](../RELEASE.md). Expo Go cannot load this app's native RevenueCat, OneSignal and Layers modules. Use an EAS build or an appropriately configured local native build. Optional paid integrations require your own provider accounts and credentials from `.env.example`; secrets are intentionally excluded from the public repository.

## Verification as of September 30

- [Automated verification](https://github.com/samdev-03/Shipaton_Portfolio/actions/runs/36744492396): 31 domain/API/provider/voice-lifecycle/native-privacy tests, type checking, lint, browser workflows, and iOS/Android bundle exports passed for source commit `6ef2f60`.
- Fresh production checks: account creation, free RevenueCat access verification, guided response, saved reflection, account deletion and invalidated session passed.
- A dedicated synthetic adult review account with verified Pro received a real AI reply and structured feedback. Synthetic WAV and AAC recordings were successfully transcribed. The AAC test reproduces the phone's MP4 content type; the server now supplies the M4A filename and MIME expected by the provider. Both MP4-labelled and M4A-labelled input returned the expected fictional words after deployment. Original processing preferences were restored and the test session ended afterward.
- Native simulator sign-in, scenario readiness, guided response and wording feedback were observed on September 30. Original screenshots are linked above. This does not establish successful purchase, restore, microphone access or the complete native workflow.
- The iPhone tester reported successful purchase, restore and AI conversation in TestFlight build 2. Two crash reports concerned microphone denial and finishing practice. Build 3 avoids native recorder access after disposal and adds keyboard dismissal controls; build 4 retains those fixes. A subsequent build 3 voice report exposed the format error now fixed on the server. On September 30, the tester explicitly confirmed all requested build 4 checks pass: recording/stop/transcription; denied microphone followed by typing, keyboard dismissal and sending; Finish and reflect followed by save/reopen; and disposable-account export/deletion. This is tester-reported evidence, not a measured user-outcome study.
- Inspection of the compiled build 4 IPA confirms no tracking usage declaration, advertising-network entries, advertising postback endpoint, or included privacy manifest declaring tracking. Microphone permission remains present.

The API checks do not establish native purchase success, user outcomes, production revenue or App Store approval. [The evidence ledger](evidence.json) records these separately. No fabricated usage or growth metrics are supplied.

## Next learning step

Observe consenting early-career users completing a first rehearsal. Compare where they hesitate, whether they retry, and whether they can state a useful next sentence. Use that evidence to improve the opening prompt and feedback; do not infer career benefit from a synthetic test or an unvalidated score.
