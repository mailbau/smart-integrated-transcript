import 'dotenv/config';

export const env = {
  port: process.env.PORT || '8080',
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
  r2: {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL!,
  },
};
