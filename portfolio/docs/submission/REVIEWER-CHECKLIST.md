# Device acceptance and submission checklist

Current Rehearsal Room status: **targeted signed-device checks passed according to the tester on September 30, 2026**. TestFlight 1.0.0 (4), previously identified iPhone SE (3rd generation), production API `https://rehearsal-room-api-tooj.onrender.com`.

| Confirmed check | Evidence |
| --- | --- |
| Recording, stop and transcription | Tester explicitly reported pass on build 4 |
| Denied microphone, type, Hide keyboard and send | Tester explicitly reported pass on build 4 |
| Finish and reflect, save and reopen | Tester explicitly reported pass on build 4 |
| Export and deletion of disposable account | Tester explicitly reported pass on build 4 |
| Sandbox purchase and Restore Purchases | Tester explicitly reported pass on build 2; no production revenue implied |
| Apple submission | Four items submitted September 30 at 12:49 p.m. EDT; Waiting for Review; expedited review accepted |

The broad multi-app checklist below is a template for additional validation. Unfilled rows are not claims of passing checks; they do not override the specifically recorded results above. Other app variants are not submitted. See [the current evidence ledger](evidence.json).

## Additional validation template

Build ID / variant: ______  Device / OS: ______  API origin: ______

Tester / date: ______  RevenueCat project / offering: ______

| Check | Expected result | Actual result / evidence |
| --- | --- | --- |
| Fresh install, cold start, resume | Correct app brand; fonts/layout load; no crash or missing native module | Pending |
| Register, recovery and login | Terms consent; one-time recovery code; reset revokes old sessions; account remains isolated by app | Pending |
| Offline, timeout and reconnect | Useful error; no silent success, double submit, lost accepted quote or duplicate task transition | Pending |
| Small screen and large text | Inputs, keyboard, buttons, dialogs and long content remain reachable | Pending |
| VoiceOver / TalkBack | Useful labels and order; selected state and errors announced; no color-only meaning | Pending |
| Free experience | Core workflow works without purchases, optional analytics, push or AI | Pending |
| Paywall | Correct localized product, total price, period, legal links and restore route; cancellation handled | Pending |
| Sandbox purchase and restore | Verified Pro on the actual released backend; reinstall and sign-in recover access | Pending |
| Expiration, refund and transfer | RevenueCat changes reconcile, including authenticated duplicate/transfer webhook handling | Pending |
| Live product configuration | Real store keys/products; no Test Store keys; no fabricated revenue from sandbox transactions | Pending |
| Push permission denied / accepted | Denial recoverable; opt-in sends generic reminder; tap opens reminders; no private lock-screen text | Pending |
| Cancel reminder / opt out / switch account | Future jobs cancelled; no future targeting of the wrong account | Pending |
| Analytics consent | Off initially; native Layers events appear only after opt-in; free text and advertising consent absent | Pending |
| Export and delete | Export includes intended data; password check; active account data removed; provider queue monitored | Pending |
| Subscription deletion distinction | User understands deleting account does not cancel billing; cancellation route works | Pending |
| Backup and restart | Durable data after restart; restore verified; deletion reconciliation applied; actual retention matches policy | Pending |

## Product-specific checks

| App | Required scenarios | Actual result / evidence |
| --- | --- | --- |
| Rehearsal | Guided send/retry/reflection; Pro scenario; AI consent denial; malformed/provider-error response; real AI turn with safe boundaries | Pending |
| Rehearsal voice | Microphone allow/deny; transcription; 60-second cap; cancellation; background/phone interruption; temporary file cleanup; device speech stop | Pending |
| Care | Two real signed-in devices; one-use invite replay rejected; unauthorized membership blocked; simultaneous claims; explicit recipient acknowledgment; leave/delete ownership effects | Pending |
| Meal | Allergens and vegan filter; insufficient budget/time/equipment; empty result; ten-save free cap; Pro weekly dates/ingredient list; remove a plan after entitlement expires | Pending |
| Quote | Integer-cent tax/deposit rounding; invalid/expired date; public accept on another browser; repeated acceptance; revoke token; accepted terms unchanged; account deletion removes link access | Pending |

## Submission acceptance

Check all items for each entry you actually submit:

- [ ] Entrant eligibility and ownership reviewed; student/academic-email/guardian evidence if needed.
- [ ] Distinct project and one influencer category selected; no unauthorized name, likeness or endorsement.
- [ ] Required public store release in the event window, available in the US; Next Gen-only exception used only where applicable.
- [ ] Published store URL opens while signed out; products and judge trial/promo access work through the end of judging.
- [ ] Original icon, correctly sized native screenshot and actual-device demo below two minutes.
- [ ] Public video, repository/license if required, support and privacy links checked from a clean browser.
- [ ] Devpost description matches the submitted native behavior and admits limitations.
- [ ] OneSignal campaign/App ID/delivery, Layers installation/experiment, HAMM results, public build posts and other selected sponsor evidence are genuine and dated.
- [ ] Replit development/Agent contribution/preview/username/stage posts and Stripe Funnel/Project ID verified if claiming those prizes.
- [ ] Revenue evidence comes from provider reports with test activity excluded; no confidence claim from an inadequately observed experiment.
- [ ] `evidence.json` completed; release checker passed for the actual variant/platform/route; every linked artifact accessible.
- [ ] Submit before September 30, 2026, 11:45 p.m. PDT, retaining final text and receipt.

The checker validates declared configuration and evidence presence; it cannot prove a URL's truth, legal eligibility, a native binary's behavior or an organizer's acceptance. Inspect those directly. It does not submit anything.
