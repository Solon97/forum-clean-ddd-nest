import { Either, left, right } from 'fp-ts/lib/Either';
import { Hasher } from '../gateways/hasher';
import { TokenGenerator } from '../gateways/token-generator';
import { UserRepository } from '../repositories/user-repository';
import { WrongCredentialsError } from './errors/wrong-credentials-error';

export interface AuthenticateUserUseCaseInput {
  email: string;
  password: string;
}

export interface AuthenticateUserUseCaseOutput {
  access_token: string;
  refresh_token: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hasher: Hasher,
    private tokenGenerator: TokenGenerator,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserUseCaseInput): Promise<
    Either<WrongCredentialsError, AuthenticateUserUseCaseOutput>
  > {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return left(new WrongCredentialsError());

    const isPasswordValid = await this.hasher.compare(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) return left(new WrongCredentialsError());

    const tokens = await this.tokenGenerator.generateTokens(user.id.toString());
    return right(tokens);
  }
}
