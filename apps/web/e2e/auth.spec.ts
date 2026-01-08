import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login modal on first visit', async ({ page }) => {
    await page.goto('/');

    // Wait for login modal to appear
    await expect(page.locator('text=Welcome to Metaverse')).toBeVisible();
    await expect(page.locator('input[placeholder="Username"]')).toBeVisible();
  });

  test('should login with username', async ({ page }) => {
    await page.goto('/');

    // Fill in username
    await page.fill('input[placeholder="Username"]', 'TestUser');
    await page.click('button:has-text("Enter Metaverse")');

    // Wait for login to complete (modal should disappear)
    await expect(page.locator('text=Welcome to Metaverse')).not.toBeVisible();
  });

  test('should validate username length', async ({ page }) => {
    await page.goto('/');

    // Try with too short username
    await page.fill('input[placeholder="Username"]', 'A');
    await page.click('button:has-text("Enter Metaverse")');

    // Should show error
    await expect(page.locator('text=Username must be at least 2 characters')).toBeVisible();
  });

  test('should persist session', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.fill('input[placeholder="Username"]', 'TestUser');
    await page.click('button:has-text("Enter Metaverse")');

    // Wait for login to complete
    await expect(page.locator('text=Welcome to Metaverse')).not.toBeVisible();

    // Reload page
    await page.reload();

    // Should not show login modal again (session persisted)
    await expect(page.locator('text=Welcome to Metaverse')).not.toBeVisible();
  });
});
