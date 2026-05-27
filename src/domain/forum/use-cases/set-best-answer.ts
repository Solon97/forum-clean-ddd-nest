import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id/index';
import { DomainEvents } from '@/shared/events/domain-events';
import { Either, left, right } from 'fp-ts/lib/Either';
import { NotAllowedError } from '../../../shared/errors/not-allowed';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';
import type { AnswerRepository } from '../repositories/answer-repository';
import { QuestionRepository } from '../repositories/question-repository';

export interface SetBestAnswerUseCaseInput {
  answerId: string;
  authorId: string;
}

export class SetBestAnswerUseCase {
  constructor(
    private answerRepository: AnswerRepository,
    private questionRepository: QuestionRepository,
  ) {}

  async execute({
    answerId,
    authorId,
  }: SetBestAnswerUseCaseInput): Promise<
    Either<ResourceNotFoundError | NotAllowedError, undefined>
  > {
    const answer = await this.answerRepository.findById(answerId);
    if (!answer) {
      return left(new ResourceNotFoundError());
    }
    const question = await this.questionRepository.findById(
      answer.questionId.toString(),
    );
    if (!question) {
      return left(new ResourceNotFoundError());
    }
    if (question.authorId.toString() !== authorId) {
      return left(new NotAllowedError());
    }
    question.bestAnswerId = new UniqueEntityId(answerId);
    await this.questionRepository.update(question);
    await DomainEvents.dispatchEventsForAggregate(question.id);
    return right(undefined);
  }
}
