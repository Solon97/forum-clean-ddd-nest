import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Body,
  ConflictException,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const signupBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
});

type SignupBody = z.infer<typeof signupBodySchema>;

@Controller('signup')
export class SignupController {
  constructor(private readonly prismaService: PrismaService) {}
  @Post()
  @UsePipes(new ZodValidationPipe(signupBodySchema))
  async handle(@Body() body: SignupBody) {
    const { name, email, password } = body;
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return user;
  }
}
