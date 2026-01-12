import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { AccessToken } from 'livekit-server-sdk';

const app = express();

// CORS Configuration - Restrict to allowed origins
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'https://metaverse.wattwelten.de'];

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per IP

const rateLimitMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  record.count++;
  next();
};

app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(rateLimitMiddleware);

const LIVEKIT_URL = process.env.LIVEKIT_URL;
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
  console.warn(
    '[rtc-api] WARNING: LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET not set. Token generation will fail.'
  );
}

// Input sanitization helper
function sanitizeString(input: string, maxLength = 100): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, ''); // Remove potential XSS characters
}

const Body = z.object({
  roomId: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Room ID must contain only alphanumeric characters, hyphens, and underscores'
    ),
  userId: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'User ID must contain only alphanumeric characters, hyphens, and underscores'
    ),
  displayName: z.string().min(1).max(50).transform(sanitizeString),
  role: z.enum(['host', 'moderator', 'speaker', 'guest']).default('guest'),
});

app.post('/token', async (req, res) => {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { roomId, userId, displayName, role } = parsed.data;

  if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'LiveKit configuration missing' });
  }

  try {
    const grant: {
      roomJoin: boolean;
      room: string;
      canSubscribe: boolean;
      canPublishData: boolean;
      canPublish: boolean;
      canPublishSources: string[];
    } = {
      roomJoin: true,
      room: roomId,
      canSubscribe: true,
      canPublishData: true,
      canPublish: role !== 'guest',
      canPublishSources: ['microphone', 'screen_share', 'screen_share_audio'],
    };

    const at = new AccessToken(API_KEY, API_SECRET, {
      identity: userId,
      name: displayName,
      metadata: JSON.stringify({ role }),
      ttl: 3600, // 1 hour
    });
    at.addGrant(grant);

    const token = await at.toJwt();

    res.json({ url: LIVEKIT_URL, token, role });
  } catch (error) {
    console.error('[rtc-api] Failed to generate token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`[rtc-api] Server running on port ${PORT}`);
});
