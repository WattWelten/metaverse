interface UserState {
  userId: string;
  state: unknown;
  timestamp: Date;
}

interface RoomState {
  roomId: string;
  users: Map<string, UserState>;
}

export class StateSyncService {
  private roomStates = new Map<string, RoomState>();

  updateState(roomId: string, userId: string, state: unknown): void {
    let roomState = this.roomStates.get(roomId);
    
    if (!roomState) {
      roomState = {
        roomId,
        users: new Map(),
      };
      this.roomStates.set(roomId, roomState);
    }

    roomState.users.set(userId, {
      userId,
      state,
      timestamp: new Date(),
    });
  }

  getState(roomId: string, userId: string): unknown | undefined {
    const roomState = this.roomStates.get(roomId);
    return roomState?.users.get(userId)?.state;
  }

  getAllStates(roomId: string): Map<string, UserState> {
    const roomState = this.roomStates.get(roomId);
    return roomState?.users || new Map();
  }

  clearRoom(roomId: string): void {
    this.roomStates.delete(roomId);
  }
}

