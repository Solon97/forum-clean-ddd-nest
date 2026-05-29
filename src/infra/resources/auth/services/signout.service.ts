import { SignoutUserUseCase } from '@/domain/forum/use-cases/signout-user';
import { PrismaRefreshTokenRepository } from '@/infra/database/prisma/repositories/prisma-refresh-token-repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';

@Injectable()
export class SignoutService {
  constructor(
    private readonly refreshTokenRepository: PrismaRefreshTokenRepository,
  ) {}

  async execute(userId: string) {
    const useCase = new SignoutUserUseCase(this.refreshTokenRepository);
    const result = await useCase.execute({ userId });

    if (isLeft(result)) {
      throw new UnauthorizedException(result.left.message);
    }

    return result.right;
  }
}
