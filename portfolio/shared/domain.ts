export function experimentVariant(id: string) {
  let h = 2166136261;
  for (const c of id) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 2 ? 'B' : 'A';
}
export type LineItem = { description: string; quantity: number; unitCents: number };
export function quoteTotals(items: LineItem[], taxBps = 0, depositPercent = 0) {
  if (
    !items.length ||
    items.length > 30 ||
    !Number.isInteger(taxBps) ||
    taxBps < 0 ||
    taxBps > 3000 ||
    !Number.isInteger(depositPercent) ||
    depositPercent < 0 ||
    depositPercent > 100
  )
    throw Error('Invalid quote.');
  let subtotalCents = 0;
  for (const i of items) {
    if (
      !Number.isInteger(i.quantity) ||
      i.quantity < 1 ||
      i.quantity > 1000 ||
      !Number.isInteger(i.unitCents) ||
      i.unitCents < 0 ||
      i.unitCents > 10000000
    )
      throw Error('Invalid line item.');
    subtotalCents += i.quantity * i.unitCents;
  }
  if (subtotalCents > 100000000) throw Error('Quote is too large.');
  const taxCents = Math.round((subtotalCents * taxBps) / 10000),
    totalCents = subtotalCents + taxCents;
  return {
    subtotalCents,
    taxCents,
    totalCents,
    depositCents: Math.round((totalCents * depositPercent) / 100),
  };
}
export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const validDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  Number.isFinite(Date.parse(s)) &&
  new Date(s).toISOString().slice(0, 10) === s;
