import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { QuestionRepository } from '../repositories/question-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { QuestionAttachment } from '../entities/question-attachment';
import { QuestionAttachmentList } from '../entities/question-attachment-list';
import { QuestionAttachmentsRepository } from '../repositories/question-attachments-repository';
import { Question } from '../entities/question';

interface UpdateQuestionUseCaseInput {
  authorId: string;
  questionId: string;
  title: string;
  content: string;
  attachmentIds: string[];
}

interface UpdateQuestionUseCaseOutput {
  question: Question;
}

export class UpdateQuestionUseCase {
  constructor(
    private questionRepository: QuestionRepository,
    private questionAttachmentsRepository: QuestionAttachmentsRepository,
  ) {}

  async execute({
    questionId,
    authorId,
    title,
    content,
    attachmentIds,
  }: UpdateQuestionUseCaseInput): Promise<
    Either<
      ResourceNotFoundError | InvalidUniqueEntityIdError,
      UpdateQuestionUseCaseOutput
    >
  > {
    const question = await this.questionRepository.findById(questionId);
    if (!question || question.authorId.toString() !== authorId) {
      return left(new ResourceNotFoundError());
    }

    const existingAttachments =
      await this.questionAttachmentsRepository.findManyByQuestionId(questionId);
    const questionAttachmentList = new QuestionAttachmentList(
      existingAttachments,
    );

    const newQuestionAttachments: QuestionAttachment[] = [];
    for (const attachmentId of attachmentIds) {
      const attachmentIdOrError = UniqueEntityId.createFromExistingId(attachmentId);
      if (isLeft(attachmentIdOrError)) {
        return left(new InvalidUniqueEntityIdError('Attachment'));
      }
      newQuestionAttachments.push(
        new QuestionAttachment({
          questionId: question.id,
          attachmentId: attachmentIdOrError.right,
        }),
      );
    }

    questionAttachmentList.update(newQuestionAttachments);
    question.attachments = questionAttachmentList;
    question.title = title;
    question.content = content;

    await this.questionRepository.update(question);
    return right({ question });
  }
}
