import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { AnswerComment } from '../entities/comment';
import { AnswerCommentRepository } from '../repositories/answer-comment-repository';
import { AnswerRepository } from '../repositories/answer-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';

export interface CommentOnAnswerUseCaseInput {
  authorId: string;
  answerId: string;
  content: string;
}

export interface CommentOnAnswerUseCaseOutput {
  comment: AnswerComment;
}

export class CommentOnAnswerUseCase {
  constructor(
    private answerRepository: AnswerRepository,
    private answerCommentRepository: AnswerCommentRepository,
  ) {}

  async execute({
    authorId,
    answerId,
    content,
  }: CommentOnAnswerUseCaseInput): Promise<
    Either<
      ResourceNotFoundError | InvalidUniqueEntityIdError,
      CommentOnAnswerUseCaseOutput
    >
  > {
    const authorIdOrError = UniqueEntityId.createFromExistingId(authorId);
    if (isLeft(authorIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Author'));
    }

    const answerIdOrError = UniqueEntityId.createFromExistingId(answerId);
    if (isLeft(answerIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Answer'));
    }

    const answer = await this.answerRepository.findById(answerId);
    if (!answer) {
      return left(new ResourceNotFoundError());
    }

    const comment = new AnswerComment({
      authorId: authorIdOrError.right,
      answerId: answerIdOrError.right,
      content,
    });

    await this.answerCommentRepository.create(comment);

    return right({ comment });
  }
}
