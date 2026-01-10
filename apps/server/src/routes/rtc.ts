import express, { type Request, type Response, type Router } from 'express';
import { z } from 'zod';
import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

const TokenBody = z.object({
  roomId: z.string().min(1),
  userId: z.string().min(1),
  displayName: z.string().min(1),
  role: z.enum(['host', 'moderator', 'speaker', 'guest']).default('guest'),
});

export function createRTCRouter(): Router {
  const router = express.Router();

  router.post('/token', async (req: Request, res: Response): Promise<void> => {
    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      res.status(500).json({ error: 'LiveKit configuration missing' });
      return;
    }

    const parsed = TokenBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    const { roomId, userId, displayName, role } = parsed.data;

    try {
      const grant: {
        roomJoin: boolean;
        room: string;
        canPublish: boolean;
        canSubscribe: boolean;
        canPublishData: boolean;
      } = {
        roomJoin: true,
        room: roomId,
        canPublish: role !== 'guest',
        canSubscribe: true,
        canPublishData: true,
      };

      const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: userId,
        name: displayName,
        metadata: JSON.stringify({ role }),
        ttl: 60 * 60, // 1 hour
      });
      at.addGrant(grant);
      const token = await at.toJwt();

      res.json({ url: LIVEKIT_URL, token, role });
    } catch (error) {
      console.error('Failed to generate LiveKit token:', error);
      res.status(500).json({ error: 'Failed to generate token' });
    }
  });

  return router;
}
