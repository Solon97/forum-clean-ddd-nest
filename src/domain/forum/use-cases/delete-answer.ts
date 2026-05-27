import { Either, left, right } from 'fp-ts/lib/Either';
import { AnswerRepository } from '../repositories/answer-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

interface DeleteAnswerUseCaseInput {
  answerId: string;
  authorId: string;
}

export class DeleteAnswerUseCase {
  constructor(private answerRepository: AnswerRepository) {}

  async execute({
    answerId,
    authorId,
  }: DeleteAnswerUseCaseInput): Promise<
    Either<ResourceNotFoundError, undefined>
  > {
    const answer = await this.answerRepository.findById(answerId);
    if (!answer || answer.authorId.toString() !== authorId) {
      return left(new ResourceNotFoundError());
    }
    await this.answerRepository.delete(answer);
    return right(undefined);
  }
}
