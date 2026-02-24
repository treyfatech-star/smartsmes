import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'super-secret-change-me',
  databaseUrl: process.env.DATABASE_URL ?? '',
  appUrl: process.env.APP_URL ?? 'http://localhost:3000'
};
