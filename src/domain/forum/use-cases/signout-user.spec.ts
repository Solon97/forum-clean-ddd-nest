import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { InMemoryRefreshTokenRepository } from '@test/repositories/in-memory-refresh-token-repository';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { RefreshTokenRepository } from '../repositories/refresh-token-repository';
import { RefreshToken } from '../entities/refresh-token';
import { SignoutUserUseCase } from './signout-user';
import { InvalidUniqueEntityIdError } from '@/shared/entities/value-objects/unique-entity-id';

let refreshTokenRepository: RefreshTokenRepository;
let sut: SignoutUserUseCase;

describe('Signout User', () => {
  beforeEach(() => {
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    sut = new SignoutUserUseCase(refreshTokenRepository);
  });

  it('should revoke all tokens for user when signout', async () => {
    const userId = UniqueEntityId.create();
    const otherUserId = UniqueEntityId.create();

    await refreshTokenRepository.create(
      new RefreshToken({
        token: 'token-1',
        userId,
        expiresAt: new Date(Date.now() + 60_000),
        revoked: false,
      }),
    );

    await refreshTokenRepository.create(
      new RefreshToken({
        token: 'token-2',
        userId,
        expiresAt: new Date(Date.now() + 60_000),
        revoked: false,
      }),
    );

    await refreshTokenRepository.create(
      new RefreshToken({
        token: 'token-3',
        userId: otherUserId,
        expiresAt: new Date(Date.now() + 60_000),
        revoked: false,
      }),
    );

    const result = await sut.execute({ userId: userId.toString() });

    assertEitherIsRight(result);
    expect(result.right.success).toBe(true);

    const userToken1 = await refreshTokenRepository.findByToken('token-1');
    const userToken2 = await refreshTokenRepository.findByToken('token-2');
    const otherUserToken = await refreshTokenRepository.findByToken('token-3');

    expect(userToken1?.revoked).toBe(true);
    expect(userToken2?.revoked).toBe(true);
    expect(otherUserToken?.revoked).toBe(false);
  });

  it('should return left when user id is invalid', async () => {
    const result = await sut.execute({ userId: 'invalid-id' });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(InvalidUniqueEntityIdError);
  });
});
