import { randomUUID } from 'crypto';

export interface UserSession {
  userId: string;
  username: string;
  role: 'host' | 'moderator' | 'speaker' | 'guest';
  email?: string;
  socketId?: string;
  createdAt: Date;
  lastSeen: Date;
}

export class AuthService {
  private sessions: Map<string, UserSession> = new Map();

  constructor() {
    // Session secret is stored in environment variable
    // For future use: process.env.SESSION_SECRET || randomUUID();
  }

  /**
   * Create a new session for a user
   */
  createSession(
    username: string,
    role: 'host' | 'moderator' | 'speaker' | 'guest' = 'guest'
  ): { sessionId: string; user: UserSession } {
    const userId = randomUUID();
    const sessionId = randomUUID();

    const user: UserSession = {
      userId,
      username: username.trim(),
      role,
      createdAt: new Date(),
      lastSeen: new Date(),
    };

    this.sessions.set(sessionId, user);

    return { sessionId, user };
  }

  /**
   * Get session by session ID
   */
  getSession(sessionId: string): UserSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Check if session has expired
    const maxAge = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10); // 24h default
    const age = Date.now() - session.createdAt.getTime();
    if (age > maxAge) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last seen
    session.lastSeen = new Date();
    return session;
  }

  /**
   * Update socket ID for a session
   */
  updateSocketId(sessionId: string, socketId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.socketId = socketId;
    session.lastSeen = new Date();
    return true;
  }

  /**
   * Remove socket ID from session
   */
  removeSocketId(socketId: string): void {
    for (const [_sessionId, session] of this.sessions.entries()) {
      if (session.socketId === socketId) {
        session.socketId = undefined;
        break;
      }
    }
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get session by socket ID
   */
  getSessionBySocketId(socketId: string): UserSession | null {
    for (const session of this.sessions.values()) {
      if (session.socketId === socketId) {
        return session;
      }
    }
    return null;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const maxAge = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10);
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now - session.createdAt.getTime();
      if (age > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get all active sessions (for debugging)
   */
  getAllSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }
}
