import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2.accessKeyId,
    secretAccessKey: env.r2.secretAccessKey
  }
});

export async function uploadToR2(key: string, body: Buffer, mime: string) {
  const cmd = new PutObjectCommand({
    Bucket: env.r2.bucket,
    Key: key,
    Body: body,
    ContentType: mime
  });
  await r2.send(cmd);
  return key;
}

export function publicUrlForKey(key: string) {
  if (!env.r2.publicBaseUrl) return null;
  const base = env.r2.publicBaseUrl.endsWith('/') ? env.r2.publicBaseUrl : env.r2.publicBaseUrl + '/';
  return base + key;
}
