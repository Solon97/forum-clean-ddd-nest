import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { isLeft } from 'fp-ts/lib/Either';
import { RefreshTokenRepository } from '../repositories/refresh-token-repository';

export interface SignoutUserUseCaseInput {
  userId: string;
}

export class SignoutUserUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({ userId }: SignoutUserUseCaseInput): Promise<void> {
    const userIdOrError = UniqueEntityId.createFromExistingId(userId);
    if (isLeft(userIdOrError)) {
      return;
    }

    await this.refreshTokenRepository.revokeManyByUserId(
      userIdOrError.right.toString(),
    );
  }
}
