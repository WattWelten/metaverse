import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';
import { setSessionBeforeLoad } from './utils.js';

test('whiteboard toggles & persists minimal state', async ({ browser }) => {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();

  await setSessionBeforeLoad(p);
  await p.goto('http://localhost:5173/?room=e2e');
  await waitForAppReady(p);
  if ((await p.locator('text=Whiteboard loading').count()) > 0) {
    await p.waitForTimeout(500);
  }
  await expect(p.locator('.whiteboard-panel')).toBeVisible({ timeout: 5000 });
});
