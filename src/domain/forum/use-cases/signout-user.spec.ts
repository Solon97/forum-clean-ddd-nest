import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { InMemoryRefreshTokenRepository } from '@test/repositories/in-memory-refresh-token-repository';
import { RefreshToken } from '../entities/refresh-token';
import { RefreshTokenRepository } from '../repositories/refresh-token-repository';
import { SignoutUserUseCase } from './signout-user';

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

    await sut.execute({ userId: userId.toString() });

    const userToken1 = await refreshTokenRepository.findByToken('token-1');
    const userToken2 = await refreshTokenRepository.findByToken('token-2');
    const otherUserToken = await refreshTokenRepository.findByToken('token-3');

    expect(userToken1?.revoked).toBe(true);
    expect(userToken2?.revoked).toBe(true);
    expect(otherUserToken?.revoked).toBe(false);
  });
});
