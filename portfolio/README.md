# Rehearsal Room · Shipaton portfolio

The active Shipaton submission is **Rehearsal Room**, a native iPhone app for practicing difficult workplace conversations. Its backend is deployed, and the tester confirmed the final voice, fallback, reflection and export/deletion checks pass on TestFlight 1.0.0 (4). The app and subscriptions are Waiting for Review at Apple. The current route is **Next Gen**; the [90-second native iPhone demo](https://vimeo.com/1231760753) is public with English captions. Start with the [Next Gen judging guide](docs/submission/NEXT-GEN-JUDGING.md).

The repository contains three additional prototypes sharing its Expo/React Native and Node 24 foundation. Their historical category plans below are not claims of separate completed submissions.

| Build variant | Implemented workflow | Intended entry focus |
| --- | --- | --- |
| `rehearsal` | Scenario → practice → feedback → retry → reflection | Next Gen; current active entry |
| `care` | Private circle → invite → claim → acknowledge → hand off or complete | Peace |
| `meal` | Meal + constraints → additions → save → paid weekly plan | Nutrition |
| `quote` | Cleaning scope → itemized quote → customer approval → follow-up | Monetization, Replit, Stripe funnel |

HAMM, Layers and BuildInPublic materials cover all four products. Grand depends on actual commercial traction. Award eligibility and results cannot be generated or guaranteed by code. Start with `docs/submission/STRATEGY.md` and `TODO-RELEASE.md`.

## Run on Windows

Install Node.js 24. Open the extracted `portfolio` directory in WebStorm or IntelliJ IDEA. In the IDE terminal:

```powershell
npm ci
node scripts/dev.mjs rehearsal
```

Use `care`, `meal` or `quote` instead of `rehearsal` to switch products. The API runs on port 8787 and Expo serves the web companion on its displayed port. Free workflows need no external keys. Create an account, accept terms, and save the recovery code. There are no seeded customers, artificial revenue or premium bypasses.

For the compiled portfolio preview included in this archive:

```powershell
npm ci
npm run api
```

Open `http://localhost:8787`, then `/?app=care`, `/?app=meal`, or `/?app=quote`. These query switches are enabled only in the included review export. Reloading a deep route in that combined preview resets its variant to the default. Production exports use a fixed variant and separate origins; they do not have that limitation. Do not deploy the combined preview as a released product.

To rebuild the preview:

```powershell
$env:PORTFOLIO_PREVIEW='1'
npm run build:web
Remove-Item Env:PORTFOLIO_PREVIEW
npm run api
```

## Verify

```powershell
npm run typecheck
npm run lint
npm test
$env:PORTFOLIO_PREVIEW='1'
npm run build:web
npx playwright install chromium
npx playwright test
Remove-Item Env:PORTFOLIO_PREVIEW
npx expo export --platform android --platform ios --output-dir artifacts/native-bundle
npx expo-doctor
```

The backend tests use in-memory SQLite and controlled provider adapters. Browser tests run the real API with isolated test data. Neither proves native purchases, microphone behavior, push delivery or app-store acceptance. `VERIFICATION.md` records only checks performed on this delivered source.

## Build a signed app

Copy `.env.example` to `.env` for local configuration. Follow `docs/RELEASE.md` before setting production values. Each product requires a separate EAS project, owned bundle namespace and store record. Link the appropriate project ID, configure RevenueCat products, and use the matching profile:

```powershell
$env:APP_VARIANT='rehearsal'
npx eas-cli@latest build --platform ios --profile production-rehearsal
```

EAS can compile/sign iOS from Windows after you connect your Apple developer account. Android can use EAS or a local Android SDK. Internal builds require custom native modules: Expo Go is insufficient for RevenueCat, OneSignal and Layers. Regenerate native directories with `npx expo prebuild --clean` when switching variants; do not hand-edit or distribute stale generated folders.

## Features and boundaries

- Six career scenarios, two free. Guided practice is deterministic and labelled. Verified Pro plus explicit consent enables AI roleplay and voice transcription. Retry replaces a chosen response and its following branch. Device speech playback, private history and before/after self-reflection are included.
- Shared circles with one-use 48-hour invitations, membership checks, task ownership and version checks. Handoff recipients must acknowledge a task. Core care is free; multiple circles and reusable templates use Pro.
- Nine curated meal additions filtered by budget per addition, preparation time, equipment, allergies and plant-based preference. Save ten meals free; Pro adds unlimited saves and weekly planning with a combined ingredient list. Check labels and cross-contact; the app does not promise allergy safety or health outcomes.
- Home-cleaning quotes use integer cents, explicit scope, bounded taxes and deposits, expiring/revocable links and recorded acceptance. Three quotes per month are free; Pro adds unlimited quotes and templates. Service payments are arranged directly with the business; Stripe checkout in this project sells the app subscription through RevenueCat Funnels.
- Encrypted stored content, scrypt password hashing, recovery-code reset, expiring sessions, native secure storage, web HttpOnly cookies, consent controls, data export and account deletion. The server can decrypt content; this is not end-to-end encryption. Account email is not verified and is never treated as verified identity.
- Native RevenueCat purchase/restore, authoritative server reconciliation, authenticated webhooks; consented native OneSignal reminders with retry/idempotency; native Layers analytics with advertising consent disabled; stable A/B assignment and exposure events; same-account RevenueCat/Stripe funnel handoff on web.

## Repository map

| Path | Purpose |
| --- | --- |
| `src/app` | Expo Router screens, including public approval and legal routes |
| `src/screens` | Four home workflows |
| `src/lib/sdk.ts` | Native sponsor integrations; `.web.ts` provides honest web behavior |
| `shared` | Catalog, deterministic cues, meal constraints, state transitions, totals |
| `server` | Auth, API, encryption, provider adapters and background jobs |
| `tests` | Domain, API, provider and browser checks |
| `docs/submission` | Four drafts, demo scripts, requirements and blank evidence ledger |
| `docs/store` | Store copy, privacy disclosures and asset instructions |
| `docs/growth` | Pricing proposals, experiments, funnel/campaign briefs and social drafts |
| `assets/brands` | Original 1024px PNG icons and editable SVGs |
| `artifacts/screenshots` | Actual web-preview captures, not native submission evidence |

The API runs as one Node process on a persistent SQLite volume. Do not place its database on ephemeral autoscaling storage or run independent database copies. Use the operational runbook for backups, deletion queues and deployment. The default keys and namespace are development-only; the release checker intentionally reports missing configuration and evidence.
