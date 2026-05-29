import { SetBestAnswerUseCase } from '@/domain/forum/use-cases/set-best-answer';
import { PrismaAnswerRepository } from '@/infra/database/prisma/repositories/prisma-answer-repository';
import { PrismaQuestionRepository } from '@/infra/database/prisma/repositories/prisma-question-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';

@Injectable()
export class SetBestAnswerService {
  constructor(
    private readonly answerRepository: PrismaAnswerRepository,
    private readonly questionRepository: PrismaQuestionRepository,
  ) {}

  async execute(answerId: string, authorId: string): Promise<void> {
    const useCase = new SetBestAnswerUseCase(
      this.answerRepository,
      this.questionRepository,
    );
    const result = await useCase.execute({ answerId, authorId });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }
  }
}
