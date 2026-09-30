# Device demonstration scripts

Record each app separately on the platform being submitted. Target 95–110 seconds; leave a few seconds of margin under two minutes. Use fictional names and tasks. Prepare a reviewer account before recording and hide recovery codes, keys and personal notifications. Record actual behavior; label jump cuts and use no unlicensed music. The Rehearsal Room screenshots in submission/native-captures are original native simulator captures; unrelated web previews do not prove native behavior.

## Rehearsal Room · target 105 seconds

| Time | Device action | Narration |
| --- | --- | --- |
| 0–12 | Show home; open workload scenario | “A difficult conversation can feel hard before it even begins. Rehearsal Room gives you a private place to find your next sentence.” |
| 12–25 | Set readiness, enter guided practice | “Choose a realistic workplace moment and say how ready you feel. Guided practice is free for two scenarios and does not send your conversation to an AI service.” |
| 25–43 | Enter “I cannot take on another project.”; show response and feedback | “Try a response in your own words. You get one small adjustment. These are informal wording cues, not a score of your personality or career.” |
| 43–62 | Retry that turn with “I understand the deadline. Could we move the deck to Friday?” | “The useful moment is the retry. Change one response and explore a different branch without starting over.” |
| 62–78 | Finish and reflect; show saved practice | “Record how ready you feel now. Your practice stays private, and you can revisit or delete it.” |
| 78–93 | Show the actual native paywall and restore control; show consent settings | “Pro adds all six scenarios. RevenueCat powers the monthly and annual options. Optional AI and voice are available only to adults, with their permission.” |
| 93–105 | Show privacy controls, then home | “Guided practice is available from age 16, with guardian permission under 18. You control processing, export and deletion in Settings. A little practice before the real conversation.” |

The tester confirmed build 4 voice transcription and the requested fallback/reflection/export/deletion checks pass on September 30. Purchase/restore passed on build 2, and live AI checks pass. The core 105-second sequence above is sufficient; include an actual AI/voice moment only if it fits without losing the complete retry loop or native subscription screen. OneSignal and Layers are not configured in this release, so omit notification and experiment claims. Sandbox transactions are not live revenue evidence.

## Care Relay · target 100 seconds

| Time | Device action | Narration |
| --- | --- | --- |
| 0–15 | Open circle and show members | “When people want to help, coordination can still fall on one person. Care Relay gives a trusted circle a clear shared next step.” |
| 15–32 | Add “Pick up groceries” with a short note | “Add an everyday task. Only people in this circle can see it.” |
| 32–50 | On second consenting test account, claim and acknowledge | “Claiming shows intention. Acknowledging makes acceptance explicit. The circle can tell the difference.” |
| 50–70 | Hand off to another test member; show recipient acknowledgment | “If plans change, hand the task over. The recipient needs to acknowledge it before completing it.” |
| 70–85 | Complete; show updated state on first account | “Everyone sees who has responsibility and what has been done. Essential shared care stays free.” |
| 85–100 | Show templates and privacy controls | “Pro supports multiple circles and reusable templates. Export, leave and deletion controls are visible. This is everyday coordination, not emergency or clinical care.” |

Use two real test devices/accounts for handoff footage. Do not claim social impact from a synthetic task.

## Meal Patch · target 100 seconds

| Time | Device action | Narration |
| --- | --- | --- |
| 0–16 | Show home; enter tomato soup | “Meal Patch starts with what you already have. No food grades or calorie target—just a few possibilities for your next meal.” |
| 16–35 | Enter pantry, budget, time and exclusions | “Choose the time, equipment and budget that fit today. Keep any ingredient restrictions you need.” |
| 35–58 | Generate additions; open/read ingredient steps | “Curated additions explain what to add, how to prepare it, and an estimated cost. Every option is checked against your settings. Labels and cross-contact still matter.” |
| 58–75 | Select and save an addition | “Choose the addition you actually want and save the meal. You stay in charge of what sounds satisfying.” |
| 75–92 | With verified Pro, add a plan date and show ingredient list | “Optional Pro planning helps you reuse saved meals and gather the ingredients for your week.” |
| 92–100 | Return home | “Small, practical additions. At your pace, with the meal you already have.” |

## Quote to Cash · target 105 seconds

| Time | Device action | Narration |
| --- | --- | --- |
| 0–15 | Show quote book, create draft | “For an independent home cleaner, a clear quote can prevent an unclear job.” |
| 15–38 | Enter scope, two items, tax and deposit | “Write what is included and excluded, add the items, and check the total. The server calculates in integer cents.” |
| 38–58 | Save, create link; open in a customer browser | “Share an expiring approval link. The customer can review the scope and total without opening another account.” |
| 58–75 | Enter fictional customer acceptance; refresh quote book | “Acceptance is recorded. The service payment is arranged directly with the business; accepting here does not charge a card.” |
| 75–93 | Show actual RevenueCat/Stripe funnel and native entitlement, if configured | “The app subscription can start in a RevenueCat web funnel using Stripe. Sign into the same account on mobile and verified access follows.” |
| 93–105 | Show templates and follow-up reminder | “Reusable scopes and a personal follow-up reminder help move the next job forward.” |

For final export, add accurate English captions and verify audio levels and readability at mobile size. Upload publicly to YouTube or Vimeo, check signed-out playback and put the exact URL and duration in the evidence ledger.
