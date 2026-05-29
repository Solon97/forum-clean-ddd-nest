import { RefreshUserTokenUseCase } from '@/domain/forum/use-cases/refresh-user-token';
import { PrismaRefreshTokenRepository } from '@/infra/database/prisma/repositories/prisma-refresh-token-repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import { TokenService } from './tokens.service';

@Injectable()
export class RefreshService {
  constructor(
    private readonly refreshTokenRepository: PrismaRefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(refreshToken: string) {
    const useCase = new RefreshUserTokenUseCase(
      this.refreshTokenRepository,
      this.tokenService,
    );

    const result = await useCase.execute({ refreshToken });
    if (isLeft(result)) {
      throw new UnauthorizedException(result.left.message);
    }

    return result.right;
  }
}
