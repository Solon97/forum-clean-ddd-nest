import { PrismaService } from '@/prisma/prisma.service';
import { compareHashValue } from '@/shared/hash';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';
import { GenerateTokensService } from './generate-tokens.service';

export const signinBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type SigninBody = z.infer<typeof signinBodySchema>;

@Injectable()
export class SigninService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly generateTokensService: GenerateTokensService,
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

    const isPasswordValid = await compareHashValue(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('User credentials are invalid');
    }

    return this.generateTokensService.execute(existingUser.id);
  }
}
