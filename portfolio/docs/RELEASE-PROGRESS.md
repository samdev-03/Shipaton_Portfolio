# Release progress — September 26, 2026

## Continuation checkpoint — 18:15 UTC

This checkpoint supersedes older statuses below. Release is not yet submitted to Apple or Devpost.

- Public MIT source is deployed from `3cea6da26cb72d9832a52b929e548ec4e9f227d2`. GitHub run `36260827813` passed; Render deployment `dep-das0esrncjis73e39arg` is live. Twenty API/domain/provider tests, typecheck and lint passed. The backend-only update adds content-free provider diagnostics and preserves the actual audio file extension during transcription.
- iOS 1.0.0 **build 2** completed in EAS (`381cbfff-30ea-45df-86e9-2f7b57a9d97c`), uploaded successfully (`9a9c6d02-2bb8-4102-98ad-298605fc2a7d`), and was processed by Apple (`a4c7847a-4719-4fd6-bd54-952f6f465a0c`). It contains the tested 16+ guided / 18+ AI policy from `e85c172`.
- Build 2 is assigned to `Rehearsal Release QA`, with the user-approved internal tester. Apple reports it installed on an iPhone SE (3rd generation), iOS 26.7. Installation is verified; successful native workflows, purchases, restore, audio and deletion are not yet verified. Concrete testing instructions were saved in TestFlight.
- Apple privacy responses are published with explicit user approval: name, email, audio, other user content, user ID, purchases, product interaction, and other data (age/permission), linked to identity and not used for tracking. The app rating is 16+.
- The dedicated fictional Apple review account has verified complimentary `rehearsal_pro` access until **2026-10-31 23:59 UTC**. Its private credentials and review notes are saved in Apple's private review fields. Credentials are not in this repository. Build 2 is selected and saved in the App Store version draft.
- Apple's existing Free Apps and Paid Apps agreements and tax form are active. Free download pricing and US/Peru availability are configured. Subscriptions remain separate monthly/annual purchases. Store screenshots, subscription review screenshots, matching subscription service levels and tested judge trial/promo access remain outstanding.
- Live AI verification failed: OpenAI returned HTTP 429. The connected OpenAI organization's Billing page shows a free-trial balance of USD 0.00. The user has been asked to fund it or use the already-funded project's key. No AI-response or transcription success is claimed. Synthetic practice records were removed and the review account's optional AI setting reset after the checks.
- Production smoke checks passed again at **18:14 UTC**: health, fictional registration, verified free entitlement, guided practice/reflection, deletion and rejected deleted-session access. These checks do not establish native behavior or production revenue.
- Reused Alessandra's existing sole-owner Shipaton draft `1195853-rehearsal-room` (public preview slug `tbd-27jfd0`) instead of creating another project. Name, pitch, story, verified implementation tags, public repository, private academic contact and RevenueCat ID were saved. Its story accurately records the current build and remaining work. The older contractor-created draft `1198280-rehearsal-room` remains unsubmitted. Neither draft has been entered for judging.
- Next Gen is the current viable submission path while the store release is prepared. Domain `upsjb.edu.pe` appears in JetBrains/swot. The account email field was unreadable through browser controls, so account-level academic-email verification is still pending. User confirmation of the entrant's ideas and creative direction is also pending. Do not assert completed eligibility.
- Devpost native screenshot (1179 × 2556 without a device frame) and a public YouTube/Vimeo native demo under two minutes remain missing. Browser file-picker activation did not work, so even the existing 1024px icon still needs upload to the sole-owner draft. No web preview is represented as native evidence.
- The existing Expo account does not currently have EAS Simulator enabled (availability check returned false). A suitable larger iPhone, Mac simulator, or a separately authorized cloud simulator can supply the required screenshot sizes. The iPhone SE can supply actual-device video and workflow verification.
- Final Devpost submission accepts the rules and enters a prize competition; the user must perform that final step after the evidence and eligibility are complete.

## Continuation checkpoint — 17:35 UTC

This checkpoint supersedes older statuses below.

- Public MIT source release approved and completed: https://github.com/samdev-03/Shipaton_Portfolio . Commit `ca851b2` passed GitHub CI and was deployed on Render.
- iOS 1.0.0 build 1 uploaded successfully via EAS submission `10b45051-d147-4108-93c6-3638a46d5f2e`; Apple processed it and shows Ready to Submit. App Store build ID `beaf1fc6-530f-4b22-9b4b-b4fad4759127`. The approved App Manager credential was created and stored by EAS; no private key is in source.
- New user instruction permits younger users. Rehearsal Room now permits ages 16+, with a parent/guardian permission confirmation for ages 16–17. Age-band declarations are encrypted with the profile; no birth date is collected. AI roleplay and transcription remain adult-only, enforced on preferences, practice creation, turns, and audio endpoints. Other variants remain adult-only. Build 1 is superseded for release; a new signed build is required.
- Verification of the age-access update: 19 API/domain/provider tests, five browser workflows, typecheck, lint, and web/iOS/Android exports passed. Tests cover missing or invalid age declarations, missing permission, guided access for teens, and rejection of AI access despite paid/stale state.
- RevenueCat default offering maps both Apple products. Authenticated webhook `whintgrf54a87e734` reached the live backend with HTTP 200. Apple production and sandbox notification URLs are configured to RevenueCat. This is connectivity evidence, not purchase evidence.
- User saved the funded OpenAI project key directly into Render. Live config reports AI available. Actual AI responses and transcription remain to be tested with a verified Pro/review account.
- Production smoke checks passed on September 26: HTTPS health, fictional account registration, real RevenueCat free-entitlement verification, guided rehearsal and reflection, deletion, and rejection of the deleted session. No personal rehearsal content or live payments were used.
- Apple listing description, promotional text, support/marketing URLs, copyright, subtitle, and Education/Business categories are saved. Rating revised for age 16+. Final privacy, review credentials, native screenshots, subscription review assets and public release remain pending.
- Internal TestFlight group `Rehearsal Release QA` created without automatic distribution. Tester selection awaits the user. Native device testing, demo video and screenshots remain pending.
- Devpost project story and private judging notes now include public source and verified build/service progress. OneSignal and Layers are explicitly unconfigured; no results are claimed. Final student-team representation and academic-email eligibility remain unresolved. Do not press final submission until evidence is complete and the user handles the prize-entry step.

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
