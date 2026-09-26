# Release runbook

## Identity and deployment

Choose an owned reverse-domain bundle root. Create independent EAS and store projects for each app you will release. Supply per-variant public keys via EAS environment configuration and set `EXPO_PUBLIC_API_URL` to the HTTPS API. Set `OPERATOR_NAME`, monitored `SUPPORT_EMAIL`, `LEGAL_ORIGIN`, actual `HOSTING_REGION` and configured `BACKUP_RETENTION_DAYS`. These values are included at build time; rebuild after changes. A retention declaration does not configure backup cleanup: implement it on your host. Complete the remaining policy details in `docs/store/PRIVACY-AND-REVIEW.md` before launch.

Server secrets stay in the hosting environment, never `EXPO_PUBLIC_*`, `app.config.ts` extras or public source. Generate DATA_KEY, WEBHOOK_SECRET and OPS_TOKEN independently. Protect DATA_KEY separately from database backups. Production startup rejects absent encryption keys, weak operator/webhook secrets and a non-HTTPS public origin.

Deploy one durable Node 24 process with a persistent database volume behind HTTPS. `compose.yaml` binds locally for a reverse proxy. Give each public app companion its own origin and fixed variant export. A shared API can serve all four mobile variants, but its static companion and quote approval origin must be configured deliberately; for the simplest first release, deploy one isolated server/volume per app. Allow only the exact companion origins in CORS. Set `TRUST_PROXY=1` only behind a proxy that overwrites forwarded addresses. Verify TLS, encrypted backup restore and service restart before release.

## RevenueCat and store products

Create a monthly and annual subscription for each app. Suggested identifiers: `<app>_pro_monthly`, `<app>_pro_annual`; entitlement must be exactly `<app>_pro`. Map products to the current Offering. Product IDs are proposals, not provisioned products. Connect store credentials and notification endpoints in RevenueCat. Public iOS and Android SDK keys are separate from the server secret key.

Set `<APP>_RC_APP_IDS` to every RevenueCat internal app ID that can send webhooks, comma-separated; these are not bundle identifiers. Configure `/v1/webhooks/revenuecat` with `Authorization: Bearer <WEBHOOK_SECRET>`. The API re-fetches subscriber state and does not trust client entitlement claims. RevenueCat-verified sandbox access is honored so App Review can test purchases against the released backend. Sandbox webhooks reconcile access but never generate `purchase_verified` events. Only authenticated production purchase/renewal events with confirmed active access can do so; event counts are still not a revenue ledger. Exclude test transactions and internal accounts from growth reports and revenue claims.

Use isolated staging for routine QA. Configure RevenueCat Sandbox Testing Access deliberately; a restricted allowlist must include the opaque IDs of the supplied review accounts, and must not break the reviewer purchase journey. Do not ship RevenueCat Test Store keys. Apple explicitly tests In-App Purchases in its sandbox. Sources: https://developer.apple.com/forums/thread/810791 and https://www.revenuecat.com/docs/projects/sandbox-access

Test purchase, restore, expiration, refund, cancellation and transfer on signed physical-device builds. Reinstall, sign back into the app account, restore and verify the correct entitlement. Align RevenueCat transfer settings with this account model. The paywall reads localized product prices and never invents a trial. Configure a genuine trial or judge redemption flow, test it, and record instructions that preserve access through judging. There is no universal bypass in the binary.

Source: https://www.revenuecat.com/docs/getting-started/installation/expo

## OneSignal

Connect APNs/FCM to each released product's OneSignal project. The config plugin is first in the Expo plugin list. On a consenting native test device, enable reminders, accept OS permission, schedule a reminder, and verify receipt and tap navigation. Check denied permission, opt-out, cancellation and account switching. Web push is intentionally unavailable.

The server targets an opaque account ID with generic lock-screen text and the reminder UUID as the idempotency key. Six bounded attempts are allowed. A provider-accepted send is not proof of device delivery; retain dashboard/device evidence. Opt-out cancels pending jobs. A send already accepted by the provider may still arrive.

Use the campaign brief in `docs/growth/CAMPAIGNS-AND-FUNNELS.md` to deploy a real campaign to a specifically consenting test segment. Record its App ID, campaign ID, setup and delivery. User-scheduled reminders alone are not labelled proof that an external campaign was deployed.

Source: https://documentation.onesignal.com/docs/en/react-native-expo-sdk-setup

## Layers

Set the per-app Layers App ID, enable analytics on your consenting native QA account, then complete the main flow. Verify events in Layers and capture the build, SDK version and timestamps. The SDK sets advertising-related consent false before asynchronous initialization and does not attach user-entered content. Account identifiers and device/SDK metadata may still be personal data.

`first_step_copy_v1` has a stable account-level A/B assignment. Exposure fires when the home workflow renders with analytics enabled. Other events mark successful product actions. The first-party `/ops/evidence` endpoint provides aggregate consenting event counts; it is not a financial ledger. Use distinct users for experiment denominators. Execute and document one measured learning loop; no results are prefilled.

Layers historical deletion is a manual operation in this integration. Review `/ops/privacy-requests`, ask the provider to erase the listed App ID/user ID, retain confirmation, then acknowledge the manual item with `DELETE /ops/privacy-requests/<id>` and OPS_TOKEN. Confirm current provider instructions before sending.

Sources: https://layers.com/docs/sdk/installation and https://layers.com/docs/api/operational/data-protection

## RevenueCat Funnels and Stripe

Connect Stripe Billing in RevenueCat. Create real products and a matching Offering, then publish a RevenueCat Funnel using Stripe checkout. Set `<APP>_FUNNEL_URL` to its base `https://signup.cat/<link_id>` URL. The server appends the authenticated opaque account ID; the native SDK uses the same ID. This prevents email being embedded in checkout URLs and supports web-to-app access continuity.

Verify a web purchase, sign-in on native, entitlement reconciliation, cancellation and refunds. A checkout redirect is never used as payment proof. Native screens offer store purchases; external checkout appears only in the web companion. Before changing that arrangement, check the current store policy for the intended market. Capture real qualifying payment volume, Stripe Project ID and the live funnel URL. Service-customer payments are not app-subscription revenue.

Sources: https://www.revenuecat.com/docs/tools/funnels/deploying-funnels and https://www.revenuecat.com/docs/web/integrations/stripe

## Replit and final checks

The code was created with Codex, not Replit Agent. `REPLIT_AGENT_PROMPT.md` describes concrete remaining work to carry out in Replit with truthful provenance. The `.replit` file is a starting configuration; verify the Node 24 module and durable reserved deployment storage in your account. Merely importing a repository does not prove the required development journey.

Run `node --env-file=.env scripts/release-check.mjs rehearsal ios --config-only` before the signed build. Complete the evidence ledger and run again without that flag. Repeat for the selected products. Use the device acceptance checklist and confirm all public URLs from a signed-out US session before submitting. EAS build/submit commands, store accounts, paid services and actual publication were not executed in this package.
