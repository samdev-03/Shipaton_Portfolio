# Rehearsal Room portfolio — release handoff

Delivered September 24, 2026. The archive contains an implemented and tested four-app release candidate plus submission preparation materials. It is **not yet deployed, signed, store-approved or submitted**.

## What is implemented

| Product | Working workflow | Intended prize emphasis |
| --- | --- | --- |
| Rehearsal Room | Career scenarios, guided practice, retry, feedback, reflection; optional Pro AI and transcription | Career, Design, OneSignal; Next Gen if eligible |
| Care Relay | Private circles, one-use invites, task claims, acknowledgment and handoffs | Peace |
| Meal Patch | Constraint-based meal additions, saved meals and Pro weekly planning | Nutrition |
| Quote to Cash | Itemized cleaning quotes, exact totals, expiring approval links and templates | Monetization; Replit and Stripe after genuine account work |

Shared code provides account recovery, encrypted content storage, consent controls, data export/deletion, RevenueCat purchase/restore and server verification, OneSignal reminders, Layers events and stable A/B assignment. Native subscription purchases use store billing; web subscriptions use the configured RevenueCat/Stripe Funnel. Quote approval does not collect a cleaner's service payment.

The source is structured for four distinct native builds, with independent icons, palettes, bundle IDs, projects and subscription entitlements. Free workflows run locally without third-party credentials. Live AI, billing, push and analytics need configured services.

## Open and run

Extract `Shipaton_Portfolio.zip`, open its `portfolio` folder in WebStorm or IntelliJ, and install Node.js 24. In the IDE terminal:

```powershell
npm ci
npm run api
```

Visit `http://localhost:8787` for the included review preview. Switch at `/?app=care`, `/?app=meal`, or `/?app=quote`. Create a fictional account and save its recovery code. There is no premium bypass. For source development, stop the preview server and use `node scripts/dev.mjs rehearsal`; substitute the other variant names as needed.

Read `README.md` for setup, `VERIFICATION.md` for test scope, and `TODO-RELEASE.md` for the release sequence. Use separate fixed-variant exports for public deployment; the combined preview is only for review.

## Validation completed

- 18 backend/domain/provider tests passed, including a regression that allows verified App Review sandbox purchases without counting sandbox purchase evidence.
- Four browser workflows passed against the actual API; eight real web-preview captures are included.
- TypeScript, lint and all 21 Expo Doctor checks passed.
- Web, Android and iOS JavaScript exports passed; Android config-plugin generation and a SQLite backup integrity check also passed.

These checks do not establish native device behavior or live integration readiness. Signed APK/AAB/IPA builds, real purchases, audio, notifications and device accessibility remain untested.

## Submission materials included

`docs/submission` contains four entry drafts, category strategy, timed demo scripts, a native acceptance checklist, a Replit Agent work brief, and a blank evidence ledger. `docs/store` contains four store listings, reviewer notes, a privacy/data-safety worksheet and capture instructions. `docs/growth` contains pricing hypotheses, an A/B experiment protocol, OneSignal campaign and Stripe Funnel briefs, twelve build-in-public post drafts and a metrics template. Icons and font licenses are included. No generated social posts have been sent, and no results are invented.

## What must happen before launch or entry

1. Confirm entrant eligibility, especially student status for Next Gen, and prioritize the entries you can actually release and support.
2. Configure owned bundle IDs, EAS/store projects, HTTPS deployment, operator/contact details, actual hosting/backup policy, secrets and durable storage.
3. Configure RevenueCat products and judge access; verify signed-device purchase, restore, expiry, refunds, microphone, push, consent and deletion. Follow the included device checklist.
4. Obtain the required public store release and prepare genuine device screenshots/video. Web screenshots and JavaScript bundles do not satisfy native evidence requirements.
5. Carry out genuine OneSignal, Layers, Replit and Stripe work for the categories selected; publish authentic build posts and collect actual revenue/usage evidence. Complete the ledger and entry fields before submission.

The flagship release checker currently reports **BLOCKED**, with 36 missing configuration/evidence declarations. This is intentional. Its checks cannot certify a store's approval, truth of external evidence or eligibility.

The official deadline is **September 30, 2026, 11:45 p.m. PDT — October 1, 06:45 UTC**. Store review and account-specific testing gates may prevent publication within that window. A qualifying Next Gen-only path does not make other store-dependent prizes eligible. See the [official rules](https://revenuecat-shipaton-2026.devpost.com/rules) and [FAQ](https://www.shipaton.com/faq).

No code or preparation kit can guarantee acceptance, eligibility, winnings or a maximum reward. The supplied strategy prioritizes a useful flagship, accurate submission claims, authentic learning and real commercial traction.
