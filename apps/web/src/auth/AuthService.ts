const SESSION_STORAGE_KEY = 'metaverse_session';

export interface User {
  userId: string;
  username: string;
}

export interface AuthSession {
  sessionId: string;
  user: User;
}

export class AuthService {
  private serverUrl: string;
  private session: AuthSession | null = null;

  constructor(serverUrl: string = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
    this.loadSession();
  }

  /**
   * Load session from localStorage
   */
  private loadSession(): void {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        this.session = JSON.parse(stored) as AuthSession;
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      this.session = null;
    }
  }

  /**
   * Save session to localStorage
   */
  private saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      this.session = session;
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Clear session from localStorage
   */
  private clearSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      this.session = null;
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Login with username
   */
  async login(username: string): Promise<AuthSession> {
    const response = await fetch(`${this.serverUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || `Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success && data.sessionId && data.user) {
      const session: AuthSession = {
        sessionId: data.sessionId,
        user: data.user,
      };
      this.saveSession(session);
      return session;
    }

    throw new Error('Invalid response from server');
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (!this.session) {
      return;
    }

    try {
      await fetch(`${this.serverUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.session.sessionId}`,
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get current session
   */
  getSession(): AuthSession | null {
    return this.session;
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.session?.user || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.session !== null;
  }

  /**
   * Get session ID for API calls
   */
  getSessionId(): string | null {
    return this.session?.sessionId || null;
  }

  /**
   * Validate session with server
   */
  async validateSession(): Promise<boolean> {
    if (!this.session) {
      return false;
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.session.sessionId}`,
        },
      });

      if (!response.ok) {
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      this.clearSession();
      return false;
    }
  }
}
