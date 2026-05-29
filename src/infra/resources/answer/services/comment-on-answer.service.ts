import { CommentOnAnswerUseCase } from '@/domain/forum/use-cases/comment-on-answer';
import { PrismaAnswerCommentRepository } from '@/infra/database/prisma/repositories/prisma-answer-comment-repository';
import { PrismaAnswerRepository } from '@/infra/database/prisma/repositories/prisma-answer-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';

export const commentOnAnswerBodySchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export type CommentOnAnswerBody = z.infer<typeof commentOnAnswerBodySchema>;

@Injectable()
export class CommentOnAnswerService {
  constructor(
    private readonly answerRepository: PrismaAnswerRepository,
    private readonly answerCommentRepository: PrismaAnswerCommentRepository,
  ) {}

  async execute(data: CommentOnAnswerBody, authorId: string, answerId: string) {
    const useCase = new CommentOnAnswerUseCase(
      this.answerRepository,
      this.answerCommentRepository,
    );

    const result = await useCase.execute({
      answerId,
      authorId,
      content: data.content,
    });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }

    return {
      id: result.right.comment.id.toString(),
    };
  }
}
