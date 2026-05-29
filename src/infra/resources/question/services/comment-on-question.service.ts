import { CommentOnQuestionUseCase } from '@/domain/forum/use-cases/comment-on-question';
import { PrismaQuestionCommentRepository } from '@/infra/database/prisma/repositories/prisma-question-comment-repository';
import { PrismaQuestionRepository } from '@/infra/database/prisma/repositories/prisma-question-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';

export const commentOnQuestionBodySchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export type CommentOnQuestionBody = z.infer<typeof commentOnQuestionBodySchema>;

@Injectable()
export class CommentOnQuestionService {
  constructor(
    private readonly questionRepository: PrismaQuestionRepository,
    private readonly questionCommentRepository: PrismaQuestionCommentRepository,
  ) {}

  async execute(
    data: CommentOnQuestionBody,
    authorId: string,
    questionId: string,
  ) {
    const useCase = new CommentOnQuestionUseCase(
      this.questionRepository,
      this.questionCommentRepository,
    );

    const result = await useCase.execute({
      questionId,
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
