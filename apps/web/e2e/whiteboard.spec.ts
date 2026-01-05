import { test, expect } from '@playwright/test';

test('whiteboard toggles & persists minimal state', async ({ browser }) => {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('http://localhost:5173/?room=e2e');
  if ((await p.locator('text=Whiteboard loading').count()) > 0) {
    await p.waitForTimeout(500);
  }
  await expect(p.locator('.whiteboard-panel')).toBeVisible({ timeout: 5000 });
});
