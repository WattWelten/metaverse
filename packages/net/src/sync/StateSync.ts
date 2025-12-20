interface UserState {
  userId: string;
  state: unknown;
  timestamp: Date;
}

export class StateSync {
  private states = new Map<string, UserState>();

  handleStateUpdate(userId: string, state: unknown): void {
    this.states.set(userId, {
      userId,
      state,
      timestamp: new Date(),
    });
  }

  getState(userId: string): unknown | undefined {
    return this.states.get(userId)?.state;
  }

  getAllStates(): Map<string, UserState> {
    return new Map(this.states);
  }

  clear(): void {
    this.states.clear();
  }
}



