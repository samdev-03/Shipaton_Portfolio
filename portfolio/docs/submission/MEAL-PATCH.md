# Meal Patch — entry draft

**Tagline:** Start with your meal. Find a little more satisfaction.

Status: prepared copy. This is not a claim of release, user impact or nutritional validation.

## Inspiration

Everyday eating happens with limited time, ingredients, equipment and money. A helpful suggestion should start there. Meal Patch asks what is already on the plate and offers small additions people can choose for themselves.

## The experience

Enter a meal and pantry ingredients, choose a budget per addition and preparation time, then specify equipment, ingredients to avoid and plant-based preference. A curated engine returns up to three options that fit those constraints, with ingredients, steps and estimated cost. Save chosen additions for later. Pro adds unlimited saves and a weekly plan whose shopping list combines ingredients.

There are no calorie targets, macro dashboards, weight goals, red/green food judgments or restrictive plans. The meal does not receive a “good” or “bad” score. Each option explains a concrete texture, flavor or practical addition. Costs are estimates and each option is budgeted separately. Ingredient filters do not replace checking labels or cross-contact warnings.

## Technical approach

Constraint checking happens on the server, including when a meal is saved, so a modified client cannot submit an addition that violates the chosen settings. The test suite covers all combinations of the supported allergen exclusions. Suggestions are drawn from nine editable curated recipes; the product does not claim comprehensive dietetic coverage or use an unreviewed model to invent allergy-safe recipes.

RevenueCat supports paid planning while free users keep suggestions and ten saved meals. Native Layers events exclude food text and dietary selections. Analytics and reminders require consent.

## What to measure next

[Record whether consenting participants found an option usable, what they actually prepared, affordability concerns and changes made.] Do not infer improved health from saved meals or app opens. For the Nutrition entry, describe practical user benefit and compassionate flexibility using those observations.

HAMM: [Offering and dated conversion results]. Layers: [SDK signal, experiment and learning]. BuildInPublic: [real feedback and corresponding change].

## Submission fields

Store URL: [pending] · Demo: [pending] · Native screenshot: [pending] · Judge access: [pending] · Icon: `assets/brands/meal/icon.png`.
