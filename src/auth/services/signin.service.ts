import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
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
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(body: SigninBody) {
    const { email, password } = body;

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser) {
      throw new UnauthorizedException('User credentials are invalid');
    }

    const isPasswordValid = await compare(password, existingUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('User credentials are invalid');
    }

    return this.tokenService.generateTokens(existingUser.id);
  }
}
