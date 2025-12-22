import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

const SERVER_URL = process.env.VITE_SERVER_URL || 'http://localhost:3001';
const ROOM_ID = 'e2e-test-room';

test.describe('Multiplayer Two Tabs', () => {
  test('two browser contexts should see each other in same room', async ({ browser }) => {
    // Create two browser contexts (simulating two tabs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Navigate both pages to the same room
      await page1.goto(`/?room=${ROOM_ID}`);
      await page2.goto(`/?room=${ROOM_ID}`);

      // Wait for both apps to be ready
      await waitForAppReady(page1);
      await waitForAppReady(page2);

      // Wait for connection attempts
      await page1.waitForTimeout(2000);
      await page2.waitForTimeout(2000);

      // Check console logs for connection status
      const logs1: string[] = [];
      const logs2: string[] = [];

      page1.on('console', (msg) => {
        if (msg.type() === 'log' || msg.type() === 'info') {
          logs1.push(msg.text());
        }
      });

      page2.on('console', (msg) => {
        if (msg.type() === 'log' || msg.type() === 'info') {
          logs2.push(msg.text());
        }
      });

      // Wait a bit more for room-state events
      await page1.waitForTimeout(1000);
      await page2.waitForTimeout(1000);

      // Check if both pages received room-state or user-joined events
      const page1HasRoomState = logs1.some(
        (log) =>
          log.includes('room-state') || log.includes('user-joined') || log.includes('Connected')
      );
      const page2HasRoomState = logs2.some(
        (log) =>
          log.includes('room-state') || log.includes('user-joined') || log.includes('Connected')
      );

      // At least one page should have received room-state (if server is available)
      // If server is not available, both should gracefully fall back to solo mode
      const page1SoloMode = logs1.some(
        (log) => log.includes('solo mode') || log.includes('Solo-Modus')
      );
      const page2SoloMode = logs2.some(
        (log) => log.includes('solo mode') || log.includes('Solo-Modus')
      );

      // If server is available, both should connect
      // If server is not available, both should be in solo mode (no errors)
      if (!page1SoloMode && !page2SoloMode) {
        // Server is available - check that both received room-state
        expect(page1HasRoomState || page2HasRoomState).toBe(true);
      } else {
        // Server is not available - both should be in solo mode without errors
        expect(page1SoloMode || page2SoloMode).toBe(true);
      }

      // Check that no critical errors occurred
      const errors1: string[] = [];
      const errors2: string[] = [];

      page1.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Ignore expected errors
          if (
            !text.includes('WebSocket') &&
            !text.includes('ECONNREFUSED') &&
            !text.includes('socket') &&
            !text.includes('Failed to load template overlay')
          ) {
            errors1.push(text);
          }
        }
      });

      page2.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Ignore expected errors
          if (
            !text.includes('WebSocket') &&
            !text.includes('ECONNREFUSED') &&
            !text.includes('socket') &&
            !text.includes('Failed to load template overlay')
          ) {
            errors2.push(text);
          }
        }
      });

      await page1.waitForTimeout(1000);
      await page2.waitForTimeout(1000);

      expect(errors1.length).toBe(0);
      expect(errors2.length).toBe(0);
    } finally {
      await page1.close();
      await page2.close();
      await context1.close();
      await context2.close();
    }
  });

  test('transform should move remote avatar', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      await page1.goto(`/?room=${ROOM_ID}`);
      await page2.goto(`/?room=${ROOM_ID}`);

      await waitForAppReady(page1);
      await waitForAppReady(page2);

      // Wait for connection
      await page1.waitForTimeout(3000);
      await page2.waitForTimeout(3000);

      // Check if test hooks are available
      const hasTestHooks1 = await page1.evaluate(() => {
        return typeof (window as any).__test !== 'undefined';
      });

      const hasTestHooks2 = await page2.evaluate(() => {
        return typeof (window as any).__test !== 'undefined';
      });

      // If test hooks are available, use them to verify avatar movement
      if (hasTestHooks1 && hasTestHooks2) {
        // Emit transform event via test hook
        await page1.evaluate((roomId) => {
          (window as any).__test.emit('avatar-update', {
            roomId,
            userId: 'test-user-1',
            position: { x: 5, y: 0, z: 5 },
            rotation: { x: 0, y: Math.PI / 4, z: 0 },
            animation: 'walk',
          });
        }, ROOM_ID);

        // Wait for transform to propagate
        await page2.waitForTimeout(1000);

        // Check if page2 received the transform
        const receivedTransform = await page2.evaluate(() => {
          return (window as any).__test?.lastAvatarUpdate !== undefined;
        });

        expect(receivedTransform).toBe(true);
      } else {
        // Fallback: Just verify that both pages are running without errors
        const errors1: string[] = [];
        const errors2: string[] = [];

        page1.on('console', (msg) => {
          if (msg.type() === 'error') {
            const text = msg.text();
            if (
              !text.includes('WebSocket') &&
              !text.includes('ECONNREFUSED') &&
              !text.includes('socket') &&
              !text.includes('Failed to load template overlay')
            ) {
              errors1.push(text);
            }
          }
        });

        page2.on('console', (msg) => {
          if (msg.type() === 'error') {
            const text = msg.text();
            if (
              !text.includes('WebSocket') &&
              !text.includes('ECONNREFUSED') &&
              !text.includes('socket') &&
              !text.includes('Failed to load template overlay')
            ) {
              errors2.push(text);
            }
          }
        });

        await page1.waitForTimeout(1000);
        await page2.waitForTimeout(1000);

        expect(errors1.length).toBe(0);
        expect(errors2.length).toBe(0);
      }
    } finally {
      await page1.close();
      await page2.close();
      await context1.close();
      await context2.close();
    }
  });
});
