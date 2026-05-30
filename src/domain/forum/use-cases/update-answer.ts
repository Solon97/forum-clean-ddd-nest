import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { AnswerRepository } from '../repositories/answer-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';
import { AnswerAttachmentsRepository } from '../repositories/answer-attachments-repository';
import { AnswerAttachmentList } from '../entities/answer-attachment-list';
import { AnswerAttachment } from '../entities/answer-attachment';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { Answer } from '../entities/answer';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { NotAllowedError } from '@/shared/errors/not-allowed';

export interface UpdateAnswerUseCaseInput {
  authorId: string;
  answerId: string;
  content: string;
  attachmentIds: string[];
}

export interface UpdateAnswerUseCaseOutput {
  answer: Answer;
}

export class UpdateAnswerUseCase {
  constructor(
    private answerRepository: AnswerRepository,
    private answerAttachmentsRepository: AnswerAttachmentsRepository,
    private attachmentRepository: AttachmentRepository,
  ) {}

  async execute({
    answerId,
    authorId,
    content,
    attachmentIds,
  }: UpdateAnswerUseCaseInput): Promise<
    Either<
      ResourceNotFoundError | InvalidUniqueEntityIdError | NotAllowedError,
      UpdateAnswerUseCaseOutput
    >
  > {
    const answer = await this.answerRepository.findById(answerId);
    if (!answer || answer.authorId.toString() !== authorId) {
      return left(new ResourceNotFoundError());
    }

    const existingAttachments =
      await this.answerAttachmentsRepository.findManyByAnswerId(answerId);
    const answerAttachmentList = new AnswerAttachmentList(existingAttachments);

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

    const newAnswerAttachments: AnswerAttachment[] = [];
    for (const attachmentStatus of attachmentsAvailabilityStatus) {
      const isLinkedToCurrentAnswer =
        attachmentStatus.answerId === answer.id.toString();
      const hasExternalAnswerLink =
        attachmentStatus.answerId && !isLinkedToCurrentAnswer;
      const isLinkedToQuestion = Boolean(attachmentStatus.questionId);

      if (hasExternalAnswerLink || isLinkedToQuestion) {
        return left(new NotAllowedError());
      }

      const attachmentIdOrError = UniqueEntityId.createFromExistingId(
        attachmentStatus.id,
      );

      if (isLeft(attachmentIdOrError)) {
        return left(new InvalidUniqueEntityIdError('Attachment'));
      }

      newAnswerAttachments.push(
        new AnswerAttachment({
          answerId: answer.id,
          attachmentId: attachmentIdOrError.right,
        }),
      );
    }

    answerAttachmentList.update(newAnswerAttachments);
    answer.attachments = answerAttachmentList;
    answer.content = content;
    await this.answerRepository.update(answer);
    return right({ answer });
  }
}
