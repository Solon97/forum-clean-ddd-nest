import { DeleteQuestionUseCase } from '@/domain/forum/use-cases/delete-question';
import { PrismaQuestionRepository } from '@/infra/database/prisma/repositories/prisma-question-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';

@Injectable()
export class DeleteQuestionService {
  constructor(private readonly questionRepository: PrismaQuestionRepository) {}

  async execute(questionId: string, authorId: string): Promise<void> {
    const useCase = new DeleteQuestionUseCase(this.questionRepository);
    const result = await useCase.execute({ questionId, authorId });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }
  }
}
