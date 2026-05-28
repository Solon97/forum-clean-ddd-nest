import { Answer } from '../entities/answer';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id/index';
import type { AnswerRepository } from '../repositories/answer-repository';
import { AnswerAttachment } from '../entities/answer-attachment';
import { AnswerAttachmentList } from '../entities/answer-attachment-list';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
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
    Either<InvalidUniqueEntityIdError, AnswerQuestionUseCaseOutput>
  > {
    const questionIdOrError = UniqueEntityId.createFromExistingId(questionId);
    const authorIdOrError = UniqueEntityId.createFromExistingId(authorId);

    if (isLeft(questionIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Question'));
    }

    if (isLeft(authorIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Author'));
    }

    const answer = new Answer({
      content,
      questionId: questionIdOrError.right,
      authorId: authorIdOrError.right,
    });

    const answerAttachments: AnswerAttachment[] = [];
    attachmentIds.forEach((attachmentId) => {
      const attachmentIdOrError =
        UniqueEntityId.createFromExistingId(attachmentId);

      if (isLeft(attachmentIdOrError)) {
        return left(new InvalidUniqueEntityIdError('Attachment'));
      }

      answerAttachments.push(
        new AnswerAttachment({
          answerId: answer.id,
          attachmentId: attachmentIdOrError.right,
        }),
      );
    });

    answer.attachments = new AnswerAttachmentList(answerAttachments);

    await this.answerRepository.create(answer);
    await DomainEvents.dispatchEventsForAggregate(answer.id);
    return right({ answer });
  }
}
