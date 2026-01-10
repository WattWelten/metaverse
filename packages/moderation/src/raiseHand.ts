/**
 * Raise-Hand Queue Management
 * Handles the queue of users who have raised their hand
 */

export interface RaiseHandEntry {
  userId: string;
  displayName: string;
  timestamp: number;
}

export class RaiseHandQueue {
  private queue: RaiseHandEntry[] = [];

  /**
   * Add a user to the raise-hand queue
   */
  add(userId: string, displayName: string): void {
    // Remove if already in queue
    this.remove(userId);

    this.queue.push({
      userId,
      displayName,
      timestamp: Date.now(),
    });
  }

  /**
   * Remove a user from the queue
   */
  remove(userId: string): boolean {
    const index = this.queue.findIndex((entry) => entry.userId === userId);
    if (index >= 0) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get the current queue (ordered by timestamp)
   */
  getQueue(): readonly RaiseHandEntry[] {
    return [...this.queue];
  }

  /**
   * Get the next user in queue (FIFO)
   */
  getNext(): RaiseHandEntry | null {
    if (this.queue.length === 0) {
      return null;
    }
    const entry = this.queue[0];
    return entry ?? null;
  }

  /**
   * Clear the entire queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Check if a user is in the queue
   */
  has(userId: string): boolean {
    return this.queue.some((entry) => entry.userId === userId);
  }
}
