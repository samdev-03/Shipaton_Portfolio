# Release progress — September 26, 2026

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
