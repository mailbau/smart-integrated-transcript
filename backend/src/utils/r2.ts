import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: env.r2.accessKeyId,
        secretAccessKey: env.r2.secretAccessKey,
    },
});

export async function uploadToR2(
    key: string,
    file: Buffer,
    contentType: string
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: env.r2.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
    });

    await r2Client.send(command);
    return `${env.r2.publicBaseUrl}/${key}`;
}

export async function publicUrlForKey(key: string): Promise<string> {
    return `${env.r2.publicBaseUrl}/${key}`;
}

export async function getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: env.r2.bucketName,
        Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour
}
