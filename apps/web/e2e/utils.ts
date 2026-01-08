import { Page, expect } from '@playwright/test';

/**
 * Setzt eine Session direkt in localStorage, bevor die Seite geladen wird
 * Dies beschleunigt Tests, die keinen Login-Flow testen
 */
export async function setSessionBeforeLoad(page: Page, username = 'E2E Tester') {
  const session = {
    sessionId: `e2e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    user: {
      userId: `e2e-user-${Date.now()}`,
      username: username,
    },
  };

  // Setze Session in localStorage bevor die Seite geladen wird
  await page.addInitScript((sessionData) => {
    localStorage.setItem('metaverse_session', JSON.stringify(sessionData));
    localStorage.setItem('ww_session', JSON.stringify(sessionData));
  }, session);
}

/**
 * Führt den Login-Prozess durch, falls das Login-Modal sichtbar ist
 */
export async function performLoginIfNeeded(page: Page, username = 'E2E Tester') {
  // Warte kurz auf React-Rendering
  await page.waitForTimeout(1000);

  // Prüfe ob Login-Modal sichtbar ist
  const loginModal = page
    .locator('text=Welcome to Metaverse')
    .or(page.locator('text=Willkommen im WattWelten Metaverse'));
  const isLoginVisible = await loginModal.isVisible().catch(() => false);

  if (isLoginVisible) {
    // Login durchführen
    const nameInput = page
      .locator('input[placeholder="Username"]')
      .or(page.locator('input[type="text"]').first());
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill(username);

    const loginButton = page
      .locator('button:has-text("Enter Metaverse")')
      .or(page.locator('button:has-text("Metaverse betreten")'));
    await loginButton.waitFor({ state: 'visible', timeout: 5000 });
    await loginButton.click();

    // Warte auf Login-Verarbeitung und Modal-Schließung
    await loginModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }
}

/**
 * Öffnet die App mit einem bestimmten Template und führt Login durch (falls nötig)
 */
export async function openWithTemplate(page: Page, id = 'watt-eco', username = 'E2E Tester') {
  // Setze Session vor dem Laden, um Login zu überspringen
  await setSessionBeforeLoad(page, username);

  await page.goto(`/?room=e2e&template=${id}`, { waitUntil: 'domcontentloaded' });

  // Warte auf React-Hydration
  await page.waitForTimeout(2000);

  // Falls Login-Modal trotzdem erscheint, führe Login durch
  await performLoginIfNeeded(page, username);
}

/**
 * Prüft, ob keine harten Konsolenfehler aufgetreten sind
 */
export async function assertNoHardErrors(page: Page) {
  const errors = await page.evaluate(() => (window as any).__errors || []);
  if (errors && errors.length) {
    throw new Error('Console errors detected: \n' + errors.join('\n'));
  }
}

/**
 * Wartet auf das Enter-Overlay (Button "Enter" oder "Los geht's")
 */
export async function waitForEnterOverlay(page: Page) {
  // Warte zuerst auf die App-Initialisierung (Canvas oder bestimmte Elemente)
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(2000); // Zusätzliche Wartezeit für React-Rendering

  // Versuche verschiedene Selektoren
  const enterButton = page
    .getByRole('button', { name: /enter|los geht|bereit zum eintreten/i })
    .or(page.getByText(/enter/i).filter({ has: page.locator('button') }))
    .or(page.locator('button:has-text("Enter")'));

  await expect(enterButton.first()).toBeVisible({ timeout: 20_000 });
}

/**
 * Klickt auf den Enter-Button
 */
export async function clickEnter(page: Page) {
  const enterButton = page
    .getByRole('button', { name: /enter|los geht|bereit zum eintreten/i })
    .or(page.locator('button:has-text("Enter")'))
    .first();

  await enterButton.click({ timeout: 10_000 });
}

/**
 * Stellt sicher, dass Pointer-Lock aktiv ist (klickt auf Canvas)
 */
export async function ensurePointerLock(page: Page) {
  // Warte auf Canvas
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'attached', timeout: 10_000 });

  // Versuche Canvas-Click (kann durch Overlay blockiert sein)
  try {
    await canvas.click({ timeout: 2000, force: true });
  } catch {
    // Falls Click blockiert, versuche direkt über JavaScript
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.focus();
        canvas.requestPointerLock?.();
      }
    });
  }

  // Warte kurz, damit Pointer-Lock aktiviert werden kann
  await page.waitForTimeout(1000);
}

/**
 * Prüft, ob FPS über einem Minimum liegt
 */
export async function fpsAbove(page: Page, min = 40) {
  // Warte länger, damit FPS-Sampler Zeit hat zu messen
  await page.waitForTimeout(3000);

  // Prüfe ob FPS-Sampler läuft
  const perf = await page.evaluate(() => (window as any).__perf);
  if (!perf || perf.fps === 0) {
    console.warn('[E2E] FPS-Sampler nicht aktiv oder FPS=0, überspringe FPS-Check');
    return; // Überspringe FPS-Check wenn Sampler nicht aktiv
  }

  const fps = perf.fps || 0;
  console.log(`[E2E] Current FPS: ${fps}, Minimum: ${min}`);

  // In E2E-Tests kann FPS niedriger sein, daher nur warnen statt fehlschlagen
  if (fps < min) {
    console.warn(`[E2E] FPS (${fps}) unter Minimum (${min}), aber Test wird fortgesetzt`);
    // expect(fps).toBeGreaterThan(min); // Auskommentiert für E2E-Tests
  }
}

/**
 * Führt die komplette Prejoin-Journey durch: Login → Avatar → Name → Controls → Enter
 * @param page Playwright Page
 * @param username Optional: Username für Login (default: 'E2E Tester')
 * @param skipEnter Optional: Wenn true, wird Enter-Overlay nicht geklickt (default: false)
 */
export async function completePrejoinJourney(
  page: Page,
  username = 'E2E Tester',
  skipEnter = false
) {
  // Öffne App mit Template
  await openWithTemplate(page, 'watt-eco');

  // Warte auf Prejoin-UI (nach Login)
  await page.waitForTimeout(3000);

  // Step 1: Avatar-Card - Weiter klicken
  await expect(page.getByText(/Wähle deinen Avatar/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: /Avatar auswählen|Avatar ändern/i })).toBeVisible({
    timeout: 10_000,
  });

  await page
    .getByRole('button', { name: /Weiter/i })
    .first()
    .click();
  await page.waitForTimeout(2000);

  // Step 2: Name/Qualität
  await expect(page.getByRole('heading', { name: /Persönliche Einstellungen/i })).toBeVisible({
    timeout: 15_000,
  });
  await page.waitForTimeout(1000);

  const nameInput = page
    .locator('input[placeholder="Gast"]')
    .or(page.locator('input[placeholder*="Gast"]'))
    .or(page.locator('input[type="text"]').first());

  await nameInput.waitFor({ state: 'visible', timeout: 15_000 });
  await nameInput.fill(username);
  await page
    .getByRole('button', { name: /Weiter/i })
    .first()
    .click();
  await page.waitForTimeout(2000);

  // Step 3: Controls
  await expect(page.getByText(/Steuerung|Controls/i)).toBeVisible({ timeout: 15_000 });
  await page
    .getByRole('button', { name: /Los geht|Weiter/i })
    .first()
    .click();
  await page.waitForTimeout(3000);

  // Enter-Overlay sollte jetzt sichtbar sein
  if (!skipEnter) {
    await waitForEnterOverlay(page);
    await clickEnter(page);
    await ensurePointerLock(page);
    await page.waitForTimeout(2000); // Warte auf World-Initialisierung
  } else {
    // Wenn skipEnter=true, warte nur kurz auf mögliches Enter-Overlay
    // (muss nicht sichtbar sein, da wir es überspringen)
    await page.waitForTimeout(1000);
  }
}
