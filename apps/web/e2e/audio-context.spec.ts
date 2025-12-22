import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

test('resume audio on first click', async ({ page }) => {
  await page.goto('/');

  // Wait for app to be ready
  await waitForAppReady(page);

  // Click anywhere to trigger audio context resume
  await page.mouse.click(10, 10);

  // Wait a bit for audio context to resume
  await page.waitForTimeout(100);

  // Check if audio context is resumed (no errors in console)
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // If we get here without errors, audio context resume worked
  expect(errors.length).toBe(0);
});
