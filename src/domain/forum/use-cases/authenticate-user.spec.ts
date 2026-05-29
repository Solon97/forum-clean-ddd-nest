import { User } from '../entities/user';
import { Hasher } from '../gateways/hasher';
import { TokenGenerator } from '../gateways/token-generator';
import {
  AuthenticateUserUseCase,
  AuthenticateUserUseCaseOutput,
} from './authenticate-user';
import { WrongCredentialsError } from './errors/wrong-credentials-error';
import { UserRepository } from '../repositories/user-repository';
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { Mock } from 'vitest';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

class FakeHasher implements Hasher {
  async hash(value: string): Promise<string> {
    return Promise.resolve(`hashed-${value}`);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed-${value}`);
  }
}

class FakeTokenGenerator implements TokenGenerator {
  async generateTokens(
    userId: UniqueEntityId,
  ): Promise<AuthenticateUserUseCaseOutput> {
    return Promise.resolve({
      access_token: `access-${userId.toString()}`,
      refresh_token: `refresh-${userId.toString()}`,
    });
  }
}

let userRepository: UserRepository;
let hasher: Hasher;
let tokenGenerator: TokenGenerator;
let sut: AuthenticateUserUseCase;
let tokenGeneratorSpy: Mock<typeof tokenGenerator.generateTokens>;

describe('Authenticate User', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hasher = new FakeHasher();
    tokenGenerator = new FakeTokenGenerator();
    sut = new AuthenticateUserUseCase(userRepository, hasher, tokenGenerator);
    tokenGeneratorSpy = vi.spyOn(tokenGenerator, 'generateTokens');
  });

  it('should authenticate user with valid credentials', async () => {
    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-123456',
    });
    await userRepository.create(user);

    const result = await sut.execute({
      email: 'john@example.com',
      password: '123456',
    });

    assertEitherIsRight(result);
    assertSpyCalled(tokenGeneratorSpy, user.id);
    expect(result.right.access_token).toBe(`access-${user.id.toString()}`);
    expect(result.right.refresh_token).toBe(`refresh-${user.id.toString()}`);
  });

  it('should return left when user is not found', async () => {
    const result = await sut.execute({
      email: 'missing@example.com',
      password: '123456',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(WrongCredentialsError);
    assertSpyNotCalled(tokenGeneratorSpy);
  });

  it('should return left when password is invalid', async () => {
    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-123456',
    });
    await userRepository.create(user);

    const result = await sut.execute({
      email: 'john@example.com',
      password: 'wrong-password',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(WrongCredentialsError);
    assertSpyNotCalled(tokenGeneratorSpy);
  });
});
