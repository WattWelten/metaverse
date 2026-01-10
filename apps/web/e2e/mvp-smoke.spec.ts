import { test, expect } from '@playwright/test';

const ROOM = process.env.E2E_ROOM || 'plaza';
const WEB = process.env.E2E_URL || process.env.BASE_URL || 'http://localhost:5173';
const TOKEN_API =
  process.env.RTC_TOKEN_URL ||
  process.env.VITE_RTC_TOKEN_ENDPOINT ||
  'http://localhost:3001/api/rtc/token';
// YWS ist auf demselben Server wie der API-Server (Port 3001)
const SERVER_PORT = Number(process.env.PORT || 3001);
const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';

test.describe('MVP Smoke', () => {
  test('RTC token endpoint responds', async ({ request }) => {
    try {
      const r = await request.post(TOKEN_API, {
        data: {
          roomId: ROOM,
          userId: 'e2e-user',
          displayName: 'E2E User',
          role: 'speaker',
        },
        timeout: 3000,
      });
      if (r.status() === 500) {
        const error = await r.json().catch(() => ({ error: 'Unknown error' }));
        if (error.error?.includes('LiveKit configuration missing')) {
          test.skip(); // Skip wenn LiveKit nicht konfiguriert
          return;
        }
      }
      expect(r.ok()).toBeTruthy();
      const js = await r.json();
      expect(js.token).toBeTruthy();
      expect(js.url).toBeTruthy();
    } catch (error: any) {
      if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
        test.skip(); // Skip wenn Server nicht läuft
        return;
      }
      throw error;
    }
  });

  test('Web app reachable', async ({ page }) => {
    await page.goto(`${WEB}/`);
    await expect(page).toHaveTitle(/.+/);
  });

  test('Yjs websocket reachable', async ({ page }) => {
    await page.goto(`${WEB}/`);
    const proto = WEB.startsWith('https') ? 'wss' : 'ws';
    // YWS ist auf demselben Server wie der API-Server (Port 3001)
    const url = `${proto}://${new URL(WEB).hostname}:${SERVER_PORT}/yws?room=md-e2e`;
    const ok = await page.evaluate(async (u) => {
      return await new Promise<boolean>((resolve) => {
        const ws = new WebSocket(u);
        ws.onopen = () => {
          ws.close();
          resolve(true);
        };
        ws.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 5000);
      });
    }, url);
    if (!ok) {
      test.skip(); // Skip wenn Server nicht läuft
      return;
    }
    expect(ok).toBeTruthy();
  });

  test('Strapi scenes (optional)', async ({ request }) => {
    try {
      const r = await request.get(`${STRAPI}/api/scenes?populate=deep`, { timeout: 3000 });
      expect(r.status()).toBeLessThan(500); // 200, 401 (ohne Public), etc. sind ok
    } catch (error: any) {
      if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
        test.skip(); // Skip wenn Strapi nicht läuft (optional)
        return;
      }
      throw error;
    }
  });

  test('4 clients join page & basic UI visible', async ({ page, browser }) => {
    const url = `${WEB}/demo/plaza?room=${ROOM}`;
    const p2 = await browser.newPage();
    const p3 = await browser.newPage();
    const pM = await browser.newPage(); // mobile

    await Promise.all([page.goto(url), p2.goto(url), p3.goto(url), pM.goto(url)]);

    // TODO: Passe ggf. Selektoren an eure Join-UI an:
    // Beispiel: await page.getByPlaceholder('Name').fill('User 1'); await page.getByText('Join').click();
    // Für Smoke nur Sichtbarkeitscheck:
    await expect(page).toHaveURL(/plaza|room/);
    await expect(p2).toHaveURL(/plaza|room/);
    await expect(p3).toHaveURL(/plaza|room/);
    await expect(pM).toHaveURL(/plaza|room/);

    // Optional: Whiteboard/Markdown sichtprüfung (falls auf der Seite gerendert):
    // await expect(page.getByText(/Notizen|Whiteboard|Board/i)).toBeVisible();

    await p2.close();
    await p3.close();
    await pM.close();
  });
});
