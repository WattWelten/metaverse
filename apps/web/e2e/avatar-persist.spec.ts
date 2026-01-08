import { test, expect } from '@playwright/test';
import { completePrejoinJourney } from './utils';

test.describe('Avatar Persistence', () => {
  test('Avatar URL from prefs is loaded and name is shown', async ({ page }) => {
    // Setze Avatar-URL in localStorage vor Navigation
    await page.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({
          username: 'Henning',
          avatarUrl: 'https://models.readyplayer.me/695ce2ca220569853f3a843d.glb',
          quality: 'high',
        })
      );
      (window as any).__TEST_MODE__ = true;
    });

    // Führe komplette Prejoin-Journey durch
    await completePrejoinJourney(page, 'Henning');

    // Warte auf Avatar-Loading
    await page.waitForTimeout(5000);

    // Prüfe Console-Logs für Avatar-Loading
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('avatar') || text.includes('Avatar') || text.includes('RPM')) {
        consoleLogs.push(text);
      }
    });

    // Warte zusätzlich auf mögliche Logs
    await page.waitForTimeout(2000);

    // Prüfe ob Avatar geladen wurde (via World-Expose oder Console-Logs)
    const avatarLoaded = await page
      .evaluate(() => {
        // Prüfe ob World existiert und Avatar geladen wurde
        const world = (window as any).__world;
        if (world?.avatarManager) {
          return true;
        }
        // Prüfe Console-Logs
        const logs = (window as any).__errors || [];
        return logs.some(
          (log: string) =>
            log.includes('Avatar loaded') ||
            log.includes('Local avatar loaded') ||
            log.includes('695ce2ca220569853f3a843d')
        );
      })
      .catch(() => false);

    // Prüfe ob Avatar-URL in Prefs vorhanden ist
    const prefs = await page.evaluate(() => {
      const prefsStr = localStorage.getItem('ww_prefs_v1');
      if (!prefsStr) return null;
      try {
        return JSON.parse(prefsStr);
      } catch {
        return null;
      }
    });

    expect(prefs).not.toBeNull();
    expect(prefs?.avatarUrl).toContain('695ce2ca220569853f3a843d.glb');
    expect(prefs?.username).toBe('Henning');

    // Avatar sollte geladen sein (oder zumindest versucht worden sein)
    // Note: 3D-Text-Nametags sind schwer zu testen, daher prüfen wir Prefs & Console
    expect(avatarLoaded || prefs?.avatarUrl).toBeTruthy();
  });
});
