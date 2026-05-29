import { RefreshToken } from '../entities/refresh-token';
import { TokenGenerator } from '../gateways/token-generator';
import { RefreshTokenRepository } from '../repositories/refresh-token-repository';
import {
  RefreshUserTokenUseCase,
  RefreshUserTokenUseCaseOutput,
} from './refresh-user-token';
import { InMemoryRefreshTokenRepository } from '@test/repositories/in-memory-refresh-token-repository';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { InvalidTokenError } from './errors/invalid-token-error';

class FakeTokenGenerator implements TokenGenerator {
  async generateTokens(userId: string): Promise<RefreshUserTokenUseCaseOutput> {
    return Promise.resolve({
      access_token: `access-${userId}`,
      refresh_token: `refresh-${userId}`,
    });
  }
}

let refreshTokenRepository: RefreshTokenRepository;
let tokenGenerator: TokenGenerator;
let sut: RefreshUserTokenUseCase;

describe('Refresh User Token', () => {
  beforeEach(() => {
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    tokenGenerator = new FakeTokenGenerator();
    sut = new RefreshUserTokenUseCase(refreshTokenRepository, tokenGenerator);
  });

  it('should refresh user token with valid refresh token', async () => {
    const userId = UniqueEntityId.create();
    const token = 'valid-refresh-token';

    await refreshTokenRepository.create(
      new RefreshToken({
        token,
        userId,
        expiresAt: new Date(Date.now() + 60_000),
        revoked: false,
      }),
    );

    const result = await sut.execute({ refreshToken: token });

    assertEitherIsRight(result);
    expect(result.right.access_token).toBe(`access-${userId.toString()}`);
    expect(result.right.refresh_token).toBe(`refresh-${userId.toString()}`);
  });

  it('should return left when refresh token does not exist', async () => {
    const result = await sut.execute({ refreshToken: 'missing-token' });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(InvalidTokenError);
  });

  it('should revoke user tokens and return left when refresh token is expired', async () => {
    const userId = UniqueEntityId.create();
    const token = 'expired-token';

    await refreshTokenRepository.create(
      new RefreshToken({
        token,
        userId,
        expiresAt: new Date(Date.now() - 60_000),
        revoked: false,
      }),
    );

    const result = await sut.execute({ refreshToken: token });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(InvalidTokenError);

    const persistedToken = await refreshTokenRepository.findByToken(token);
    expect(persistedToken?.revoked).toBe(true);
  });

  it('should revoke user tokens and return left when refresh token is already revoked', async () => {
    const userId = UniqueEntityId.create();
    const token = 'revoked-token';

    await refreshTokenRepository.create(
      new RefreshToken({
        token,
        userId,
        expiresAt: new Date(Date.now() + 60_000),
        revoked: true,
      }),
    );

    const result = await sut.execute({ refreshToken: token });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(InvalidTokenError);

    const persistedToken = await refreshTokenRepository.findByToken(token);
    expect(persistedToken?.revoked).toBe(true);
  });
});
