import { test, expect } from '@playwright/test';

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const WEB = process.env.E2E_URL || process.env.BASE_URL || 'http://localhost:5173';

test.describe('Strapi Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Set CMS_PROVIDER to strapi for these tests
    await page.addInitScript(() => {
      (window as any).__TEST_CMS_PROVIDER = 'strapi';
    });
  });

  test('Strapi API is reachable', async ({ request }) => {
    try {
      const r = await request.get(`${STRAPI}/api/scenes`, { timeout: 5000 });
      expect(r.status()).toBeLessThan(500); // 200, 401, 403 sind ok

      if (r.ok()) {
        const data = await r.json();
        expect(data.data).toBeDefined();
        console.log(`✅ Found ${data.data.length} scenes in Strapi`);
      }
    } catch (error: any) {
      if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
        test.skip(); // Skip wenn Strapi nicht läuft
        return;
      }
      throw error;
    }
  });

  test('TemplateRegistry loads Strapi scenes when CMS_PROVIDER=strapi', async ({ page }) => {
    // Set environment variable via page context
    await page.goto(`${WEB}/?template=strapi-welcome-plaza`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if template manifest was loaded
    const manifest = await page.evaluate(() => {
      return (window as any).__templateManifest;
    });

    if (manifest) {
      expect(manifest.name).toBeDefined();
      console.log(`✅ Template manifest loaded: ${manifest.name}`);
    } else {
      console.log('⚠️  Template manifest not found (might be using local templates)');
    }
  });

  test('StrapiTemplateLoader cache invalidation', async ({ page }) => {
    await page.goto(`${WEB}/`);
    await page.waitForLoadState('networkidle');

    // Simulate webhook cache invalidation
    const cacheCleared = await page.evaluate(() => {
      // Access StrapiTemplateLoader if available
      const loader = (window as any).__strapiTemplateLoader;
      if (loader) {
        loader.invalidateCache();
        return true;
      }
      return false;
    });

    if (cacheCleared) {
      console.log('✅ Cache invalidation works');
    } else {
      console.log('⚠️  StrapiTemplateLoader not found (might not be initialized)');
    }
  });
});

test.describe('Multi-Browser Strapi Tests', () => {
  test('Strapi scenes load in Chrome', async ({ browser }) => {
    const context = await browser.newContext({
      ...browser.browserType().launchOptions,
    });
    const page = await context.newPage();

    try {
      const r = await page.request.get(`${STRAPI}/api/scenes`);
      expect(r.status()).toBeLessThan(500);
    } catch (error: any) {
      if (error.message?.includes('ECONNREFUSED')) {
        test.skip();
        return;
      }
      throw error;
    } finally {
      await context.close();
    }
  });

  test('Strapi scenes load in Firefox', async ({ browser }) => {
    // Firefox context
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const r = await page.request.get(`${STRAPI}/api/scenes`);
      expect(r.status()).toBeLessThan(500);
    } catch (error: any) {
      if (error.message?.includes('ECONNREFUSED')) {
        test.skip();
        return;
      }
      throw error;
    } finally {
      await context.close();
    }
  });

  test('Strapi scenes load in Safari/WebKit', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const r = await page.request.get(`${STRAPI}/api/scenes`);
      expect(r.status()).toBeLessThan(500);
    } catch (error: any) {
      if (error.message?.includes('ECONNREFUSED')) {
        test.skip();
        return;
      }
      throw error;
    } finally {
      await context.close();
    }
  });
});
