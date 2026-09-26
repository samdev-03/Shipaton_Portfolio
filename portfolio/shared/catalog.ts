export const APP_IDS = ['rehearsal', 'care', 'meal', 'quote'] as const;
export type AppId = (typeof APP_IDS)[number];
export const brands: Record<
  AppId,
  { name: string; ink: string; color: string; background: string; tagline: string }
> = {
  rehearsal: {
    name: 'Rehearsal Room',
    ink: '#253E31',
    color: '#D7EAAB',
    background: '#F7F8F1',
    tagline: 'The real conversation starts here.',
  },
  care: {
    name: 'Care Relay',
    ink: '#344D69',
    color: '#D5E7F7',
    background: '#F5F8FA',
    tagline: 'You don’t have to carry it all.',
  },
  meal: {
    name: 'Meal Patch',
    ink: '#64402F',
    color: '#F3D5AA',
    background: '#FFF9F0',
    tagline: 'A little more satisfying.',
  },
  quote: {
    name: 'Quote to Cash',
    ink: '#463B65',
    color: '#E3DCF6',
    background: '#F8F6FC',
    tagline: 'Clear scope. Confident quotes.',
  },
};
export const scenarios = [
  {
    id: 'workload',
    category: 'BOUNDARIES',
    title: 'When your plate is full',
    goal: 'Name your capacity and agree on one next step.',
    opening: 'I need you to take on the client deck today. Can you make that happen?',
    counterpart: 'A busy manager who needs a client presentation finished.',
    premium: false,
  },
  {
    id: 'credit',
    category: 'RECOGNITION',
    title: 'When your work goes unnoticed',
    goal: 'Make your contribution visible without blame.',
    opening: 'Great work from the team on that launch. What did you want to discuss?',
    counterpart: 'A manager who has overlooked your contribution.',
    premium: false,
  },
  {
    id: 'raise',
    category: 'GROWTH',
    title: 'Ask for a raise',
    goal: 'Connect your impact to a clear request.',
    opening: 'You asked for time to discuss compensation. Tell me more.',
    counterpart: 'A manager with a limited budget but open to evidence.',
    premium: true,
  },
  {
    id: 'feedback',
    category: 'LEADERSHIP',
    title: 'Give useful feedback',
    goal: 'Describe an observation and invite a useful change.',
    opening: 'You said you wanted to talk about how our last meeting went?',
    counterpart: 'A colleague who frequently interrupts.',
    premium: true,
  },
  {
    id: 'interview',
    category: 'OPPORTUNITY',
    title: 'Tell your career story',
    goal: 'Describe your role, an action, and what changed.',
    opening: 'Tell me about a time you worked through a difficult situation.',
    counterpart: 'A fair, curious job interviewer.',
    premium: true,
  },
  {
    id: 'scope',
    category: 'CLIENTS',
    title: 'Keep the scope clear',
    goal: 'Offer a clear choice when a request grows.',
    opening: 'Could you add just a few more things before delivery? Same budget, of course.',
    counterpart: 'A client requesting extra work without more budget.',
    premium: true,
  },
];
export const plans: Record<AppId, { free: string[]; pro: string[] }> = {
  rehearsal: {
    free: ['Two guided scenarios', 'Retry any moment', 'Saved practice and reminders'],
    pro: [
      'All six scenarios',
      'Optional AI counterpart and feedback (ages 18+)',
      'Optional voice transcription (ages 18+)',
    ],
  },
  care: {
    free: ['One care circle', 'Shared tasks and invitations', 'Acknowledgment and handoff'],
    pro: ['Multiple circles', 'Reusable task templates'],
  },
  meal: {
    free: ['Meal addition suggestions', 'Allergy, time and budget filters', 'Save ten meals'],
    pro: ['Unlimited saved meals', 'Weekly planning and shopping list'],
  },
  quote: {
    free: ['Three quotes per month', 'Expiring customer approval links', 'Itemized totals'],
    pro: ['Unlimited quotes', 'Reusable scope templates'],
  },
};
export const growthEvents = [
  'experiment_exposed',
  'paywall_viewed',
  'scenario_started',
  'moment_retried',
  'rehearsal_completed',
  'circle_created',
  'task_completed',
  'meal_saved',
  'quote_created',
  'quote_accepted',
  'purchase_verified',
  'funnel_opened',
] as const;
