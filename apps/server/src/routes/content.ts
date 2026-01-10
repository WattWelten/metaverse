import express, { type Request, type Response, type Router } from 'express';
import { z } from 'zod';

// Simple in-memory cache invalidation
// In production, this could trigger a cache refresh or notify connected clients
const contentCache = new Map<string, { timestamp: number }>();

const WebhookBody = z.object({
  event: z.enum([
    'entry.create',
    'entry.update',
    'entry.delete',
    'entry.publish',
    'entry.unpublish',
  ]),
  model: z.string(),
  entry: z.any().optional(),
});

export function createContentRouter(): Router {
  const router = express.Router();

  // Webhook endpoint for Strapi content updates
  router.post('/refresh', express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = WebhookBody.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }

      const { event, model, entry } = parsed.data;

      // Invalidate cache for the model
      contentCache.delete(model);
      if (entry?.id) {
        contentCache.delete(`${model}:${entry.id}`);
      }

      console.log(`[Content] Cache invalidated for ${model} (event: ${event})`);

      // In production, you could:
      // - Broadcast to connected clients via Socket.io
      // - Trigger a full cache refresh
      // - Update a CDN cache

      res.json({ success: true, model, event });
    } catch (error) {
      console.error('[Content] Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get cache status (for debugging)
  router.get('/cache/status', (_req: Request, res: Response): void => {
    res.json({
      cacheSize: contentCache.size,
      entries: Array.from(contentCache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
      })),
    });
  });

  return router;
}
