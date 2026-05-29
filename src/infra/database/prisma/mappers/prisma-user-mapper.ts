import { User } from '@/domain/forum/entities/user';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { User as PrismaUser } from '../generated/client';
import { UserUncheckedCreateInput } from '../generated/models';

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): Either<Error, User> {
    const idOrError = UniqueEntityId.createFromExistingId(raw.id);
    if (isLeft(idOrError)) {
      return left(new InvalidUniqueEntityIdError('User id'));
    }
    return right(
      User.create(
        { name: raw.name, email: raw.email, passwordHash: raw.password },
        idOrError.right,
      ),
    );
  }

  static toPrisma(user: User): UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.passwordHash,
    };
  }
}
