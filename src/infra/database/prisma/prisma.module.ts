import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaQuestionRepository } from './repositories/prisma-question-repository';

@Module({
  providers: [PrismaService, PrismaQuestionRepository],
  exports: [PrismaService, PrismaQuestionRepository],
})
export class PrismaModule {}
