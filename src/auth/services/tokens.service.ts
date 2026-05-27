import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access_token', jti: crypto.randomUUID() },
      { expiresIn: '15m' },
    );
    await this.revokeUserTokens(userId);
    const refreshToken = this.generateRefreshToken();
    const hashedRefreshToken = this.hashToken(refreshToken);

    await this.prismaService.refreshToken.create({
      data: {
        userId,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + SEVEN_DAYS_IN_MS),
      },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshTokens(token: string) {
    const hashedToken = this.hashToken(token);
    const refreshToken = await this.prismaService.refreshToken.findFirst({
      where: { token: hashedToken },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }

    if (refreshToken.revoked || refreshToken.expiresAt < new Date()) {
      await this.revokeUserTokens(refreshToken.userId);
      throw new UnauthorizedException('Invalid token');
    }

    return this.generateTokens(refreshToken.userId);
  }

  async revokeUserTokens(userId: string) {
    await this.prismaService.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  private generateRefreshToken() {
    return randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
