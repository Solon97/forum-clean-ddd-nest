import { RefreshToken } from '../entities/refresh-token';

export interface RefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<void>;
  findByToken(token: string): Promise<RefreshToken | null>;
  revokeManyByUserId(userId: string): Promise<void>;
}
