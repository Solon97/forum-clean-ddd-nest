import { FetchRecentQuestionsUseCase } from '@/domain/forum/use-cases/fetch-recent-questions';
import { PrismaQuestionRepository } from '@/infra/database/prisma/repositories/prisma-question-repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';
import { QuestionPresenter } from '../question-presenter';

export const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().positive());

export type PageQueryParam = z.infer<typeof pageQueryParamSchema>;

@Injectable()
export class FetchRecentQuestionsService {
  constructor(private readonly repository: PrismaQuestionRepository) {}

  async execute(page: PageQueryParam) {
    const useCase = new FetchRecentQuestionsUseCase(this.repository);
    const result = await useCase.execute({
      paginationParams: {
        page,
        perPage: 20,
      },
    });

    if (isLeft(result)) {
      throw new InternalServerErrorException(
        'Failed to fetch recent questions',
      );
    }

    return {
      questions: QuestionPresenter.toJSONList(result.right.questions),
    };
  }
}
