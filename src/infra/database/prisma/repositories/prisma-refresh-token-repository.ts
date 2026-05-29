import { RefreshToken } from '@/domain/forum/entities/refresh-token';
import { RefreshTokenRepository } from '@/domain/forum/repositories/refresh-token-repository';
import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { isLeft } from 'fp-ts/lib/Either';
import { PrismaRefreshTokenMapper } from '../mappers/prisma-refresh-token-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(refreshToken: RefreshToken): Promise<void> {
    const data = PrismaRefreshTokenMapper.toPrisma(refreshToken);
    await this.prismaService.refreshToken.create({
      data: {
        ...data,
        token: this.hashToken(data.token),
      },
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prismaService.refreshToken.findFirst({
      where: { token: this.hashToken(token) },
    });
    if (!refreshToken) return null;

    const mappedRefreshToken = PrismaRefreshTokenMapper.toDomain(refreshToken);
    if (isLeft(mappedRefreshToken)) return null;

    return mappedRefreshToken.right;
  }

  async revokeManyByUserId(userId: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
