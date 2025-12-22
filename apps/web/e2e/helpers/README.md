# E2E Test Helpers

## Heartbeat Utility

Das `heartbeat.ts` Modul bietet regelmäßige Status-Updates für lange laufende Tests.

### Verwendung

```typescript
import { createHeartbeat } from './helpers/heartbeat.js';

test('langer Test', async ({ page }) => {
  // Heartbeat starten (Update alle 5 Minuten)
  const heartbeat = createHeartbeat('langer Test', 5);
  heartbeat.start();

  try {
    // Test-Logik hier...
    await page.goto('/');
    // ... weitere Aktionen
  } finally {
    // Heartbeat stoppen
    heartbeat.stop();
  }
});
```

### Optionen

- `testName`: Name des Tests (für bessere Logs)
- `intervalMinutes`: Update-Intervall in Minuten (Standard: 5)

### Output

```
[HEARTBEAT] langer Test läuft noch... (0m 0s)
[HEARTBEAT] langer Test läuft noch... (5m 0s)
[HEARTBEAT] langer Test läuft noch... (10m 0s)
[HEARTBEAT] langer Test beendet nach 12m 34s
```

### Für sehr lange Tests

Für Tests, die länger als 10 Minuten dauern, kann das Intervall angepasst werden:

```typescript
const heartbeat = createHeartbeat('sehr langer Test', 10); // Alle 10 Minuten
```
