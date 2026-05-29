import {
  InvalidUniqueEntityIdError,
  UniqueEntityId,
} from '@/shared/entities/value-objects/unique-entity-id';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { RefreshTokenRepository } from '../repositories/refresh-token-repository';

export interface SignoutUserUseCaseInput {
  userId: string;
}

export interface SignoutUserUseCaseOutput {
  success: boolean;
}

export class SignoutUserUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({
    userId,
  }: SignoutUserUseCaseInput): Promise<
    Either<InvalidUniqueEntityIdError, SignoutUserUseCaseOutput>
  > {
    const userIdOrError = UniqueEntityId.createFromExistingId(userId);
    if (isLeft(userIdOrError)) {
      return left(new InvalidUniqueEntityIdError('User'));
    }

    await this.refreshTokenRepository.revokeManyByUserId(
      userIdOrError.right.toString(),
    );

    return right({ success: true });
  }
}
