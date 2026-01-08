import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';

import { S3Storage } from '../storage/S3Storage.js';

// Extend Express Request to include multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router: Router = Router();
const s3Storage = new S3Storage();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || '10485760', 10), // 10MB default
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = (
      process.env.FILE_UPLOAD_ALLOWED_TYPES || 'image/*,video/*,application/pdf'
    ).split(',');
    const mimeType = file.mimetype;

    // Check if file type is allowed
    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return mimeType.startsWith(`${baseType}/`);
      }
      return mimeType === type;
    });

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${mimeType} is not allowed`));
    }
  },
});

/**
 * POST /api/upload
 * Upload a file to S3
 */
router.post(
  '/',
  upload.single('file'),
  async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { buffer, originalname, mimetype } = req.file;
      const folder = (req.body.folder as string) || 'uploads';

      const result = await s3Storage.uploadFile(buffer, originalname, mimetype, folder);

      res.json({
        success: true,
        file: {
          id: result.fileId,
          url: result.url,
          key: result.key,
          size: result.size,
          mimeType: result.mimeType,
          originalName: originalname,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/files/:id
 * Get file information (for MVP, we'll return the URL directly)
 * In production, this could check permissions, generate signed URLs, etc.
 */
router.get('/:id', async (_req: Request, res: Response) => {
  // For MVP, we'll store file metadata in memory or a simple DB
  // This is a placeholder - in production, you'd query a database
  res.status(404).json({ error: 'File metadata not found' });
});

/**
 * DELETE /api/files/:id
 * Delete a file from S3
 */
router.delete('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'File key is required' });
    }

    await s3Storage.deleteFile(key);

    return res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      error: 'Failed to delete file',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
