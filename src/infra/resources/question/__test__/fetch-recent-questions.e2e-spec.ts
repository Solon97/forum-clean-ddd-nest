import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

describe('Fetch Recent Questions E2E Test', () => {
  let app: INestApplication<Server>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /questions - should return a list of recent questions', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    await prismaService.question.createMany({
      data: [
        {
          title: 'Question One',
          content: 'Content of question one',
          slug: 'question-one',
          authorId: userId,
        },
        {
          title: 'Question Two',
          content: 'Content of question two',
          slug: 'question-two',
          authorId: userId,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('questions');
    expect(Array.isArray(response.body.questions)).toBe(true);
    expect(response.body.questions.length).toBeGreaterThanOrEqual(2);

    const titles = response.body.questions.map(
      (q: { title: string }) => q.title,
    );
    expect(titles).toContain('Question One');
    expect(titles).toContain('Question Two');
  });

  test('[GET] /questions - should return questions ordered by most recent first', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const older = await prismaService.question.create({
      data: {
        title: 'Older Question',
        content: 'Older content',
        slug: `older-question-${Date.now()}`,
        authorId: userId,
        createdAt: new Date('2024-01-01'),
      },
    });

    const newer = await prismaService.question.create({
      data: {
        title: 'Newer Question',
        content: 'Newer content',
        slug: `newer-question-${Date.now()}`,
        authorId: userId,
        createdAt: new Date('2024-06-01'),
      },
    });

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    const questions = response.body.questions as { id: string }[];
    const newerIndex = questions.findIndex((q) => q.id === newer.id);
    const olderIndex = questions.findIndex((q) => q.id === older.id);

    expect(newerIndex).toBeLessThan(olderIndex);
  });

  test('[GET] /questions - should paginate results with ?page param', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .get('/questions?page=1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('questions');
  });

  test('[GET] /questions - should return 400 if page param is invalid', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .get('/questions?page=invalid')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
  });

  test('[GET] /questions - should return 401 if user is not authenticated', async () => {
    const response = await request(app.getHttpServer()).get('/questions');

    expect(response.status).toBe(401);
  });
});
