import { FetchQuestionCommentsUseCase } from '@/domain/forum/use-cases/fetch-question-comments';
import { PrismaQuestionCommentRepository } from '@/infra/database/prisma/repositories/prisma-question-comment-repository';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';
import { QuestionPresenter } from '../question-presenter';

export const fetchQuestionCommentsPageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().positive());

export type FetchQuestionCommentsPageQueryParam = z.infer<
  typeof fetchQuestionCommentsPageQueryParamSchema
>;

@Injectable()
export class FetchQuestionCommentsService {
  constructor(
    private readonly questionCommentRepository: PrismaQuestionCommentRepository,
  ) {}

  async execute(questionId: string, page: FetchQuestionCommentsPageQueryParam) {
    const useCase = new FetchQuestionCommentsUseCase(
      this.questionCommentRepository,
    );
    const result = await useCase.execute({
      questionId,
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
      comments: QuestionPresenter.toJSONCommentList(result.right.comments),
    };
  }
}
