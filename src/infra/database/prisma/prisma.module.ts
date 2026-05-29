import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaQuestionRepository } from './repositories/prisma-question-repository';
import { PrismaRefreshTokenRepository } from './repositories/prisma-refresh-token-repository';
import { PrismaUserRepository } from './repositories/prisma-user-repository';

@Module({
  providers: [
    PrismaService,
    PrismaQuestionRepository,
    PrismaUserRepository,
    PrismaRefreshTokenRepository,
  ],
  exports: [
    PrismaService,
    PrismaQuestionRepository,
    PrismaUserRepository,
    PrismaRefreshTokenRepository,
  ],
})
export class PrismaModule {}
