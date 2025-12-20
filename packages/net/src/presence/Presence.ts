interface User {
  userId: string;
  socketId: string;
  avatar?: unknown;
  lastSeen: Date;
}

export class Presence {
  private users = new Map<string, User>();

  addUser(userId: string, socketId: string, avatar?: unknown): void {
    this.users.set(userId, {
      userId,
      socketId,
      avatar,
      lastSeen: new Date(),
    });
  }

  removeUser(userId: string): void {
    this.users.delete(userId);
  }

  updateLastSeen(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.lastSeen = new Date();
    }
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserCount(): number {
    return this.users.size;
  }

  clear(): void {
    this.users.clear();
  }
}



