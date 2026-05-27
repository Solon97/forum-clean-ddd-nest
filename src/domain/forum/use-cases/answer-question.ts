import { Answer } from '../entities/answer';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id/index';
import type { AnswerRepository } from '../repositories/answer-repository';
import { AnswerAttachment } from '../entities/answer-attachment';
import { AnswerAttachmentList } from '../entities/answer-attachment-list';
import { Either, right } from 'fp-ts/lib/Either';
import { DomainEvents } from '@/shared/events/domain-events';

export interface AnswerQuestionUseCaseInput {
  questionId: string;
  authorId: string;
  content: string;
  attachmentIds: string[];
}

export interface AnswerQuestionUseCaseOutput {
  answer: Answer;
}

export class AnswerQuestionUseCase {
  constructor(private answerRepository: AnswerRepository) {}

  async execute({
    questionId,
    authorId,
    content,
    attachmentIds,
  }: AnswerQuestionUseCaseInput): Promise<
    Either<never, AnswerQuestionUseCaseOutput>
  > {
    const answer = new Answer({
      content,
      questionId: new UniqueEntityId(questionId),
      authorId: new UniqueEntityId(authorId),
    });

    const answerAttachments = attachmentIds.map((attachmentId) => {
      return new AnswerAttachment({
        answerId: answer.id,
        attachmentId: new UniqueEntityId(attachmentId),
      });
    });

    answer.attachments = new AnswerAttachmentList(answerAttachments);

    await this.answerRepository.create(answer);
    await DomainEvents.dispatchEventsForAggregate(answer.id);
    return right({ answer });
  }
}
