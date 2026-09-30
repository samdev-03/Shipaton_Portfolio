# Rehearsal Room — Next Gen judging guide

Rehearsal Room helps new managers and early-career professionals practice a difficult workplace conversation before the real meeting. The central interaction is **retrying one moment**: change a response, explore a different branch, then reflect on readiness.

Student entrant and owner: **Alessandra Ascarza**. The product reflects her ideas and creative direction, with contracted technical assistance for implementation and release operations. The entrant confirmed active student status, academic Devpost email and ownership on September 30, 2026. The academic address is provided privately to the organizers.

## Start here

- [Public MIT source](https://github.com/samdev-03/Shipaton_Portfolio) and [license](../../../LICENSE).
- [Live web companion](https://rehearsal-room-api-tooj.onrender.com), useful for the free guided workflow. This is a companion; the submitted mobile app is iOS.
- Native release: **1.0.0 (2)**, built and installed through TestFlight. App Store publication is pending.
- [Original native home screenshot](native-captures/home-1179x2556.png), [readiness and mode selection](native-captures/scenario-1179x2556.png), and [guided response with retry](native-captures/practice-1179x2556.png): unmodified iPhone 14 Pro simulator PNGs, each 1179 × 2556 without device frames. [Capture provenance and hashes](native-captures/manifest.json).
- Native demo video is being prepared; this guide will link the final public demo when available.

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

Monthly and annual Apple products are mapped through RevenueCat's default offering. Purchase/restore code is implemented; the ledger distinguishes implementation, verified provider access, and actual native transaction testing. Complimentary review access is not counted as a purchase or revenue.

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

- [Automated verification](https://github.com/samdev-03/Shipaton_Portfolio/actions/runs/36263573313): 21 domain/API/provider tests, type checking, lint, browser workflows, and iOS/Android bundle exports passed for application commit `1f126a5`.
- Fresh production checks: account creation, free RevenueCat access verification, guided response, saved reflection, account deletion and invalidated session passed.
- A dedicated synthetic adult review account with verified Pro received a real AI reply and structured feedback. A synthetic WAV recording was successfully transcribed. Optional processing was disabled again and test practice removed afterward.
- Native simulator sign-in, scenario readiness, guided response and wording feedback were observed on September 30. Original screenshots are linked above. This does not establish successful purchase, restore, microphone access or the complete native workflow.
- TestFlight installation of native build 2 is verified. Native purchase, restore, microphone behavior and full device workflow results are being collected separately.

The API checks do not establish native purchase success, user outcomes, production revenue or App Store approval. [The evidence ledger](evidence.json) records these separately. No fabricated usage or growth metrics are supplied.

## Next learning step

Observe consenting early-career users completing a first rehearsal. Compare where they hesitate, whether they retry, and whether they can state a useful next sentence. Use that evidence to improve the opening prompt and feedback; do not infer career benefit from a synthetic test or an unvalidated score.
