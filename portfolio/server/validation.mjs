import { z } from 'zod';
export function fail(status, message) {
  throw Object.assign(Error(message), { status });
}
export function parse(schema, value) {
  const r = schema.safeParse(value);
  if (!r.success)
    fail(
      400,
      'Check your inputs: ' +
        r.error.issues
          .map((i) => i.path.join('.') + ' ' + i.message)
          .slice(0, 3)
          .join('; '),
    );
  return r.data;
}
const s = (max = 200) => z.string().trim().min(1).max(max),
  optional = (max = 2000) => z.string().trim().max(max).default('');
export const schemas = {
  register: z
    .object({
      name: s(80),
      email: z
        .email()
        .max(254)
        .transform((x) => x.toLowerCase()),
      password: z.string().min(12).max(128),
      accepted: z.literal(true),
    })
    .strict(),
  login: z
    .object({
      email: z
        .email()
        .max(254)
        .transform((x) => x.toLowerCase()),
      password: z.string().min(1).max(128),
    })
    .strict(),
  recover: z
    .object({
      email: z.email().transform((x) => x.toLowerCase()),
      recoveryCode: s(100),
      password: z.string().min(12).max(128),
    })
    .strict(),
  preferences: z
    .object({ analytics: z.boolean(), notifications: z.boolean(), ai: z.boolean() })
    .strict(),
  start: z
    .object({
      scenarioId: s(30),
      mode: z.enum(['guided', 'ai']),
      confidence: z.number().int().min(1).max(5),
    })
    .strict(),
  turn: z
    .object({
      text: s(3000),
      version: z.number().int().positive(),
      retryIndex: z.number().int().min(1).optional(),
    })
    .strict(),
  complete: z.object({ confidence: z.number().int().min(1).max(5) }).strict(),
  name: z.object({ name: s(80) }).strict(),
  invite: z.object({ code: s(100) }).strict(),
  task: z.object({ title: s(200), note: optional() }).strict(),
  transition: z
    .object({
      action: z.enum(['claim', 'acknowledge', 'complete', 'handoff', 'release']),
      target: z.uuid().optional(),
      version: z.number().int().positive(),
    })
    .strict(),
  meal: z
    .object({
      name: s(120),
      pantry: optional(500),
      budgetCents: z.number().int().min(0).max(10000),
      minutes: z.number().int().min(1).max(120),
      equipment: z.array(z.enum(['stove', 'microwave', 'toaster'])).max(3),
      avoid: z
        .array(
          z.enum([
            'milk',
            'eggs',
            'fish',
            'shellfish',
            'tree nuts',
            'peanuts',
            'wheat',
            'soy',
            'sesame',
          ]),
        )
        .max(9),
      vegan: z.boolean(),
    })
    .strict(),
  quote: z
    .object({
      business: s(100),
      customer: s(100),
      scope: s(4000),
      notes: optional(2000),
      validUntil: s(10),
      items: z
        .array(
          z
            .object({
              description: s(200),
              quantity: z.number().int().min(1).max(1000),
              unitCents: z.number().int().min(0).max(10000000),
            })
            .strict(),
        )
        .min(1)
        .max(30),
      taxBps: z.number().int().min(0).max(3000),
      depositPercent: z.number().int().min(0).max(100),
    })
    .strict(),
  accept: z.object({ name: s(100), accepted: z.literal(true) }).strict(),
  reminder: z.object({ id: z.uuid(), dueAt: z.iso.datetime() }).strict(),
  template: z.object({ name: s(100), content: s(4000) }).strict(),
  event: z.object({ id: z.uuid(), name: s(80) }).strict(),
};
