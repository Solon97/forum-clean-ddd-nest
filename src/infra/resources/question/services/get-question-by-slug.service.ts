import { GetQuestionBySlugUseCase } from '@/domain/forum/use-cases/get-question-by-slug';
import { PrismaQuestionRepository } from '@/infra/database/prisma/repositories/prisma-question-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';
import { QuestionPresenter } from '../question-presenter';

export const questionSlugParamSchema = z.string().min(1);

export type QuestionSlugParam = z.infer<typeof questionSlugParamSchema>;

@Injectable()
export class GetQuestionBySlugService {
  constructor(private readonly questionRepository: PrismaQuestionRepository) {}

  async execute(slug: QuestionSlugParam) {
    const useCase = new GetQuestionBySlugUseCase(this.questionRepository);
    const result = await useCase.execute({ slug });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }

    return {
      question: QuestionPresenter.toJSON(result.right.question),
    };
  }
}
