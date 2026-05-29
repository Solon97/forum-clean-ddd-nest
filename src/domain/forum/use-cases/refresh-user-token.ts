import { Either, left, right } from 'fp-ts/lib/Either';
import { TokenGenerator } from '../gateways/token-generator';
import { RefreshTokenRepository } from '../repositories/refresh-token-repository';
import { InvalidTokenError } from './errors/invalid-token-error';

export interface RefreshUserTokenUseCaseInput {
  refreshToken: string;
}

export interface RefreshUserTokenUseCaseOutput {
  access_token: string;
  refresh_token: string;
}

export class RefreshUserTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute({
    refreshToken,
  }: RefreshUserTokenUseCaseInput): Promise<
    Either<InvalidTokenError, RefreshUserTokenUseCaseOutput>
  > {
    const existingToken =
      await this.refreshTokenRepository.findByToken(refreshToken);

    if (!existingToken) {
      return left(new InvalidTokenError());
    }

    if (existingToken.revoked || existingToken.isExpired()) {
      await this.refreshTokenRepository.revokeManyByUserId(
        existingToken.userId.toString(),
      );
      return left(new InvalidTokenError());
    }

    const tokens = await this.tokenGenerator.generateTokens(
      existingToken.userId.toString(),
    );

    return right(tokens);
  }
}
