# Privacy forms and review preparation

This is an implementation inventory and filing worksheet, not completed store declarations or a legal certification. Use the final signed binary, provider configuration and actual hosting contracts to complete each app's forms. Changes to SDK configuration may change the answers. No live network privacy audit has been performed.

## Data inventory

All four apps require an account for private workflows. A pseudonymous account ID is still linked to an account; do not describe these records as anonymous. HTTPS is mandatory for deployment. Encryption in the database does not remove a store disclosure requirement.

| Data and scope | Purpose / processing | Form categories to examine |
| --- | --- | --- |
| Name, email, opaque user ID; all apps | Account access and display; encrypted profile, hashed email index | Apple contact info and user ID; Google personal information and user IDs; linked, app functionality |
| Password and recovery verifier | scrypt password hash, hashed recovery code; never analytics | Account security; apply each store's credential disclosure definitions |
| Rehearsal text and reflection | Saved content; selected dialogue sent to OpenAI only with AI consent and use | Other user content; linked, app functionality |
| Rehearsal recording | Optional device microphone → API → OpenAI transcription; temporary files cleaned after use | Audio data; assess ephemeral-processing exceptions against actual provider behavior |
| Care tasks and member names | Visible within the selected private circle | Other user content and personal information; shared with members by user action |
| Meal ingredients, exclusions, saved plan | Constraint filtering and saved food choices | Other user content; assess health information for allergy/diet data and health-app declaration |
| Quote business/customer names, scope, totals, acceptance | Quote service; valid link holders can read and approve | Other user content, personal information and financial information as applicable |
| Subscription transactions and entitlement | Store/Stripe and RevenueCat process billing; API verifies access | Purchases / purchase history, identifiers; linked, app functionality |
| Device push subscription and opaque ID | OneSignal when reminders are enabled | Device IDs / identifiers, app functionality; optional |
| Allowed interaction events and A/B assignment | First-party API and native Layers after analytics consent; no free text | Product interaction / app activity, identifiers, analytics; optional and linked |
| IP/network and SDK diagnostics | Host, payment and other providers may collect independently of app body logging | Inspect actual IP-derived location, diagnostics and device metadata; do not mark absent without verifying |
| Security limits and deletion queue | Hashed rate-limit keys; provider deletion job IDs | Security and compliance operations; minimal records while processing |

The app does not read contacts, photos, location or health-platform databases. Only Rehearsal Room asks for microphone access. Advertising consent is disabled in Layers; do not claim “no tracking” in a filed form until confirming every included SDK's behavior and your account settings under the store's definition. The presence of `expo-tracking-transparency` as an SDK dependency does not itself mean an ATT prompt is shown or tracking is enabled.

For Google, “collected” and “shared” have distinct definitions and service-provider exceptions. Check each processor relationship before answering. Do not mark “no data collected” for these account-based apps. For Apple, evaluate data linked to the user and each purpose separately. Meal Patch's food and allergy choices warrant a deliberate health-data and health-app declaration review even though the product makes no medical claims.

## Operator details to complete

Set the real operator, monitored email, legal URL, database hosting region and backup retention period in the build environment. Implement the corresponding backup expiry policy on the host. Publish any applicable processor/transfer details and rights-contact information. Check actual providers' retention and contracts; `store:false` on a text request is not a blanket promise of zero provider retention.

Active saved account content remains until record/account deletion. First-party events expire after 90 days. Expired sessions, invitations and rate-limit records are pruned by the worker. RevenueCat and OneSignal deletion jobs retry, and Layers deletion requires the documented manual queue. Billing providers may retain legally required records. Account deletion does not cancel store billing. Restored backups must have later deletions reapplied before serving users.

Verify that public `/legal`, `/legal?document=terms` and `/legal?document=support` pages work without a signed-in account. The support page explains the Settings deletion path and provides the operator's email request route for someone without the app. The operator must actually monitor and fulfill requests after verifying account control. Never ask for a recovery code or password by email. An email matching the unverified login identifier alone is insufficient proof.

Sources checked September 24, 2026:

- Apple privacy definitions: https://developer.apple.com/app-store/app-privacy-details/
- Apple review requirements: https://developer.apple.com/app-store/review/guidelines/
- Google data-safety definitions: https://support.google.com/googleplay/android-developer/answer/10787469
- Google account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Google health declarations: https://support.google.com/googleplay/android-developer/answer/13996367

## Private review notes template

Supply the following in the store's private reviewer fields. Keep passwords, recovery material and redemption codes out of public source, screenshots and Devpost text. Create dedicated accounts containing fictional examples, verify them on the submitted build, and keep them available throughout review.

> App: [name, version, build number]. Operator: [actual operator]. Support: [monitored email].
>
> Review account: [email and password supplied privately]. Care Relay second-member account: [separate credentials if applicable]. There is no SMS challenge. A new account receives a recovery code once; reviewers can save it or use the provided account.
>
> Account controls: Settings → Export my data / Delete account. Deletion asks for the current password. Deleted subscriptions must be cancelled separately with the purchase provider.
>
> Pro: Settings → Explore Pro. Monthly and annual offerings show store-localized prices. Restore purchases is on the same screen. RevenueCat verifies access with the backend. Sandbox purchases are supported for store review; the RevenueCat sandbox-access configuration permits these review account IDs. [List submitted subscription product IDs and explain any configured trial accurately.]
>
> Optional permissions: reminders ask for OS notification permission only when enabled. Rehearsal Room asks for microphone permission only for user-initiated voice input. AI processing and analytics begin disabled. Enable AI processing in Settings before using AI practice/transcription. [Confirm all relevant production services are available.]
>
> Main workflow: [use the matching sequence below]. No private customer data is required.

| App | Short reviewer path |
| --- | --- |
| Rehearsal | Start a small practice → workload scenario → guided mode → send a response → retry → finish and reflect → Your progress. Then test a Pro scenario, AI and voice after consent. |
| Care | Create circle → add task → claim → acknowledge → complete. Invite the second account using a one-use code; hand off a new task and acknowledge on that account. Refresh each device to see updates. |
| Meal | Enter a meal → set constraints → find additions → save → Your progress. With Pro, assign a saved meal to a valid date and review the combined ingredient list. |
| Quote | New quote → enter fictional scope and line items → save → copy approval link → open in a second browser → accept → refresh the app. Confirm totals and immutable accepted terms. |

Complete the age-rating questionnaire honestly for user-entered content, optional AI and nutrition features. The service is designed for adults; a student's eligibility as a developer does not change the app's intended audience. Do not declare medical-device functionality, influencer endorsement or emergency monitoring.
