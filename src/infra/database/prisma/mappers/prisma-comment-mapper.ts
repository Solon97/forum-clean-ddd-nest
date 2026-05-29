import { AnswerComment } from '@/domain/forum/entities/comment';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Comment as PrismaComment } from '../generated/client';
import { CommentUncheckedCreateInput } from '../generated/models';

export class PrismaCommentMapper {
  static toDomainAnswerComment(
    raw: PrismaComment,
  ): Either<Error, AnswerComment> {
    const idOrError = UniqueEntityId.createFromExistingId(raw.id);
    if (isLeft(idOrError)) {
      return left(new InvalidUniqueEntityIdError('Comment id'));
    }

    const authorIdOrError = UniqueEntityId.createFromExistingId(raw.authorId);
    if (isLeft(authorIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Comment authorId'));
    }

    if (!raw.answerId) {
      return left(new InvalidUniqueEntityIdError('Comment answerId'));
    }

    const answerIdOrError = UniqueEntityId.createFromExistingId(raw.answerId);
    if (isLeft(answerIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Comment answerId'));
    }

    return right(
      new AnswerComment(
        {
          content: raw.content,
          answerId: answerIdOrError.right,
          authorId: authorIdOrError.right,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt ?? undefined,
        },
        idOrError.right,
      ),
    );
  }

  static toPrismaAnswerComment(
    comment: AnswerComment,
  ): CommentUncheckedCreateInput {
    return {
      id: comment.id.toString(),
      content: comment.content,
      authorId: comment.authorId.toString(),
      answerId: comment.answerId.toString(),
      questionId: null,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
