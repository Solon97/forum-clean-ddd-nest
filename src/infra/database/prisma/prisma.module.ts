import { Module } from '@nestjs/common';
import { PrismaAnswerAttachmentsRepository } from './repositories/prisma-answer-attachments-repository';
import { PrismaAnswerCommentRepository } from './repositories/prisma-answer-comment-repository';
import { PrismaAnswerRepository } from './repositories/prisma-answer-repository';
import { PrismaQuestionAttachmentsRepository } from './repositories/prisma-question-attachments-repository';
import { PrismaService } from './prisma.service';
import { PrismaQuestionCommentRepository } from './repositories/prisma-question-comment-repository';
import { PrismaQuestionRepository } from './repositories/prisma-question-repository';
import { PrismaRefreshTokenRepository } from './repositories/prisma-refresh-token-repository';
import { PrismaUserRepository } from './repositories/prisma-user-repository';

@Module({
  providers: [
    PrismaService,
    PrismaAnswerAttachmentsRepository,
    PrismaAnswerCommentRepository,
    PrismaAnswerRepository,
    PrismaQuestionAttachmentsRepository,
    PrismaQuestionCommentRepository,
    PrismaQuestionRepository,
    PrismaUserRepository,
    PrismaRefreshTokenRepository,
  ],
  exports: [
    PrismaService,
    PrismaAnswerAttachmentsRepository,
    PrismaAnswerCommentRepository,
    PrismaAnswerRepository,
    PrismaQuestionAttachmentsRepository,
    PrismaQuestionCommentRepository,
    PrismaQuestionRepository,
    PrismaUserRepository,
    PrismaRefreshTokenRepository,
  ],
})
export class PrismaModule {}
