import { Answer } from '@/domain/forum/entities/answer';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Answer as PrismaAnswer } from '../generated/client';
import { AnswerUncheckedCreateInput } from '../generated/models';

export class PrismaAnswerMapper {
  static toDomain(raw: PrismaAnswer): Either<Error, Answer> {
    const idOrError = UniqueEntityId.createFromExistingId(raw.id);
    if (isLeft(idOrError)) {
      return left(new InvalidUniqueEntityIdError('Answer id'));
    }

    const questionIdOrError = UniqueEntityId.createFromExistingId(
      raw.questionId,
    );
    if (isLeft(questionIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Answer questionId'));
    }

    const authorIdOrError = UniqueEntityId.createFromExistingId(raw.authorId);
    if (isLeft(authorIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Answer authorId'));
    }

    return right(
      new Answer(
        {
          content: raw.content,
          questionId: questionIdOrError.right,
          authorId: authorIdOrError.right,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt ?? undefined,
        },
        idOrError.right,
      ),
    );
  }

  static toPrisma(answer: Answer): AnswerUncheckedCreateInput {
    return {
      id: answer.id.toString(),
      content: answer.content,
      questionId: answer.questionId.toString(),
      authorId: answer.authorId.toString(),
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    };
  }
}
