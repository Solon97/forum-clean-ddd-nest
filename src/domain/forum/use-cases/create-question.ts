import { Question } from '../entities/question';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { QuestionRepository } from '../repositories/question-repository';
import { QuestionAttachment } from '../entities/question-attachment';
import { QuestionAttachmentList } from '../entities/question-attachment-list';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';

export interface CreateQuestionUseCaseInput {
  authorId: string;
  title: string;
  content: string;
  attachmentIds: string[];
}

export interface CreateQuestionUseCaseOutput {
  question: Question;
}

export class CreateQuestionUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute({
    authorId,
    title,
    content,
    attachmentIds,
  }: CreateQuestionUseCaseInput): Promise<
    Either<InvalidUniqueEntityIdError, CreateQuestionUseCaseOutput>
  > {
    const authorIdOrError = UniqueEntityId.createFromExistingId(authorId);
    if (isLeft(authorIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Author'));
    }

    const question = new Question({
      authorId: authorIdOrError.right,
      title,
      content,
    });

    const questionAttachments: QuestionAttachment[] = [];
    for (const attachmentId of attachmentIds) {
      const attachmentIdOrError =
        UniqueEntityId.createFromExistingId(attachmentId);
      if (isLeft(attachmentIdOrError)) {
        return left(new InvalidUniqueEntityIdError('Attachment'));
      }
      questionAttachments.push(
        new QuestionAttachment({
          questionId: question.id,
          attachmentId: attachmentIdOrError.right,
        }),
      );
    }

    question.attachments = new QuestionAttachmentList(questionAttachments);

    await this.questionRepository.create(question);

    return right({ question });
  }
}