export function guidedFeedback(text: string) {
  const empathy = /understand|appreciate|hear|thank|together/i.test(text),
    specific = /friday|monday|today|tomorrow|\d|by |could we|can we/i.test(text),
    clear = /\bI\b|\bmy\b|\bwe\b/.test(text);
  return {
    clarity: clear ? 3 : 1,
    empathy: empathy ? 3 : 1,
    specificity: specific ? 3 : 1,
    strength: empathy
      ? 'You made room for the other person’s perspective.'
      : 'You put a response into words. That is a useful first step.',
    next: specific
      ? 'Try ending with one question that makes the next step easy to agree on.'
      : 'Try naming one concrete option and when it could happen.',
    label: 'Guided wording cues, not a validated assessment',
  };
}
export function guidedReply(text: string) {
  return /could we|can we|how about/i.test(text)
    ? 'That gives us something concrete to work with. What would you need from me to make it work?'
    : 'I hear you. Can you suggest a specific next step that works for both of us?';
}
export type TaskState = {
  status: 'open' | 'claimed' | 'acknowledged' | 'done';
  assignee: string | null;
};
export function taskTransition(
  t: TaskState,
  actor: string,
  action: string,
  target?: string,
): TaskState {
  if (action === 'claim' && t.status === 'open') return { status: 'claimed', assignee: actor };
  if (t.assignee !== actor) throw Error('Only the assigned person can make that change.');
  if (action === 'acknowledge' && t.status === 'claimed') return { ...t, status: 'acknowledged' };
  if (action === 'complete' && t.status === 'acknowledged') return { ...t, status: 'done' };
  if (action === 'release' && t.status !== 'done') return { status: 'open', assignee: null };
  if (action === 'handoff' && t.status === 'acknowledged' && target && target !== actor)
    return { status: 'claimed', assignee: target };
  throw Error('Acknowledge the task before completing or handing it off.');
}
export const allergens = [
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'tree nuts',
  'peanuts',
  'wheat',
  'soy',
  'sesame',
] as const;
export type Allergen = (typeof allergens)[number];
export type MealInput = {
  name: string;
  pantry: string;
  budgetCents: number;
  minutes: number;
  equipment: string[];
  avoid: string[];
  vegan: boolean;
};
export type Patch = {
  id: string;
  title: string;
  ingredients: string[];
  allergens: Allergen[];
  equipment: string[];
  vegan: boolean;
  minutes: number;
  costCents: number;
  why: string;
  steps: string;
};
export const patches: Patch[] = [
  {
    id: 'chickpea',
    title: 'Lemony chickpeas',
    ingredients: ['chickpeas', 'lemon', 'olive oil'],
    allergens: [],
    equipment: [],
    vegan: true,
    minutes: 5,
    costCents: 140,
    why: 'A hearty addition with a bright finish.',
    steps: 'Rinse canned chickpeas. Toss with lemon and olive oil. Add as much as you enjoy.',
  },
  {
    id: 'cucumber',
    title: 'Crunchy cucumber side',
    ingredients: ['cucumber', 'lemon'],
    allergens: [],
    equipment: [],
    vegan: true,
    minutes: 4,
    costCents: 100,
    why: 'A cool, crisp contrast.',
    steps: 'Slice washed cucumber and squeeze over lemon.',
  },
  {
    id: 'yogurt',
    title: 'Herby yogurt spoonful',
    ingredients: ['plain yogurt', 'herbs'],
    allergens: ['milk'],
    equipment: [],
    vegan: false,
    minutes: 3,
    costCents: 90,
    why: 'Something creamy to bring the meal together.',
    steps: 'Stir chopped herbs through plain yogurt. Spoon alongside your meal.',
  },
  {
    id: 'seeds',
    title: 'Toasted pumpkin seeds',
    ingredients: ['pumpkin seeds'],
    allergens: [],
    equipment: ['stove'],
    vegan: true,
    minutes: 5,
    costCents: 80,
    why: 'A little crunch and a nutty flavor.',
    steps: 'Warm seeds in a dry pan, stirring until fragrant. Cool slightly before adding.',
  },
  {
    id: 'egg',
    title: 'A simple scrambled egg',
    ingredients: ['egg', 'olive oil'],
    allergens: ['eggs'],
    equipment: ['stove'],
    vegan: false,
    minutes: 7,
    costCents: 100,
    why: 'A warm and filling addition.',
    steps: 'Cook beaten egg in a lightly oiled pan until set. Serve alongside.',
  },
  {
    id: 'tofu',
    title: 'Warm tofu bites',
    ingredients: ['tofu', 'olive oil', 'herbs'],
    allergens: ['soy'],
    equipment: ['stove'],
    vegan: true,
    minutes: 10,
    costCents: 160,
    why: 'A tender, savory addition.',
    steps: 'Cube tofu and warm in a lightly oiled pan. Add herbs to taste.',
  },
  {
    id: 'toast',
    title: 'Olive oil toast',
    ingredients: ['bread', 'olive oil'],
    allergens: ['wheat'],
    equipment: ['toaster'],
    vegan: true,
    minutes: 4,
    costCents: 70,
    why: 'A crisp side for dipping.',
    steps: 'Choose a bread suitable for your preferences. Toast and add a little olive oil.',
  },
  {
    id: 'avocado',
    title: 'Lemony avocado',
    ingredients: ['avocado', 'lemon'],
    allergens: [],
    equipment: [],
    vegan: true,
    minutes: 4,
    costCents: 200,
    why: 'Creaminess without much preparation.',
    steps: 'Slice avocado, squeeze over lemon, and serve.',
  },
  {
    id: 'rice',
    title: 'A warm bowl of rice',
    ingredients: ['plain microwave rice'],
    allergens: [],
    equipment: ['microwave'],
    vegan: true,
    minutes: 3,
    costCents: 150,
    why: 'A simple base to make your meal go further.',
    steps: 'Heat plain ready-cooked rice following its package instructions.',
  },
];
export function mealPatches(i: MealInput) {
  return patches
    .filter(
      (p) =>
        p.costCents <= i.budgetCents &&
        p.minutes <= i.minutes &&
        (!i.vegan || p.vegan) &&
        !p.allergens.some((a) => i.avoid.includes(a)) &&
        p.equipment.every((e) => i.equipment.includes(e)),
    )
    .sort(
      (a, b) =>
        b.ingredients.filter((x) => i.pantry.toLowerCase().includes(x)).length -
          a.ingredients.filter((x) => i.pantry.toLowerCase().includes(x)).length ||
        a.costCents - b.costCents,
    )
    .slice(0, 3);
}
