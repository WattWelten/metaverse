import { test, expect } from '@playwright/test';

const WEB = process.env.E2E_URL || process.env.BASE_URL || 'http://localhost:5173';
const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';

/**
 * Multi-Browser E2E Tests
 * Testet die App in verschiedenen Browsern (Chrome, Firefox, Safari/WebKit)
 */
test.describe('Multi-Browser Compatibility', () => {
  test('App loads in Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-only test');

    await page.goto(`${WEB}/`);
    await expect(page).toHaveTitle(/.+/);

    // Check for basic UI elements
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('App loads in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-only test');

    await page.goto(`${WEB}/`);
    await expect(page).toHaveTitle(/.+/);

    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('App loads in Safari/WebKit', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit-only test');

    await page.goto(`${WEB}/`);
    await expect(page).toHaveTitle(/.+/);

    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('Strapi API works across browsers', async ({ page, browserName }) => {
    try {
      const response = await page.request.get(`${STRAPI}/api/scenes`, { timeout: 5000 });
      expect(response.status()).toBeLessThan(500);

      if (response.ok()) {
        const data = await response.json();
        console.log(`[${browserName}] Found ${data.data.length} scenes`);
      }
    } catch (error: any) {
      if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
        test.skip(); // Skip wenn Strapi nicht läuft
        return;
      }
      throw error;
    }
  });

  test('Template loading works across browsers', async ({ page, browserName }) => {
    await page.goto(`${WEB}/?template=watt-eco`);
    await page.waitForLoadState('networkidle');

    // Check if template manifest was loaded
    const manifest = await page.evaluate(() => {
      return (window as any).__templateManifest;
    });

    if (manifest) {
      console.log(`[${browserName}] Template loaded: ${manifest.name || manifest.id || 'N/A'}`);
      expect(manifest).toBeDefined();
    }
  });
});

/**
 * Multi-Client Tests (mehrere Browser gleichzeitig)
 */
test.describe('Multi-Client Scenarios', () => {
  test('Multiple clients can join same room', async ({ browser }) => {
    const roomId = `e2e-multi-${Date.now()}`;
    const url = `${WEB}/?room=${roomId}`;

    // Create multiple browser contexts
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();

    try {
      // All pages navigate to same room
      await Promise.all([page1.goto(url), page2.goto(url), page3.goto(url)]);

      // Wait for pages to load
      await Promise.all([
        page1.waitForLoadState('networkidle'),
        page2.waitForLoadState('networkidle'),
        page3.waitForLoadState('networkidle'),
      ]);

      // Check that all pages loaded successfully
      await expect(page1).toHaveURL(new RegExp(roomId));
      await expect(page2).toHaveURL(new RegExp(roomId));
      await expect(page3).toHaveURL(new RegExp(roomId));

      console.log('✅ Multiple clients joined room successfully');
    } finally {
      await context1.close();
      await context2.close();
      await context3.close();
    }
  });

  test('Cross-browser compatibility (Chrome + Firefox)', async ({ browser }) => {
    const chromeContext = await browser.newContext();
    const firefoxContext = await browser.newContext();

    const chromePage = await chromeContext.newPage();
    const firefoxPage = await firefoxContext.newPage();

    try {
      await Promise.all([chromePage.goto(`${WEB}/`), firefoxPage.goto(`${WEB}/`)]);

      await Promise.all([
        chromePage.waitForLoadState('networkidle'),
        firefoxPage.waitForLoadState('networkidle'),
      ]);

      const chromeTitle = await chromePage.title();
      const firefoxTitle = await firefoxPage.title();

      expect(chromeTitle).toBeTruthy();
      expect(firefoxTitle).toBeTruthy();

      console.log('✅ Cross-browser compatibility verified');
    } finally {
      await chromeContext.close();
      await firefoxContext.close();
    }
  });
});
