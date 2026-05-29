import { User } from '../entities/user';
import { Hasher } from '../gateways/hasher';
import { UserRepository } from '../repositories/user-repository';
import { RegisterUserUseCase } from './register-user';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { assertSpyCalled, assertSpyNotCalled } from '@test/helpers/spy-helpers';
import { Mock } from 'vitest';

class FakeHasher implements Hasher {
  async hash(value: string): Promise<string> {
    return Promise.resolve(`hashed-${value}`);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed-${value}`);
  }
}

let userRepository: UserRepository;
let hasher: Hasher;
let sut: RegisterUserUseCase;
let hashSpy: Mock<typeof hasher.hash>;
let createSpy: Mock<typeof userRepository.create>;

describe('Register User', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hasher = new FakeHasher();
    sut = new RegisterUserUseCase(userRepository, hasher);
    hashSpy = vi.spyOn(hasher, 'hash');
    createSpy = vi.spyOn(userRepository, 'create');
  });

  it('should register a user with hashed password', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
    });

    assertEitherIsRight(result);
    assertSpyCalled(hashSpy, '123456');
    assertSpyCalled(createSpy);

    expect(result.right.user.email).toBe('john@example.com');
    expect(result.right.user.name).toBe('John Doe');
    expect(result.right.user.passwordHash).toBe('hashed-123456');
  });

  it('should return left when user email already exists', async () => {
    await userRepository.create(
      User.create({
        name: 'Existing User',
        email: 'john@example.com',
        passwordHash: 'hashed-123456',
      }),
    );

    const result = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(UserAlreadyExistsError);
    assertSpyNotCalled(hashSpy);
  });
});
