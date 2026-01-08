import { randomUUID } from 'crypto';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadResult {
  fileId: string;
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export class S3Storage {
  private client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'eu-central-1';
    this.bucketName = process.env.S3_BUCKET_NAME || 'wattwelten-metaverse-files';

    const config: {
      region: string;
      credentials?: { accessKeyId: string; secretAccessKey: string };
      endpoint?: string;
      forcePathStyle?: boolean;
    } = {
      region: this.region,
    };

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    // Support for S3-compatible services (e.g., DigitalOcean Spaces)
    if (process.env.S3_ENDPOINT) {
      config.endpoint = process.env.S3_ENDPOINT;
      config.forcePathStyle = true;
    }

    this.client = new S3Client(config);
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    folder?: string
  ): Promise<UploadResult> {
    const fileId = randomUUID();
    const extension = originalName.split('.').pop() || '';
    const key = folder ? `${folder}/${fileId}.${extension}` : `${fileId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
      ACL: 'public-read', // For MVP, make files publicly readable
    });

    await this.client.send(command);

    // Generate public URL
    const url = this.getPublicUrl(key);

    return {
      fileId,
      url,
      key,
      size: file.length,
      mimeType,
    };
  }

  /**
   * Get a signed URL for file access (if using private files)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  /**
   * Generate public URL for a file
   */
  private getPublicUrl(key: string): string {
    if (process.env.S3_ENDPOINT) {
      // S3-compatible service (e.g., DigitalOcean Spaces)
      const endpoint = process.env.S3_ENDPOINT.replace(/^https?:\/\//, '');
      return `https://${endpoint}/${this.bucketName}/${key}`;
    }

    // Standard AWS S3 URL
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
