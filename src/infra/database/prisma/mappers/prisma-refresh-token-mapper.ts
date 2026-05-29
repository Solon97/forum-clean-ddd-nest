import { RefreshToken } from '@/domain/forum/entities/refresh-token';
import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { RefreshToken as PrismaRefreshToken } from '../generated/client';
import { RefreshTokenUncheckedCreateInput } from '../generated/models';

export class PrismaRefreshTokenMapper {
  static toDomain(raw: PrismaRefreshToken): Either<Error, RefreshToken> {
    const idOrError = UniqueEntityId.createFromExistingId(raw.id);
    if (isLeft(idOrError)) {
      return left(new InvalidUniqueEntityIdError('Refresh token id'));
    }

    const userIdOrError = UniqueEntityId.createFromExistingId(raw.userId);
    if (isLeft(userIdOrError)) {
      return left(new InvalidUniqueEntityIdError('Refresh token user id'));
    }

    return right(
      new RefreshToken(
        {
          token: raw.token,
          userId: userIdOrError.right,
          expiresAt: raw.expiresAt,
          revoked: raw.revoked,
        },
        idOrError.right,
      ),
    );
  }

  static toPrisma(
    refreshToken: RefreshToken,
  ): RefreshTokenUncheckedCreateInput {
    return {
      id: refreshToken.id.toString(),
      token: refreshToken.token,
      userId: refreshToken.userId.toString(),
      expiresAt: refreshToken.expiresAt,
      revoked: refreshToken.revoked,
    };
  }
}
