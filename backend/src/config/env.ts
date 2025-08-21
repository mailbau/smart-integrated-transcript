import 'dotenv/config';

export const env = {
  port: process.env.PORT || '8080',
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',

};
