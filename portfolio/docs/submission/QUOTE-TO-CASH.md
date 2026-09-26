# Quote to Cash — entry draft

**Tagline:** Clear scope. Confident quotes. Built for independent home cleaners.

Status: prepared copy. Service payments are not collected by this app; the name describes the wider business journey.

## The product

Independent home cleaners need a clear, customer-readable scope before a job begins. Quote to Cash turns business and customer details, included work, exclusions, line items, tax and deposit terms into an itemized quote. Share an expiring approval link, record acceptance, or revoke a link. Set a personal reminder to follow up. Pro adds unlimited quotes and reusable scope templates; three quotes each month are free.

## Why one trade

A specific cleaning workflow keeps the default item, examples and scope prompts concrete. It avoids asking a solo operator to learn a full CRM before producing a useful quote. The customer can review and accept through a public capability link without creating an account. The app explains that anyone with that link can view it and that a typed acceptance is not identity verification.

## Engineering

All financial totals are calculated in integer cents on the server. Inputs are bounded, expiration dates validated, links hashed at rest, and accepted quotes cannot be changed through the sharing flow. Separate account ownership checks protect the quote book. Native subscriptions are handled by RevenueCat; an optional web-to-app acquisition path uses a RevenueCat Funnel with Stripe checkout and the same opaque app-user ID.

The Stripe integration sells access to this app. A customer's acceptance, a requested service deposit and RevenueCat-recorded subscription revenue are kept conceptually separate.

## Monetization and growth evidence

[Record the actual Offering, paywall exposure, verified paid subscriptions, refunds, revenue interval, acquisition activity and retained purchasers.] The proposed price is a hypothesis until people choose to pay. Do not label a saved quote as revenue.

Replit: [actual Replit Agent session and commits, concrete integration work, live preview, username and three stage-specific social posts]. This repository originated with Codex; importing it does not justify rewriting that history.

Stripe: [live RevenueCat Funnel URL, Stripe Project ID, successful account handoff, actual qualifying payment export].

Layers: [verified SDK, chosen experiment and observed learning]. BuildInPublic: [public feedback and the change it caused]. Grand: [RevenueCat export and sustainable growth narrative if the app qualifies].

## Submission fields

Store URL: [pending] · Demo: [pending] · Native screenshot: [pending] · Judge access: [pending] · Icon: `assets/brands/quote/icon.png`.
