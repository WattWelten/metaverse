interface UserInfo {
  socketId: string;
  userId: string;
  roomId: string;
  lastSeen: Date;
}

export class PresenceService {
  private users = new Map<string, UserInfo>();

  addUser(socketId: string, userId: string, roomId: string): void {
    this.users.set(socketId, {
      socketId,
      userId,
      roomId,
      lastSeen: new Date(),
    });
  }

  removeUser(socketId: string): void {
    this.users.delete(socketId);
  }

  updateLastSeen(socketId: string): void {
    const user = this.users.get(socketId);
    if (user) {
      user.lastSeen = new Date();
    }
  }

  getUserInfo(socketId: string): UserInfo | undefined {
    return this.users.get(socketId);
  }

  getUsersInRoom(roomId: string): UserInfo[] {
    return Array.from(this.users.values()).filter((user) => user.roomId === roomId);
  }

  getAllUsers(): UserInfo[] {
    return Array.from(this.users.values());
  }

  getSocketIdByUserId(userId: string): string | undefined {
    for (const user of this.users.values()) {
      if (user.userId === userId) {
        return user.socketId;
      }
    }
    return undefined;
  }
}
