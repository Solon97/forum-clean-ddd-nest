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
import { AttachmentRepository } from '../repositories/attachment-repository';
import { NotAllowedError } from '@/shared/errors/not-allowed';

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
  constructor(
    private answerRepository: AnswerRepository,
    private attachmentRepository: AttachmentRepository,
  ) {}

  async execute({
    questionId,
    authorId,
    content,
    attachmentIds,
  }: AnswerQuestionUseCaseInput): Promise<
    Either<
      InvalidUniqueEntityIdError | NotAllowedError,
      AnswerQuestionUseCaseOutput
    >
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

    const validAttachmentIds: string[] = [];
    const attachmentIdsSet = new Set<string>();

    for (const attachmentId of attachmentIds) {
      const attachmentIdOrError =
        UniqueEntityId.createFromExistingId(attachmentId);

      if (isLeft(attachmentIdOrError)) {
        return left(new InvalidUniqueEntityIdError('Attachment'));
      }

      const validAttachmentId = attachmentIdOrError.right.toString();
      if (!attachmentIdsSet.has(validAttachmentId)) {
        attachmentIdsSet.add(validAttachmentId);
        validAttachmentIds.push(validAttachmentId);
      }
    }

    const attachmentsAvailabilityStatus =
      await this.attachmentRepository.findManyAvailabilityStatusByIds(
        validAttachmentIds,
      );

    const answerAttachments: AnswerAttachment[] = [];
    for (const attachmentStatus of attachmentsAvailabilityStatus) {
      if (attachmentStatus.questionId || attachmentStatus.answerId) {
        return left(new NotAllowedError());
      }

      const attachmentIdOrError = UniqueEntityId.createFromExistingId(
        attachmentStatus.id,
      );

      if (isLeft(attachmentIdOrError)) {
        return left(new InvalidUniqueEntityIdError('Attachment'));
      }

      answerAttachments.push(
        new AnswerAttachment({
          answerId: answer.id,
          attachmentId: attachmentIdOrError.right,
        }),
      );
    }

    answer.attachments = new AnswerAttachmentList(answerAttachments);

    await this.answerRepository.create(answer);
    await DomainEvents.dispatchEventsForAggregate(answer.id);
    return right({ answer });
  }
}
