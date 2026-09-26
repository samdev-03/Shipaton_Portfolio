# Measured growth plan

## First-step copy experiment already implemented

`first_step_copy_v1` assigns A/B deterministically from the opaque account ID. The assignment stays stable; no personal text is hashed into it. A home-screen exposure is recorded only with analytics consent. Session/visit exposures may repeat: calculate conversion using distinct exposed users, not raw exposure counts. Native Layers events and first-party aggregates are separate measurement surfaces and should not be added together.

| App | Variant A | Variant B | Primary outcome |
| --- | --- | --- | --- |
| Rehearsal Room | Start a small practice → | Find my next sentence → | Completed first rehearsal within 24 hours |
| Care Relay | Create circle | Start my circle | Created first circle, then a task completed within 48 hours |
| Meal Patch | Find my meal patches → | Find additions that fit → | Saved first meal within 24 hours |
| Quote to Cash | New quote + | Start a clear quote + | Created first quote within 24 hours |

Hypothesis: a concrete outcome-oriented invitation may help a new user begin. This is a testable hypothesis, not a conversion claim. Keep price, acquisition channel, scenario and onboarding unchanged while running the copy test. Record start/end timestamps and exclusions before looking at results. Analyze each product independently.

Proposed early-stage protocol: observe ten consenting users per app qualitatively, then run the copy test for a fixed interval if enough eligible traffic exists. Small samples are directional. Report denominators and uncertainty; a few successes do not establish a winning variant. Do not claim significance from tiny samples or repeatedly stop at a favorable result. If the deadline arrives first, report what was observed and the next experiment instead of inventing a conclusion.

## Event dictionary

| Event | Source | Interpretation |
| --- | --- | --- |
| experiment_exposed | Home render, consented client | Primary CTA was available to this account |
| scenario_started / moment_retried / rehearsal_completed | Server after successful operation; native SDK counterpart | Practice activity, not psychological improvement |
| circle_created / task_completed | Server; native SDK counterpart | Coordination activity, not a measured health/social outcome |
| meal_saved | Server; native SDK counterpart | A saved idea, not proof of food consumption |
| quote_created / quote_accepted | Server; native SDK for create | A draft or recorded acceptance, not cash received |
| paywall_viewed | Consented client | Plan screen viewed; use distinct viewers |
| purchase_verified | Server after RevenueCat reconciliation | Operational purchase event, not an accounting ledger |
| purchase_completed | Native SDK after purchase flow | SDK completion; reconcile against RevenueCat |
| funnel_opened | Authenticated server | Funnel handoff requested, not payment |

The client cannot submit financial outcome events to the first-party API. `/ops/evidence` returns aggregates with OPS_TOKEN. RevenueCat and Stripe exports are the sources for money, refunds and payment volume. Consent creates selection bias: analytics cohorts do not represent every user.

## Record a complete learning

Fill `metrics-template.json` with real observations. For each experiment: audience → message/surface → hypothesis → actual dates → assigned/exposed users → successful outcomes → qualitative notes → what changed → next test. Retain dashboard captures and build version. Separate internal QA accounts and test transactions from production cohorts.

For the flagship, interview willing new managers after one practice: What sentence did you want to change? Was the feedback specific enough to try? What would bring you back before a real conversation? Ask about perceived usefulness without implying a promised career outcome.

For Care Relay, observe a two-person handoff and ask whether responsibility was clear. For Meal Patch, ask what addition was affordable and practical. For Quote to Cash, time the path to a usable scope and ask what would prevent sending it to a customer. Get permission for any quote you publish and use anonymous summaries by default.
