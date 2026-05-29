import { Either, left, right } from 'fp-ts/lib/Either';
import { User } from '../entities/user';
import { Hasher } from '../gateways/hasher';
import { UserRepository } from '../repositories/user-repository';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';

export interface RegisterUserUseCaseInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserUseCaseOutput {
  user: User;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hasher: Hasher,
  ) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUserUseCaseInput): Promise<
    Either<UserAlreadyExistsError, RegisterUserUseCaseOutput>
  > {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return left(new UserAlreadyExistsError());
    }

    const hashedPassword = await this.hasher.hash(password);

    const user = User.create({ name, email, passwordHash: hashedPassword });

    await this.userRepository.create(user);

    return right({ user });
  }
}
