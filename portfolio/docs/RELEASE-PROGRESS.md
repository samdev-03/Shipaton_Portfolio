# Release progress — September 26, 2026

## Continuation checkpoint — 17:05 UTC

This checkpoint supersedes the initial check below where statuses differ.

- Owner confirmed by the operator: Alessandra Ascarza, adult medical student in Lima, Peru. The operator provides contracted technical assistance. Public support: `alemccray@protonmail.com`. Academic contact remains in the private Devpost judging field. Full category eligibility and student-only team representation still need review.
- Signed iPhone **1.0.0 (1)** build succeeded: [EAS build 33953272](https://expo.dev/accounts/samdev03/projects/shipaton-rehearsal/builds/33953272-970e-4c80-8be2-5d459152bb49). Built from the working tree based on `54aae10`, including the dependency and privacy-disclosure edits in this checkpoint. Signing covers the app and OneSignal notification extension on Apple team `WZ894A9DD2`.
- TestFlight upload is pending: the first noninteractive EAS Submit attempt stopped because no App Store Connect upload API key is configured. An App Manager key form named `Rehearsal Expo Submit` is prepared; creation and storage in Expo await explicit approval. No store release or device testing is claimed.
- RevenueCat project `34974d75`: App Store app `app2cb9b08c53`, valid Apple IAP credentials, public SDK key configured in EAS production and preview. The approved V1 server key is saved only in Render. The actual app entitlement `rehearsal_pro` (`entl2691007bd6`) is created and attached to both Apple products. The older test-store entitlement remains unchanged. Offering package mapping and the authenticated webhook remain pending.
- Apple subscription group `22415938` has English (U.S.) display name `Rehearsal Room Pro`; monthly product `rehearsal_pro_monthly` (`6816464881`) at USD 8.99 / PEN 39.90, annual `rehearsal_pro_annual` (`6816466389`) at USD 49.99 / PEN 229.90. Availability is configured for the US and Peru. Both remain Prepare for Submission; group levels, review screenshots, and any judge free-access offer need completion.
- Render `/healthz` is configured. Deployment `dep-darvdhrbc2fs738n6h30` is live with the server purchase key, owner/support details, Apple app mapping, Virginia hosting disclosure, and the accurate provider-managed snapshot policy. Render retains daily snapshots for at least seven days; no fixed maximum expiry is asserted. A production restore drill remains outstanding.
- The user approved use of an existing funded OpenAI project. An empty `OPENAI_API_KEY` row is staged in the Render editor for direct user entry; it has not yet been verified saved. AI/transcription must not be claimed operational until tested.
- Devpost draft `1198280-rehearsal-room`: Alessandra joined as an editor using her own account, private additional-info fields saved, 3/5 steps complete. Original creator remains the contractor; resolve student-entry representation before final submission. Native demo, native screenshot, public repository, and final submit remain pending.
- Current source checks: typecheck and lint passed; 18 API/domain/provider tests passed; web, iOS, and Android exports passed. Four browser workflows passed after clearing a stale local API address from Metro's cache (`EXPO_NO_DOTENV=1`, explicit test API URL). These test flows use isolated fictional accounts and do not establish purchase, notification, AI, or native-device success.
- Repository remains private. Both existing commits were scanned for common private-key and token patterns with no matches; tracked `.env`/private key files were absent. The scan is limited, not a confidentiality guarantee. The public-source scope includes all four app variants, docs and MIT license.

## Initial checkpoint (historical)

## Verified

- Render serves the Rehearsal Room web companion at `https://rehearsal-room-api-tooj.onrender.com`.
- A direct GET of `/healthz` returned HTTP success and `{"ok":true}`.
- The existing persistent disk is mounted at `/var/data`. Render's configured health-check path still needs to be set to `/healthz`.
- The App Store Connect record is **Rehearsal Room: Career Prep**, app ID `6816377186`, currently Prepare for Submission.
- EAS project `samdev03/shipaton-rehearsal` has ID `28dff74a-4109-4e3b-b008-f6786819b1d4`. No EAS builds or submissions existed at this check.
- The registered iOS bundle identifier is `com.horizonsystemssolutions.rehearsal`.

## Source fixes

- Move the GitHub Actions workflow to the repository root and point commands, caches, and artifacts at `portfolio/`.
- Add a root README and the existing MIT license for source discovery.
- Record the registered Rehearsal Room identity in Expo configuration and select the production EAS environment explicitly.
- Point the production build at the deployed HTTPS API and the existing App Store Connect record.
- Start Expo directly with Node on Windows and provide the development API URL when `.env` is absent.
- Ignore Apple private keys and PEM files.

## Checks completed on this source

- TypeScript type checking: passed.
- ESLint: passed.
- API, provider, and domain tests: 18 passed.
- Web export: passed.
- iOS and Android JavaScript/Hermes exports: passed.
- Default public Expo config resolves the expected owner, bundle ID, and EAS project ID.
- Tracked source scan found no matches for common private-key, GitHub-token, OpenAI-secret-key, or AWS-access-key patterns. This is a limited scan, not a guarantee that all confidential content has been excluded.

## Still required

- Confirm and configure the correct RevenueCat project, App Store app, products, entitlement, offering, server verification key, and webhook.
- Configure public release metadata and SDK keys in EAS; keep backend secrets on Render.
- Configure AI credentials if responsive AI and transcription are included in the release.
- Finish hosting/backup disclosures using the actual deployed retention policy.
- Provision signing credentials, create the signed iOS build, and test on an iPhone/TestFlight.
- Verify real sandbox purchase, restore, account deletion, microphone, and any enabled notification/analytics integrations.
- Complete the Apple listing, screenshots, privacy answers, age rating, review access, and submission.
- Complete the real demo and Devpost draft with verified student eligibility and award evidence. Public-source release needs a final scope review before changing repository visibility.

Bundle export is not an iOS binary build. Web-preview images are not evidence of native-device testing. No production purchase, award eligibility, store approval, or growth result is claimed by these checks.
