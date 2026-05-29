import { PrismaClient } from '@/infra/database/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
