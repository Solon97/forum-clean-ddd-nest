import { FetchAnswerCommentsUseCase } from '@/domain/forum/use-cases/fetch-answer-comments';
import { PrismaAnswerCommentRepository } from '@/infra/database/prisma/repositories/prisma-answer-comment-repository';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';
import { AnswerPresenter } from '../answer-presenter';

export const fetchAnswerCommentsPageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().positive());

export type FetchAnswerCommentsPageQueryParam = z.infer<
  typeof fetchAnswerCommentsPageQueryParamSchema
>;

@Injectable()
export class FetchAnswerCommentsService {
  constructor(
    private readonly answerCommentRepository: PrismaAnswerCommentRepository,
  ) {}

  async execute(answerId: string, page: FetchAnswerCommentsPageQueryParam) {
    const useCase = new FetchAnswerCommentsUseCase(
      this.answerCommentRepository,
    );
    const result = await useCase.execute({
      answerId,
      paginationParams: {
        page,
        perPage: 20,
      },
    });

    if (isLeft(result)) {
      return {
        comments: [],
      };
    }

    return {
      comments: AnswerPresenter.toJSONCommentList(result.right.comments),
    };
  }
}
