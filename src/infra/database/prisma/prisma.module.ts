import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaQuestionRepository } from './repositories/prisma-question-repository';
import { PrismaUserRepository } from './repositories/prisma-user-repository';

@Module({
  providers: [PrismaService, PrismaQuestionRepository, PrismaUserRepository],
  exports: [PrismaService, PrismaQuestionRepository, PrismaUserRepository],
})
export class PrismaModule {}
