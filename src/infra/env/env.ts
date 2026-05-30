import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().optional().default(3000),
  DATABASE_URL: z.url(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().default('forum-attachments'),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().default('test'),
  S3_SECRET_KEY: z.string().default('test'),
});

export type Env = z.infer<typeof envSchema>;
