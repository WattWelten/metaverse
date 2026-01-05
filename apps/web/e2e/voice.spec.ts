import { test } from '@playwright/test';

test.skip(process.env.CI && !process.env.LIVEKIT_TEST, 'skip without live token');
test('voice panel mounts', async ({ page }) => {
  await page.goto('http://localhost:5173/?room=e2e');
});
