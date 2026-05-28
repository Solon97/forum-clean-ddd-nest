import {
  Question,
  QuestionConstructorProps,
} from '@/domain/forum/entities/question';
import { Question as PrismaQuestion } from '../generated/client';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { Slug } from '@/domain/forum/entities/value-objects/slug';
import { unsafeUnwrap } from '@/shared/either';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { QuestionUncheckedCreateInput } from '../generated/models';

export class PrismaQuestionMapper {
  static toDomain(raw: PrismaQuestion): Either<Error, Question> {
    const questionProps = this.getQuestionProps(raw);
    if (isLeft(questionProps)) {
      return left(questionProps.left);
    }

    return right(
      new Question(
        questionProps.right,
        unsafeUnwrap(UniqueEntityId.createFromExistingId(raw.id)),
      ),
    );
  }

  private static getQuestionProps(
    raw: PrismaQuestion,
  ): Either<Error, QuestionConstructorProps> {
    const authorIdOrError = UniqueEntityId.createFromExistingId(raw.authorId);
    if (isLeft(authorIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Question authorId'));
    }

    const slugOrError = Slug.createFromExistingSlug(raw.slug);
    if (isLeft(slugOrError)) {
      return left(slugOrError.left);
    }

    const questionProps: QuestionConstructorProps = {
      title: raw.title,
      content: raw.content,
      authorId: authorIdOrError.right,
      slug: slugOrError.right,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };

    if (!raw.bestAnswerId) {
      return right(questionProps);
    }

    const bestAnswerIdOrError = UniqueEntityId.createFromExistingId(
      raw.bestAnswerId,
    );
    if (isLeft(bestAnswerIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Question bestAnswerId'));
    }

    return right({
      ...questionProps,
      bestAnswerId: bestAnswerIdOrError.right,
    });
  }

  static toPrisma(question: Question): QuestionUncheckedCreateInput {
    return {
      id: question.id.toString(),
      title: question.title,
      content: question.content,
      slug: question.slug.value,
      authorId: question.authorId.toString(),
      bestAnswerId: question.bestAnswerId?.toString() || null,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
