import { SignoutUserUseCase } from '@/domain/forum/use-cases/signout-user';
import { PrismaRefreshTokenRepository } from '@/infra/database/prisma/repositories/prisma-refresh-token-repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SignoutService {
  constructor(
    private readonly refreshTokenRepository: PrismaRefreshTokenRepository,
  ) {}

  async execute(userId: string) {
    const useCase = new SignoutUserUseCase(this.refreshTokenRepository);
    await useCase.execute({ userId });
  }
}
