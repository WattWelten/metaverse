/**
 * OAuth Provider - Handles OAuth token validation for Google and GitHub
 */

export type OAuthProvider = 'google' | 'github';

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export class OAuthService {
  /**
   * Validate OAuth token and return user info
   */
  async validateToken(provider: OAuthProvider, token: string): Promise<OAuthUserInfo | null> {
    try {
      if (provider === 'google') {
        return await this.validateGoogleToken(token);
      } else if (provider === 'github') {
        return await this.validateGitHubToken(token);
      }
      return null;
    } catch (error) {
      console.error(`[OAuth] Failed to validate ${provider} token:`, error);
      return null;
    }
  }

  /**
   * Validate Google OAuth token
   */
  private async validateGoogleToken(token: string): Promise<OAuthUserInfo | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    } catch (error) {
      console.error('[OAuth] Google token validation error:', error);
      return null;
    }
  }

  /**
   * Validate GitHub OAuth token
   */
  private async validateGitHubToken(token: string): Promise<OAuthUserInfo | null> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        id: number;
        email?: string;
        login: string;
        name?: string;
        avatar_url?: string;
      };

      // GitHub may not return email in public profile
      // In production, request 'user:email' scope
      const email = data.email || `${data.login}@users.noreply.github.com`;

      return {
        id: data.id.toString(),
        email,
        name: data.name || data.login,
        picture: data.avatar_url,
      };
    } catch (error) {
      console.error('[OAuth] GitHub token validation error:', error);
      return null;
    }
  }

  /**
   * Determine user role from email domain or OAuth provider
   */
  determineRole(
    email: string,
    provider: OAuthProvider
  ): 'host' | 'moderator' | 'speaker' | 'guest' {
    // WattWelten employees get host role
    if (email.endsWith('@wattwelten.de')) {
      return 'host';
    }

    // GitHub users with specific orgs can be moderators
    if (provider === 'github' && email.includes('@github.com')) {
      // In production, check GitHub org membership
      return 'guest';
    }

    // Default role
    return 'guest';
  }
}
