import { Module } from '@nestjs/common';
import { PrismaQuestionAttachmentsRepository } from './repositories/prisma-question-attachments-repository';
import { PrismaService } from './prisma.service';
import { PrismaQuestionRepository } from './repositories/prisma-question-repository';
import { PrismaRefreshTokenRepository } from './repositories/prisma-refresh-token-repository';
import { PrismaUserRepository } from './repositories/prisma-user-repository';

@Module({
  providers: [
    PrismaService,
    PrismaQuestionAttachmentsRepository,
    PrismaQuestionRepository,
    PrismaUserRepository,
    PrismaRefreshTokenRepository,
  ],
  exports: [
    PrismaService,
    PrismaQuestionAttachmentsRepository,
    PrismaQuestionRepository,
    PrismaUserRepository,
    PrismaRefreshTokenRepository,
  ],
})
export class PrismaModule {}
