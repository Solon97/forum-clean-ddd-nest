import { FetchQuestionAnswersUseCase } from '@/domain/forum/use-cases/fetch-question-answers';
import { PrismaAnswerRepository } from '@/infra/database/prisma/repositories/prisma-answer-repository';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';
import { AnswerPresenter } from '../answer-presenter';

export const fetchQuestionAnswersPageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().positive());

export type FetchQuestionAnswersPageQueryParam = z.infer<
  typeof fetchQuestionAnswersPageQueryParamSchema
>;

@Injectable()
export class FetchQuestionAnswersService {
  constructor(private readonly answerRepository: PrismaAnswerRepository) {}

  async execute(questionId: string, page: FetchQuestionAnswersPageQueryParam) {
    const useCase = new FetchQuestionAnswersUseCase(this.answerRepository);
    const result = await useCase.execute({
      questionId,
      paginationParams: {
        page,
        perPage: 20,
      },
    });

    if (isLeft(result)) {
      return {
        answers: [],
      };
    }

    return {
      answers: AnswerPresenter.toJSONList(result.right.answers),
    };
  }
}
