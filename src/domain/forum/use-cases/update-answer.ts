import { Either, left, right } from 'fp-ts/lib/Either';
import { AnswerRepository } from '../repositories/answer-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';
import { AnswerAttachmentsRepository } from '../repositories/answer-attachments-repository';
import { AnswerAttachmentList } from '../entities/answer-attachment-list';
import { AnswerAttachment } from '../entities/answer-attachment';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { Answer } from '../entities/answer';

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
  ) {}

  async execute({
    answerId,
    authorId,
    content,
    attachmentIds,
  }: UpdateAnswerUseCaseInput): Promise<
    Either<ResourceNotFoundError, UpdateAnswerUseCaseOutput>
  > {
    const answer = await this.answerRepository.findById(answerId);
    if (!answer || answer.authorId.toString() !== authorId) {
      return left(new ResourceNotFoundError());
    }

    const existingAttachments =
      await this.answerAttachmentsRepository.findManyByAnswerId(answerId);
    const answerAttachmentList = new AnswerAttachmentList(existingAttachments);

    const newAnswerAttachments = attachmentIds.map((attachmentId) => {
      return new AnswerAttachment({
        answerId: answer.id,
        attachmentId: new UniqueEntityId(attachmentId),
      });
    });

    answerAttachmentList.update(newAnswerAttachments);
    answer.attachments = answerAttachmentList;
    answer.content = content;
    await this.answerRepository.update(answer);
    return right({ answer });
  }
}
