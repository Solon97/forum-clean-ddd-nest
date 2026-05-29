import { RefreshToken } from '@/domain/forum/entities/refresh-token';
import { RefreshTokenRepository } from '@/domain/forum/repositories/refresh-token-repository';

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  public items: RefreshToken[] = [];

  create(refreshToken: RefreshToken): Promise<void> {
    this.items.push(refreshToken);
    return Promise.resolve();
  }

  findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = this.items.find((item) => item.token === token);
    return Promise.resolve(refreshToken ?? null);
  }

  revokeManyByUserId(userId: string): Promise<void> {
    for (const refreshToken of this.items) {
      if (refreshToken.userId.toString() === userId) {
        refreshToken.revoke();
      }
    }

    return Promise.resolve();
  }
}
