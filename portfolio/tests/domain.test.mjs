import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allergens,
  mealPatches,
  quoteTotals,
  taskTransition,
  guidedFeedback,
  experimentVariant,
  validDate,
} from '../shared/domain.ts';
test('money uses integer cents and bounded quantities; tax and deposit round once', () => {
  assert.deepEqual(quoteTotals([{ description: 'Job', quantity: 3, unitCents: 333 }], 725, 25), {
    subtotalCents: 999,
    taxCents: 72,
    totalCents: 1071,
    depositCents: 268,
  });
  for (const bad of [-1, 1.5, 1001])
    assert.throws(() => quoteTotals([{ description: 'Job', quantity: bad, unitCents: 10 }]));
  assert.throws(() => quoteTotals([{ description: 'Job', quantity: 1000, unitCents: 10000000 }]));
});
test('every allergen combination preserves all meal constraints', () => {
  for (let mask = 0; mask < 512; mask++) {
    const avoid = allergens.filter((_, i) => mask & (1 << i));
    for (const vegan of [true, false]) {
      const input = {
        name: 'Soup',
        pantry: 'lemon',
        budgetCents: 150,
        minutes: 5,
        equipment: [],
        avoid,
        vegan,
      };
      for (const p of mealPatches(input)) {
        assert.ok(p.allergens.every((a) => !avoid.includes(a)));
        assert.ok(!vegan || p.vegan);
        assert.ok(p.costCents <= 150 && p.minutes <= 5 && p.equipment.length === 0);
      }
    }
  }
});
test('handoff requires owner and recipient acknowledgment', () => {
  let t = taskTransition({ status: 'open', assignee: null }, 'a', 'claim');
  assert.throws(() => taskTransition(t, 'b', 'complete'));
  assert.throws(() => taskTransition(t, 'a', 'complete'));
  t = taskTransition(t, 'a', 'acknowledge');
  t = taskTransition(t, 'a', 'handoff', 'b');
  assert.equal(t.status, 'claimed');
  assert.throws(() => taskTransition(t, 'b', 'complete'));
  assert.equal(
    taskTransition(taskTransition(t, 'b', 'acknowledge'), 'b', 'complete').status,
    'done',
  );
});
test('wording cues are deterministic, dates strict, experiment stable', () => {
  assert.deepEqual(
    guidedFeedback('I understand. Could we meet Friday?'),
    guidedFeedback('I understand. Could we meet Friday?'),
  );
  assert.match(guidedFeedback('Hi').label, /not a validated/);
  assert.equal(experimentVariant('same'), experimentVariant('same'));
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2026-09-30'), true);
});
