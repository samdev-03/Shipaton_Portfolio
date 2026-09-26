# Care Relay — entry draft

Status: prepared copy; fill evidence fields only with real observations.

**Tagline:** Small tasks. Shared care. A clear next step for the people you trust.

## The problem and product

When a family or trusted group wants to help, “let me know what you need” can leave the coordination burden with one person. Care Relay makes a small task visible and makes responsibility explicit. Create a private circle, share a single-use invitation, add a task, and let a member claim it. Claiming and acknowledging are separate actions. A handoff returns the task to a state the recipient must accept before marking it complete.

The first circle, shared tasks and handoffs are free. Pro supports multiple circles and reusable templates. Members can leave, owners can delete a circle, and people control reminders, analytics and their account data. The app is for everyday coordination, not emergencies, clinical care or medical records.

## Why this could help

The intended benefit is less uncertainty over whether an offer of help has become an accepted responsibility. A small circle can see an open task, who has it, and whether it is acknowledged or complete. The product avoids public feeds, ranking family members or charging for essential acknowledgment.

Impact evidence still to collect: [number of consenting circles, observation period, tasks accepted/completed, failed handoffs, participant feedback and limitations]. Task completion alone is not proof of reduced caregiver burden; record what participants actually report and obtain permission before quoting them.

## Engineering and feasibility

Private membership checks protect circle data. Invitations expire and can be used once. Version checks reject conflicting updates, and the state machine prevents bypassing recipient acknowledgment. Stored task content is encrypted. Account deletion resets unfinished tasks assigned to the departing person and deletes circles that person owns. The UI warns about this before deletion.

Native RevenueCat subscriptions support optional organization features. OneSignal provides voluntary personal reminders, and Layers can observe non-content usage after consent. No invitation or message is automatically sent to another person.

## Learning and growth

[Describe the real recruiting channel, observed confusion, one interface change and the subsequent result.]

HAMM: [actual pricing, free/paid boundary, dated conversion and costs].

Layers: [verification, hypothesis, exposure/completion counts, limitations and next experiment].

BuildInPublic: [posts and product changes arising from feedback].

## Distinctness

Care Relay models multi-person commitments and handoffs. It has different records, permissions, workflows and audiences from the private conversation simulator, meal planner and quote tool in this portfolio.

## Submission fields

Store URL: [pending] · Demo: [pending] · Icon: `assets/brands/care/icon.png` · Native screenshot: [pending] · Judge access: [pending].
