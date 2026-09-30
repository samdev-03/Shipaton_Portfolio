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

As of September 30, 2026, the backend and [web companion](https://rehearsal-room-api-tooj.onrender.com) are live, and iOS 1.0.0 (2) is installed through TestFlight. Live guided practice, real AI feedback, voice transcription, RevenueCat access verification and account deletion checks pass. App Store publication and native purchase/restore verification remain pending. The current submission focus is **Next Gen**, evaluated from the native demo and this public MIT source. See the [judging guide](portfolio/docs/submission/NEXT-GEN-JUDGING.md) for the exact scope and limitations.

## License

MIT; see [LICENSE](LICENSE). Third-party notices and font licenses are in [`portfolio/docs/THIRD_PARTY_NOTICES.md`](portfolio/docs/THIRD_PARTY_NOTICES.md) and [`portfolio/docs/licenses/`](portfolio/docs/licenses/).
