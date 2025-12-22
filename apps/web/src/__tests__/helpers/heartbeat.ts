/**
 * Heartbeat-Utility für lange Unit-Tests
 * Gibt regelmäßig Status-Updates aus, um zu zeigen, dass der Test noch läuft
 */

export interface HeartbeatOptions {
  intervalMs?: number; // Standard: 5 Minuten (300000ms)
  testName?: string;
  onUpdate?: (elapsed: number, message: string) => void;
}

export class TestHeartbeat {
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: number;
  private testName: string;
  private intervalMs: number;
  private onUpdate?: (elapsed: number, message: string) => void;

  constructor(options: HeartbeatOptions = {}) {
    this.startTime = Date.now();
    this.testName = options.testName || 'Test';
    this.intervalMs = options.intervalMs || 5 * 60 * 1000; // 5 Minuten Standard
    this.onUpdate = options.onUpdate;
  }

  start(): void {
    if (this.intervalId) {
      this.stop();
    }

    // Sofortiges erstes Update
    this.update();

    // Regelmäßige Updates
    this.intervalId = setInterval(() => {
      this.update();
    }, this.intervalMs);
  }

  private update(): void {
    const elapsed = Date.now() - this.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    const message = `[HEARTBEAT] ${this.testName} läuft noch... (${minutes}m ${seconds}s)`;

    // Console-Output für Vitest
    console.log(message);

    // Optional: Custom Callback
    if (this.onUpdate) {
      this.onUpdate(elapsed, message);
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const elapsed = Date.now() - this.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    console.log(`[HEARTBEAT] ${this.testName} beendet nach ${minutes}m ${seconds}s`);
  }

  getElapsed(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Helper-Funktion für einfache Verwendung in Tests
 */
export function createHeartbeat(testName: string, intervalMinutes: number = 5): TestHeartbeat {
  return new TestHeartbeat({
    testName,
    intervalMs: intervalMinutes * 60 * 1000,
  });
}
