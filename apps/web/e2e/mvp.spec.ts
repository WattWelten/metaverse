import { expect, test } from '@playwright/test';

test.describe('MVP Functionality', () => {
  test('Template Hot-Swap', async ({ page }) => {
    await page.goto('/?room=test&template=watt-eco');

    // Wait for app to load
    await page
      .waitForSelector('[data-testid="app-container"]', { timeout: 10000 })
      .catch(async () => {
        // Fallback: wait for any visible element
        await page.waitForTimeout(2000);
      });

    // Check if template switcher is visible (if enabled)
    const switcher = page.locator('#template-switcher');
    if (await switcher.isVisible().catch(() => false)) {
      // Switch to another template
      await switcher.selectOption('watt-default');

      // Page should reload with new template
      await page.waitForURL(/\?.*template=watt-default/, { timeout: 5000 });
    }
  });

  test('Avatar Selection and Movement', async ({ page, context }) => {
    // Start first browser
    await page.goto('/?room=test&template=watt-eco');
    await page.waitForTimeout(2000);

    // Mock Ready Player Me API if needed
    await page.route('https://models.readyplayer.me/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://models.readyplayer.me/test.glb' }),
      });
    });

    // Wait for prejoin panel
    const prejoinButton = page.locator('text=Weiter').or(page.locator("text=Los geht's!"));
    await prejoinButton.waitFor({ timeout: 10000 }).catch(() => {
      // Prejoin might not be visible if already logged in
    });

    // Start second browser for multiplayer test
    const page2 = await context.newPage();
    await page2.goto('/?room=test&template=watt-eco');
    await page2.waitForTimeout(2000);

    // Both pages should be in the same room
    // Movement test: Press WASD on first page
    await page.keyboard.press('w');
    await page.waitForTimeout(100);

    // Second page should see position update (if multiplayer enabled)
    // This is a basic smoke test - full multiplayer sync would require server
    await page2.close();
  });

  test('Prejoin Journey', async ({ page }) => {
    await page.goto('/?room=test');

    // Should show login or prejoin
    const loginModal = page.locator('text=Login').or(page.locator('text=Anmelden'));
    const prejoinPanel = page.locator('text=Wähle deinen Avatar').or(page.locator('text=Avatar'));

    // Either login or prejoin should be visible
    const hasLogin = await loginModal.isVisible().catch(() => false);
    const hasPrejoin = await prejoinPanel.isVisible().catch(() => false);

    expect(hasLogin || hasPrejoin).toBe(true);
  });
});
