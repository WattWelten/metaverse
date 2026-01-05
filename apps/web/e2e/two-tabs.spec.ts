import { test, expect } from '@playwright/test';

test('two tabs join same room', async ({ browser }) => {
  const room = 'e2e';
  const ctx1 = await browser.newContext();
  const p1 = await ctx1.newPage();
  const ctx2 = await browser.newContext();
  const p2 = await ctx2.newPage();
  await p1.goto(`http://localhost:5173/?room=${room}`);
  await p2.goto(`http://localhost:5173/?room=${room}`);
  await expect(p1.locator('#three-root')).toBeVisible();
  await expect(p2.locator('#three-root')).toBeVisible();
});
