interface RoomUser {
  userId: string;
  socketId: string;
  avatar?: unknown;
}

interface RoomState {
  roomId: string;
  users: RoomUser[];
}

export class RoomManager {
  private currentRoom: string | null = null;
  private roomState: RoomState | null = null;

  handleRoomState(data: { roomId: string; users: RoomUser[] }): void {
    this.currentRoom = data.roomId;
    this.roomState = {
      roomId: data.roomId,
      users: data.users,
    };
  }

  handleUserJoined(data: { userId: string; socketId: string; avatar?: unknown }): void {
    if (!this.roomState) return;

    const existingUser = this.roomState.users.find((u) => u.userId === data.userId);
    if (!existingUser) {
      this.roomState.users.push({
        userId: data.userId,
        socketId: data.socketId,
        avatar: data.avatar,
      });
    }
  }

  handleUserLeft(data: { userId: string; socketId: string }): void {
    if (!this.roomState) return;

    this.roomState.users = this.roomState.users.filter((u) => u.userId !== data.userId);
  }

  getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  getRoomState(): RoomState | null {
    return this.roomState;
  }

  getUserCount(): number {
    return this.roomState?.users.length || 0;
  }
}

