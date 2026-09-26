# Rehearsal Room

A private place to practice difficult workplace conversations, find a clearer sentence, and try again.

Owned by Alessandra Ascarza. Development includes contracted technical assistance; ownership remains with Alessandra. Support: alemccray@protonmail.com.

The active release is **Rehearsal Room: Career Prep** for iPhone. This repository also contains three other app variants that share its foundation. All application source, setup instructions, tests, and release documentation are in [`portfolio/`](portfolio/README.md).

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

The web companion is deployed on Render. App Store publication, native purchase verification, and hackathon eligibility evidence are still being completed. See [`portfolio/docs/RELEASE.md`](portfolio/docs/RELEASE.md) and [`portfolio/TODO-RELEASE.md`](portfolio/TODO-RELEASE.md). Draft submission statements must be updated to reflect verified results before submission.

## License

MIT; see [LICENSE](LICENSE). Third-party notices and font licenses are in [`portfolio/docs/THIRD_PARTY_NOTICES.md`](portfolio/docs/THIRD_PARTY_NOTICES.md) and [`portfolio/docs/licenses/`](portfolio/docs/licenses/).
