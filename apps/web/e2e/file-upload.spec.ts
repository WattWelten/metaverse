import { test, expect } from '@playwright/test';

test.describe('File Upload', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'metaverse_session',
        JSON.stringify({
          sessionId: 'test-session-id',
          user: { userId: 'test-user-id', username: 'TestUser' },
        })
      );
    });
    await page.reload();
  });

  test('should show file upload button when logged in', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await page.waitForSelector('canvas', { timeout: 10000 });

    // File upload button should be visible
    await expect(page.locator('button:has-text("📁 Upload File")')).toBeVisible();
  });

  test('should open file upload panel', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Click upload button
    await page.click('button:has-text("📁 Upload File")');

    // Panel should open
    await expect(page.locator('text=File Upload')).toBeVisible();
  });

  test('should show drag and drop area', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Open upload panel
    await page.click('button:has-text("📁 Upload File")');

    // Drag and drop area should be visible
    await expect(page.locator('text=Drag & drop a file here or click to browse')).toBeVisible();
  });
});
