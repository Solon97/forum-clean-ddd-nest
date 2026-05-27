import z from 'zod';

export const tokenSchema = z.object({
  sub: z.string(),
  type: z.enum(['access_token', 'refresh_token']),
  jti: z.string().optional(),
});

export type TokenPayload = z.infer<typeof tokenSchema>;
