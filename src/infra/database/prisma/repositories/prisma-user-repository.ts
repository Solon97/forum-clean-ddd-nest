import { User } from '@/domain/forum/entities/user';
import { UserRepository } from '@/domain/forum/repositories/user-repository';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import { PrismaUserMapper } from '../mappers/prisma-user-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user);
    await this.prismaService.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) return null;
    const mapped = PrismaUserMapper.toDomain(user);
    if (isLeft(mapped)) return null;
    return mapped.right;
  }
}
