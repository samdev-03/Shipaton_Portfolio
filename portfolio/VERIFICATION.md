# Verification record

Checked September 24, 2026 on Node.js 24.19.0 in the Linux execution environment. This records observed checks on the delivered release candidate, not a production certification. Native operating-system behavior and external services still require the device checklist.

| Check performed | Observed result | Scope / evidence |
| --- | --- | --- |
| `npm ci` | Passed | Locked dependency installation; no claim of Windows-native compilation |
| `npm run typecheck` | Passed | Strict TypeScript client/shared/config checks |
| `npm run lint` | Passed | Client/shared/Expo config; zero reported errors or warnings |
| `npm test` | 18 passed, 0 failed | 10 API, 4 domain, 4 provider tests; `artifacts/reports/backend-tests.log` |
| `PORTFOLIO_PREVIEW=1 npm run build:web` | Passed | Final web companion export included in `dist` |
| `npx playwright test` | 4 passed, 0 failed or flaky | Actual API and Chromium, one workflow per app; `artifacts/reports/browser-results.json` |
| Android and iOS Expo exports | Passed | Hermes JavaScript bundles and assets; not APK/AAB/IPA builds |
| `npx expo-doctor` | 21 of 21 passed | Expo dependency/configuration checks |
| Android `expo prebuild --no-install` | Passed | Config plugins generated native Android files; no Gradle compilation |
| SQLite online backup | Passed | Test database snapshot and SQLite integrity check; not a production disaster-recovery drill |
| Store draft short fields | Passed | Name, subtitle, short description, promotional text and keyword lengths checked |
| Release evidence gate | Correctly BLOCKED | 36 missing declarations for flagship iOS with server checks; `artifacts/reports/release-check.json` |

The final browser run began at 17:52:28 UTC and completed in 16.5 seconds. Browser execution used Playwright with a locally available Chromium binary via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; the project also supports normal Playwright browser installation. Eight captured screens use a 393 × 852 viewport at 3× density. They are web previews, not native store screenshots.

## What the tests establish

API tests exercise account/app isolation, encrypted content, recovery-session revocation, optimistic rehearsal updates/retry, authoritative Pro access, authenticated and duplicate webhook handling, review sandbox access without production purchase-event inflation, circle invite reuse and claim races, explicit handoff acknowledgment, constrained meal saves, exact quote totals and immutable/expiring public approval, reminder consent/retry, account/provider deletion queues, cookies, CORS and oversized requests.

Domain tests check integer-cent rounding and bounds, all allergy combinations against meal constraints, allowed task transitions, strict dates, deterministic wording cues and stable experiment assignment. Provider tests use controlled HTTP responses to verify request construction, expiry handling, explicit AI consent, structured output and failure handling. They do not contact paid providers.

Browser workflows create fictional accounts and use the actual server. They exercise Rehearsal Room signup → practice → retry → saved reflection after reload; Care Relay circle → claim → acknowledge → complete; Meal Patch constraints → save → history; Quote to Cash itemized quote → paywall → public privacy route. Provider services are unconfigured in those runs, so no purchase or campaign delivery is simulated.

The App Review regression found during final review was corrected: sandbox transactions verified by RevenueCat can grant access against the production backend. Sandbox webhooks reconcile access and expiry but never count as `purchase_verified`. The added regression test verifies that distinction and duplicate handling.

## Not verified or performed

No signed native binary was compiled, installed or tested on a physical device. Native SDK loading, real audio recording, OS interruption cleanup, push delivery, actual Layers events, purchase/restore/refunds, live Stripe Funnel continuity and assistant-provider output must be checked with configured accounts. No Replit development provenance was created. No independent security, accessibility, legal or load audit was performed. Docker and Replit deployment files were prepared but no production deployment was executed.

No store account, app listing, subscription product, campaign, social post, public source repository, native video, public URL or hackathon entry was published. Test accounts and generated databases are excluded from the archive. Revenue, active users, experiment lift and prize outcomes remain unmeasured; the evidence ledger intentionally leaves those fields blank.

Before release, run `docs/submission/REVIEWER-CHECKLIST.md` against the exact signed build and complete `TODO-RELEASE.md`. The packaged `dist` is a multi-variant review preview; public deployments must use a fixed-variant build with real operator/service settings. `SOURCE_MANIFEST.json` contains hashes for the packaged files other than itself.
