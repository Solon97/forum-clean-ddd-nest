import { AuthenticateUserUseCase } from '@/domain/forum/use-cases/authenticate-user';
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher';
import { PrismaUserRepository } from '@/infra/database/prisma/repositories/prisma-user-repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import { z } from 'zod';
import { TokenService } from './tokens.service';

export const signinBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type SigninBody = z.infer<typeof signinBodySchema>;

@Injectable()
export class SigninService {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly hasher: BcryptHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(body: SigninBody) {
    const useCase = new AuthenticateUserUseCase(
      this.userRepository,
      this.hasher,
      this.tokenService,
    );
    const result = await useCase.execute(body);

    if (isLeft(result)) {
      throw new UnauthorizedException(result.left.message);
    }

    return result.right;
  }
}
