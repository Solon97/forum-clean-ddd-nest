import { PrismaService } from '@/prisma/prisma.service';
import { hashValue } from '@/shared/hash';
import { ConflictException, Injectable } from '@nestjs/common';
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

    const hashedPassword = await hashValue(password);
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
