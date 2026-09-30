# Rehearsal Room

A private place to practice difficult workplace conversations, find a clearer sentence, and try again.

Owned by Alessandra Ascarza. Development includes contracted technical assistance; ownership remains with Alessandra. Support: alemccray@protonmail.com.

The active release is **Rehearsal Room: Career Prep** for iPhone. This repository also contains three other app variants that share its foundation. All application source, setup instructions, tests, and release documentation are in [`portfolio/`](portfolio/README.md).

**Shipaton Next Gen reviewers:** start with the [judging guide](portfolio/docs/submission/NEXT-GEN-JUDGING.md) for the product walkthrough, RevenueCat implementation map, reproducible setup and dated verification evidence.

## Development

Requires Node.js 24.

```sh
cd portfolio
npm ci
node scripts/dev.mjs rehearsal
```

For optional provider integrations, copy `portfolio/.env.example` to `portfolio/.env` and supply your own credentials. Never commit that file. Free guided practice runs without provider credentials.

## Verification

```sh
cd portfolio
npm run typecheck
npm run lint
npm test
```

The GitHub Actions workflow also exports web and native bundles and exercises web workflows. These checks do not replace signed iPhone testing of purchases, restore, microphone access, or notifications.

## Release status

As of September 30, 2026, the backend and [web companion](https://rehearsal-room-api-tooj.onrender.com) are live. The iPhone tester confirmed that TestFlight **1.0.0 (4)** passes voice recording/transcription, microphone-denial fallback, keyboard dismissal and sending, reflection save/reopen, and disposable-account export/deletion. Sandbox purchase and restore passed on build 2. All 31 automated tests and release CI checks pass. Build 4 and its subscriptions were submitted to Apple at **12:49 p.m. EDT** and are **Waiting for Review**; this is not yet an App Store release. The [90-second native iPhone demo](https://vimeo.com/1231760753), narrated by Alessandra, is now public with English captions. The Devpost draft is prepared for the entrant's final submission action. The current focus is **Next Gen**, evaluated from the demo and this public MIT source. See the [judging guide](portfolio/docs/submission/NEXT-GEN-JUDGING.md) for the product, implementation and dated evidence.

## License

MIT; see [LICENSE](LICENSE). Third-party notices and font licenses are in [`portfolio/docs/THIRD_PARTY_NOTICES.md`](portfolio/docs/THIRD_PARTY_NOTICES.md) and [`portfolio/docs/licenses/`](portfolio/docs/licenses/).
