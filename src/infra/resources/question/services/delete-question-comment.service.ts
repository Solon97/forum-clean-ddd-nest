import { DeleteQuestionCommentUseCase } from '@/domain/forum/use-cases/delete-question-comment';
import { PrismaQuestionCommentRepository } from '@/infra/database/prisma/repositories/prisma-question-comment-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';

export const questionCommentIdParamSchema = z.string().uuid();

export type QuestionCommentIdParam = z.infer<
  typeof questionCommentIdParamSchema
>;

@Injectable()
export class DeleteQuestionCommentService {
  constructor(
    private readonly questionCommentRepository: PrismaQuestionCommentRepository,
  ) {}

  async execute(
    commentId: QuestionCommentIdParam,
    authorId: string,
  ): Promise<void> {
    const useCase = new DeleteQuestionCommentUseCase(
      this.questionCommentRepository,
    );
    const result = await useCase.execute({ commentId, authorId });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }
  }
}
