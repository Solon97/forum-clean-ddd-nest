import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { genSalt, hash } from 'bcryptjs';
import z from 'zod';

export const signupBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
});

export type SignupBody = z.infer<typeof signupBodySchema>;

@Injectable()
export class SignupService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(body: SignupBody) {
    const { name, email, password } = body;
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

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
