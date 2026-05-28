import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { QuestionComment } from '../entities/comment';
import { QuestionCommentRepository } from '../repositories/question-comment-repository';
import { QuestionRepository } from '../repositories/question-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

export interface CommentOnQuestionUseCaseInput {
  authorId: string;
  questionId: string;
  content: string;
}

export interface CommentOnQuestionUseCaseOutput {
  comment: QuestionComment;
}

export class CommentOnQuestionUseCase {
  constructor(
    private questionRepository: QuestionRepository,
    private questionCommentRepository: QuestionCommentRepository,
  ) {}

  async execute({
    authorId,
    questionId,
    content,
  }: CommentOnQuestionUseCaseInput): Promise<
    Either<
      ResourceNotFoundError | InvalidUniqueEntityIdError,
      CommentOnQuestionUseCaseOutput
    >
  > {
    const authorIdOrError = UniqueEntityId.createFromExistingId(authorId);
    if (isLeft(authorIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Author'));
    }

    const questionIdOrError = UniqueEntityId.createFromExistingId(questionId);
    if (isLeft(questionIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Question'));
    }

    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      return left(new ResourceNotFoundError());
    }

    const comment = new QuestionComment({
      authorId: authorIdOrError.right,
      questionId: questionIdOrError.right,
      content,
    });

    await this.questionCommentRepository.create(comment);

    return right({ comment });
  }
}
