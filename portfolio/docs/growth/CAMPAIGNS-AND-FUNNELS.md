# Campaign and funnel briefs

Prepared instructions; no campaign or checkout was published by this package.

## OneSignal demonstration campaign

Purpose: help a willing tester return to the practice they explicitly planned. Use a small segment that specifically consented to this campaign. Existing permission for self-scheduled reminders does not authorize unrelated marketing. Record that consent, configure recipient-local quiet hours, and avoid overlapping scheduled reminders.

Title: “A moment for you”

Body: “Ready for the conversation you planned? Your practice space is here.”

Destination: native app home or reminder screen, verified on the installed build.

Before sending: confirm the audience on your own test device, generic lock-screen copy, unsubscribe route and timing. After sending: record App ID, campaign ID, build, intended audience size, provider acceptance, actual device delivery, tap behavior and any observed subsequent practice. A push-open rate alone does not prove useful retention. Do not send to other people through tools without explicit authorization.

Possible later campaigns for other apps require their own consent and validation: revisit a shared task in Care Relay; return to a saved meal in Meal Patch; revisit a planned follow-up in Quote to Cash. Do not include task, dietary, customer or conversation details in push text.

## RevenueCat Funnel using Stripe

The following is copy to enter into the RevenueCat Funnel builder, not a replacement payment page.

| Stage | Rehearsal Room | Quote to Cash |
| --- | --- | --- |
| Problem | “A difficult conversation ahead?” | “Turn an unclear job into a clear quote.” |
| Goal | “Find one sentence you can actually say.” | “Put the scope and price in one place.” |
| Useful preview | Show a real fictional workload retry | Show a real fictional cleaning quote |
| Free/paid boundary | Two guided scenarios free; Pro details | Three quotes monthly free; Pro details |
| Offering | Localized monthly/annual terms from configured products | Localized monthly/annual terms from configured products |
| Checkout | Stripe provider selected inside RevenueCat Funnels | Stripe provider selected inside RevenueCat Funnels |
| Handoff | Install app and sign in with the same app account | Install app and sign in with the same app account |

Meal Patch funnel angle: “Add something that fits today,” followed by a real constrained suggestion and the planning benefit. Care Relay angle: “Make one next step visible,” followed by a handoff and the multiple-circle/template benefit. Keep the free care boundary clear.

Set each published base URL as `<APP>_FUNNEL_URL`. The web companion obtains the signed-in user's URL from `/v1/funnel`. Do not append email addresses, private notes or arbitrary user IDs client-side. Verify live checkout, same-account access, cancellation, refund reconciliation and customer support before acquisition traffic. Configure Stripe receipt/customer-portal management so customers can cancel without contacting the developer.

Record exact measurement windows and distinguish gross payments, refunds, net revenue and test mode. Never manufacture payments or transfer money through accounts solely to inflate an award metric.
