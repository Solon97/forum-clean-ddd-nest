import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { z } from 'zod';

const signinBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

type SigninBody = z.infer<typeof signinBodySchema>;

@Controller('auth/signin')
export class SigninController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(signinBodySchema))
  async handle(@Body() body: SigninBody) {
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
    const token = this.jwtService.sign({ sub: existingUser.id });
    return { access_token: token };
  }
}
