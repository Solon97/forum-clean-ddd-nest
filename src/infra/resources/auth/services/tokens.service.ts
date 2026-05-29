import { RefreshToken } from '@/domain/forum/entities/refresh-token';
import { TokenGenerator } from '@/domain/forum/gateways/token-generator';
import { PrismaRefreshTokenRepository } from '@/infra/database/prisma/repositories/prisma-refresh-token-repository';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { isLeft } from 'fp-ts/lib/Either';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class TokenService implements TokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: PrismaRefreshTokenRepository,
  ) {}

  async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access_token', jti: crypto.randomUUID() },
      { expiresIn: '15m' },
    );

    const userIdOrError = UniqueEntityId.createFromExistingId(userId);
    if (isLeft(userIdOrError)) {
      throw new InvalidUniqueEntityIdError('User');
    }

    await this.refreshTokenRepository.revokeManyByUserId(userId);

    const refreshToken = this.generateRefreshToken();

    await this.refreshTokenRepository.create(
      new RefreshToken({
        token: refreshToken,
        userId: userIdOrError.right,
        expiresAt: new Date(Date.now() + SEVEN_DAYS_IN_MS),
        revoked: false,
      }),
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private generateRefreshToken() {
    return randomBytes(64).toString('hex');
  }
}
