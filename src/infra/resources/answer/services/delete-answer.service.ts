import { DeleteAnswerUseCase } from '@/domain/forum/use-cases/delete-answer';
import { PrismaAnswerRepository } from '@/infra/database/prisma/repositories/prisma-answer-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';

@Injectable()
export class DeleteAnswerService {
  constructor(private readonly answerRepository: PrismaAnswerRepository) {}

  async execute(answerId: string, authorId: string): Promise<void> {
    const useCase = new DeleteAnswerUseCase(this.answerRepository);
    const result = await useCase.execute({ answerId, authorId });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }
  }
}
