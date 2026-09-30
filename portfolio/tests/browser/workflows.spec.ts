import { test, expect, Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
async function signup(page: Page, app = 'rehearsal') {
  await page.goto('/?app=' + app);
  await page.getByLabel('Your name', { exact: true }).fill('Jamie');
  await page.getByLabel('Email', { exact: true }).fill(app + '-' + Date.now() + '@example.test');
  await page.getByLabel('Password', { exact: true }).fill('Test-only-password-2026');
  if (app === 'rehearsal')
    await page.getByRole('button', { name: '18 or older', exact: true }).click();
  await page.getByRole('switch', { name: 'Accept terms and privacy' }).click();
  await page.getByRole('button', { name: 'Create my account', exact: true }).click();
  await page.getByRole('button', { name: 'I saved it. Continue', exact: true }).click();
}
async function shot(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  await mkdir('artifacts/screenshots', { recursive: true });
  await page.screenshot({ path: `artifacts/screenshots/${name}-web-preview-1179x2556.png` });
}
test('teen signup explains access and blocks creation until guardian permission', async ({
  page,
}) => {
  await page.goto('/?app=rehearsal');
  await page.getByLabel('Your name', { exact: true }).fill('Jamie');
  await page.getByLabel('Email', { exact: true }).fill('teen-' + Date.now() + '@example.test');
  await page.getByLabel('Password', { exact: true }).fill('Test-only-password-2026');
  await page.getByRole('button', { name: '16–17', exact: true }).click();
  await page.getByRole('switch', { name: 'Accept terms and privacy' }).click();
  await expect(page.getByRole('button', { name: 'Create my account', exact: true })).toBeDisabled();
  await page.getByRole('switch', { name: 'Parent or guardian permission' }).click();
  await page.getByRole('button', { name: 'Create my account', exact: true }).click();
  await page.getByRole('button', { name: 'I saved it. Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Optional AI processing' })).toBeDisabled();
});
test('rehearsal: signup, practice, retry, reflect and persist', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await signup(page);
  await expect(page.getByText('The real conversation starts here.', { exact: true })).toBeVisible();
  await shot(page, 'rehearsal-home');
  await page.getByRole('button', { name: /Start a small practice|Find my next sentence/ }).click();
  await page.getByRole('button', { name: 'Step into the room →', exact: true }).click();
  await page
    .getByLabel('Your next sentence', { exact: true })
    .fill('I cannot take on another project.');
  await page.getByRole('button', { name: 'Send response →', exact: true }).click();
  await expect(page.getByText('A SMALL ADJUSTMENT', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Retry this moment', exact: true }).click();
  await page
    .getByLabel('Try a new response', { exact: true })
    .fill('I understand. Could we move the deck to Friday?');
  await page.getByRole('button', { name: 'Try that moment again →', exact: true }).click();
  await expect(
    page.getByText('I understand. Could we move the deck to Friday?', { exact: true }),
  ).toBeVisible();
  await shot(page, 'rehearsal-practice');
  await page.getByRole('button', { name: 'Finish and reflect', exact: true }).click();
  await page
    .getByRole('button', { name: 'How ready do you feel now? 4 of 5', exact: true })
    .click();
  await page.getByRole('button', { name: 'Save my practice', exact: true }).click();
  await expect(page.getByText('1 completed practice', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('1 completed practice', { exact: true })).toBeVisible();
  await shot(page, 'rehearsal-progress');
  expect(errors).toEqual([]);
});
test('care: create circle, claim, acknowledge, complete', async ({ page }) => {
  await signup(page, 'care');
  await shot(page, 'care-home');
  await page.getByLabel('Circle name', { exact: true }).fill('Sunday support');
  await page.getByRole('button', { name: /Create circle|Start my circle/ }).click();
  await page.getByLabel('Task', { exact: true }).fill('Pick up groceries');
  await page.getByLabel('Helpful details (optional)', { exact: true }).fill('Fruit and bread.');
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByRole('button', { name: 'I can help', exact: true }).click();
  await page.getByRole('button', { name: 'I’ve seen this and accept it', exact: true }).click();
  await shot(page, 'care-circle');
  await page.getByRole('button', { name: 'Mark complete', exact: true }).click();
  await expect(page.getByText('Complete', { exact: true })).toBeVisible();
});
test('meal: constrain additions, save and view', async ({ page }) => {
  await signup(page, 'meal');
  await shot(page, 'meal-home');
  await page.getByLabel('What’s on your plate?', { exact: true }).fill('Tomato soup');
  await page.getByLabel('What do you already have?', { exact: true }).fill('cucumber lemon');
  await page.getByRole('button', { name: 'milk', exact: true }).click();
  await page.getByRole('button', { name: /Find my meal patches|Find additions that fit/ }).click();
  await expect(page.getByText('A few ways to make it yours', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save this meal', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Meal saved ✓', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Your progress', exact: true }).click();
  await expect(page.getByText('Tomato soup', { exact: true })).toBeVisible();
  await shot(page, 'meal-saved');
});
test('quote: itemized quote, paywall and public privacy', async ({ page }) => {
  await signup(page, 'quote');
  await page.getByRole('button', { name: /New quote|Start a clear quote/ }).click();
  await page.getByLabel('Your business name', { exact: true }).fill('Clear House');
  await page.getByLabel('Customer name', { exact: true }).fill('Pat');
  await page
    .getByLabel('Work included and exclusions', { exact: true })
    .fill('Kitchen and bathrooms. Windows excluded.');
  await page.getByRole('button', { name: 'Save quote', exact: true }).click();
  await expect(page.getByText('Pat', { exact: true })).toBeVisible();
  await expect(page.getByText('$120.00', { exact: true })).toBeVisible();
  await shot(page, 'quote-home');
  await page.getByRole('tab', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Explore Pro', exact: true }).click();
  await expect(page.getByText('Included with Pro', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Privacy', exact: true }).click();
  await expect(page.getByText('Your privacy matters.', { exact: true })).toBeVisible();
});

test('AI report UI explains sharing, keeps failed input, and confirms submission in app', async ({
  page,
}) => {
  await signup(page);
  await page.getByRole('button', { name: /Start a small practice|Find my next sentence/ }).click();
  await page.getByRole('button', { name: 'Step into the room →', exact: true }).click();
  await expect(page.getByLabel('Your next sentence', { exact: true })).toBeVisible();
  // UI-only synthetic AI fixture; the API tests exercise the real encrypted reporting endpoint.
  await page.route('**/v1/rehearsals/*', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    const response = await route.fetch();
    const data = await response.json();
    await route.fulfill({ response, json: { ...data, mode: 'ai' } });
  });
  let submissions = 0;
  await page.route('**/v1/rehearsals/*/report', async (route) => {
    const data = route.request().postDataJSON();
    expect(data).toMatchObject({
      version: 1,
      target: 0,
      reason: 'privacy',
      note: 'Fictional concern',
      consent: true,
    });
    submissions++;
    await route.fulfill({
      status: submissions === 1 ? 503 : 201,
      json: submissions === 1 ? { error: 'Please try again.' } : { ok: true, id: 'test-report' },
    });
  });
  await page.reload();
  await page.getByRole('button', { name: 'Report AI response', exact: true }).click();
  await expect(page.getByText(/The rest of your conversation is not included/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send report', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Privacy concern', exact: true }).click();
  await page.getByLabel('Report details (optional)', { exact: true }).fill('Fictional concern');
  await page.getByRole('button', { name: 'Send report', exact: true }).click();
  await expect(page.getByText('Please try again.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Report details (optional)', { exact: true })).toHaveValue(
    'Fictional concern',
  );
  await page.getByRole('button', { name: 'Send report', exact: true }).click();
  await expect(
    page.getByText('Report received. Thank you for helping improve practice safety.', {
      exact: true,
    }),
  ).toBeVisible();
  expect(submissions).toBe(2);
});
