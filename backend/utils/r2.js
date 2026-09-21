import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const R2 = {
  get isConfigured() {
    return !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);
  },

  getClient() {
    return new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  },

  getPublicUrl(key) {
    const base = process.env.R2_PUBLIC_URL || `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`;
    return `${base}/${key}`;
  },

  async uploadFile(localPath, key) {
    if (!this.isConfigured) return null;
    try {
      const client = this.getClient();
      const contentType = getContentType(localPath);
      const body = fs.readFileSync(localPath);
      await client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      }));
      return this.getPublicUrl(key);
    } catch (err) {
      console.error('R2 upload failed:', err.message);
      return null;
    }
  },

  async fileExists(key) {
    if (!this.isConfigured) return false;
    try {
      const client = this.getClient();
      await client.send(new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      }));
      return true;
    } catch {
      return false;
    }
  },

  async downloadFile(key, localPath) {
    if (!this.isConfigured) return false;
    try {
      const client = this.getClient();
      const res = await client.send(new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      }));
      const dir = path.dirname(localPath);
      fs.mkdirSync(dir, { recursive: true });
      const body = await res.Body.transformToByteArray();
      fs.writeFileSync(localPath, Buffer.from(body));
      return true;
    } catch {
      return false;
    }
  },
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
    '.ogg': 'video/ogg',
  };
  return types[ext] || 'application/octet-stream';
}

export default R2;
