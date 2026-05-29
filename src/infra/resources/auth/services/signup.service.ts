import { RegisterUserUseCase } from '@/domain/forum/use-cases/register-user';
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher';
import { PrismaUserRepository } from '@/infra/database/prisma/repositories/prisma-user-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { ConflictException, Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';

export const signupBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
});

export type SignupBody = z.infer<typeof signupBodySchema>;

@Injectable()
export class SignupService {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly hasher: BcryptHasher,
  ) {}

  async execute(body: SignupBody) {
    const useCase = new RegisterUserUseCase(this.userRepository, this.hasher);
    const result = await useCase.execute(body);

    if (isLeft(result)) {
      handleUseCaseError(result.left, {
        UserAlreadyExistsError: ConflictException,
      });
    }

    return { id: result.right.user.id.toString() };
  }
}
