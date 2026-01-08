import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';
import { setSessionBeforeLoad } from './utils.js';

test('two tabs join same room', async ({ browser }) => {
  const room = 'e2e';
  const ctx1 = await browser.newContext();
  const p1 = await ctx1.newPage();
  const ctx2 = await browser.newContext();
  const p2 = await ctx2.newPage();

  await setSessionBeforeLoad(p1);
  await setSessionBeforeLoad(p2);

  await p1.goto(`http://localhost:5173/?room=${room}`);
  await p2.goto(`http://localhost:5173/?room=${room}`);

  await waitForAppReady(p1);
  await waitForAppReady(p2);
  await expect(p1.locator('#three-root')).toBeVisible();
  await expect(p2.locator('#three-root')).toBeVisible();
});
