import { DeleteAnswerCommentUseCase } from '@/domain/forum/use-cases/delete-answer-comment';
import { PrismaAnswerCommentRepository } from '@/infra/database/prisma/repositories/prisma-answer-comment-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';

export const answerCommentIdParamSchema = z.string().uuid();

export type AnswerCommentIdParam = z.infer<typeof answerCommentIdParamSchema>;

@Injectable()
export class DeleteAnswerCommentService {
  constructor(
    private readonly answerCommentRepository: PrismaAnswerCommentRepository,
  ) {}

  async execute(
    commentId: AnswerCommentIdParam,
    authorId: string,
  ): Promise<void> {
    const useCase = new DeleteAnswerCommentUseCase(
      this.answerCommentRepository,
    );
    const result = await useCase.execute({ commentId, authorId });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }
  }
}
