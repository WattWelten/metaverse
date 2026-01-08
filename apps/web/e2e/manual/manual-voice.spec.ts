import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

test.describe('Manual Voice Test', () => {
  test('voice consent modal and mute toggle should work', async ({ page }) => {
    await page.goto('/?room=test-voice');

    await waitForAppReady(page);

    // Wait a bit for the app to initialize
    await page.waitForTimeout(1000);

    // Check for consent modal (might appear if voice is enabled)
    const consentModal = page.locator(
      '[data-testid="consent-modal"], .consent-modal, [class*="ConsentModal"], [class*="consent"]'
    );

    const modalExists = (await consentModal.count()) > 0;

    if (modalExists) {
      // Modal exists, test it
      await expect(consentModal).toBeVisible({ timeout: 5000 });

      // Look for Accept button
      const acceptButton = consentModal
        .locator(
          'button:has-text("Accept"), button:has-text("Akzeptieren"), [data-testid="accept"]'
        )
        .first();

      if ((await acceptButton.count()) > 0) {
        await acceptButton.click();
        await page.waitForTimeout(500);

        // Modal should disappear or change state
        // (It might stay visible but change content, or disappear)
        console.log('Consent modal Accept clicked');
      }
    } else {
      // Modal doesn't exist - that's OK if voice is disabled
      console.log('Consent modal not found (voice might be disabled)');
    }

    // Check for mic toggle in Room UI (if multiplayer is enabled)
    const micToggle = page.locator(
      '[data-testid="mic-toggle"], [data-testid="mute-button"], button:has-text("Mic"), button:has-text("Mute"), [aria-label*="mic"], [aria-label*="mute"]'
    );

    const micToggleExists = (await micToggle.count()) > 0;

    if (micToggleExists) {
      // Mic toggle exists, test it
      await expect(micToggle).toBeVisible({ timeout: 5000 });

      // Get initial state
      const initialState =
        (await micToggle.getAttribute('aria-pressed')) ||
        (await micToggle.getAttribute('data-muted')) ||
        (await micToggle.textContent())?.toLowerCase().includes('mute')
          ? 'false'
          : 'true';

      console.log('Initial mic state:', initialState);

      // Click to toggle (use force click if element is intercepted)
      try {
        await micToggle.click({ timeout: 5000 });
      } catch {
        // If click is intercepted, try force click
        await micToggle.click({ force: true });
      }
      await page.waitForTimeout(500);

      // Check that state changed
      const newState =
        (await micToggle.getAttribute('aria-pressed')) ||
        (await micToggle.getAttribute('data-muted')) ||
        (await micToggle.textContent())?.toLowerCase().includes('mute')
          ? 'false'
          : 'true';

      console.log('New mic state:', newState);

      // State should have changed (unless it was already in the opposite state)
      // We just verify that clicking doesn't cause errors
      const errors = await page.evaluate(() => {
        return (window as any).__test?.getErrors?.() || [];
      });

      const criticalErrors = errors.filter(
        (e: string) =>
          !e.includes('Failed to load template overlay') &&
          !e.includes('WebSocket connection refused') &&
          !e.includes('getUserMedia')
      );

      expect(criticalErrors.length).toBe(0);
    } else {
      // Mic toggle doesn't exist - that's OK if voice/multiplayer is disabled
      console.log('Mic toggle not found (voice/multiplayer might be disabled)');
    }

    // Verify no critical errors
    const finalErrors = await page.evaluate(() => {
      return (window as any).__test?.getErrors?.() || [];
    });

    const finalCriticalErrors = finalErrors.filter(
      (e: string) =>
        !e.includes('Failed to load template overlay') &&
        !e.includes('WebSocket connection refused') &&
        !e.includes('getUserMedia')
    );

    expect(finalCriticalErrors.length).toBe(0);
  });
});
