export class Reconnector {
  private connectFn: () => Promise<void>;
  private reconnectAttempts = 0;
  private maxAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: number | null = null;
  private isStopped = false;

  constructor(connectFn: () => Promise<void>) {
    this.connectFn = connectFn;
  }

  onConnect(): void {
    this.reconnectAttempts = 0;
    this.clearTimer();
  }

  onDisconnect(): void {
    if (this.isStopped) return;

    if (this.reconnectAttempts < this.maxAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      this.reconnectTimer = window.setTimeout(() => {
        if (!this.isStopped) {
          this.connectFn().catch((error) => {
            console.error('Reconnection failed:', error);
          });
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  stop(): void {
    this.isStopped = true;
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
