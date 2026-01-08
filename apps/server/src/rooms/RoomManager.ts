interface RoomUser {
  socketId: string;
  userId: string;
  avatar?: unknown;
  joinedAt: Date;
}

interface Room {
  id: string;
  users: Map<string, RoomUser>;
  createdAt: Date;
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  async joinRoom(
    socketId: string,
    roomId: string,
    userId: string,
    avatar?: unknown
  ): Promise<void> {
    let room = this.rooms.get(roomId);

    if (!room) {
      room = {
        id: roomId,
        users: new Map(),
        createdAt: new Date(),
      };
      this.rooms.set(roomId, room);
    }

    room.users.set(socketId, {
      socketId,
      userId,
      avatar,
      joinedAt: new Date(),
    });
  }

  async leaveRoom(socketId: string, roomId: string, _userId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.users.delete(socketId);

    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  getRoomState(roomId: string): {
    roomId: string;
    users: Array<{ userId: string; socketId: string; avatar?: unknown }>;
  } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { roomId, users: [] };
    }

    return {
      roomId,
      users: Array.from(room.users.values()).map((user) => ({
        userId: user.userId,
        socketId: user.socketId,
        avatar: user.avatar,
      })),
    };
  }

  getRoomCount(roomId: string): number {
    const room = this.rooms.get(roomId);
    return room ? room.users.size : 0;
  }

  getAllRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}
