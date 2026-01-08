import { Request, Response, NextFunction } from 'express';

import { AuthService } from '../auth/AuthService.js';

// Extend Express Request to include user session

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: {
        sessionId: string;
        user: {
          userId: string;
          username: string;
        };
      };
    }
  }
}

export function createAuthMiddleware(authService: AuthService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Get session ID from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const sessionId = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.sessionId;

    if (!sessionId) {
      res.status(401).json({ error: 'No session found' });
      return;
    }

    const session = authService.getSession(sessionId);
    if (!session) {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }

    // Attach session to request
    req.session = {
      sessionId,
      user: {
        userId: session.userId,
        username: session.username,
      },
    };

    next();
  };
}

/**
 * Optional auth middleware - doesn't fail if no session
 */
export function createOptionalAuthMiddleware(authService: AuthService) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const sessionId = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.sessionId;

    if (sessionId) {
      const session = authService.getSession(sessionId);
      if (session) {
        req.session = {
          sessionId,
          user: {
            userId: session.userId,
            username: session.username,
          },
        };
      }
    }

    next();
  };
}
