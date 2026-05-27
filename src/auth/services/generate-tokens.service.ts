import { PrismaService } from '@/prisma/prisma.service';
import { hashValue } from '@/shared/hash';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GenerateTokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access_token', jti: crypto.randomUUID() },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh_token', jti: crypto.randomUUID() },
      { expiresIn: '7d' },
    );

    const hashedRefreshToken = await hashValue(refreshToken);

    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
