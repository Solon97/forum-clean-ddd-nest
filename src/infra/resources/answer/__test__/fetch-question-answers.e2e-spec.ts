import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

interface FetchQuestionAnswersResponseBody {
  answers: {
    id: string;
    content: string;
  }[];
}

describe('Fetch Question Answers E2E Test', () => {
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

  test('[GET] /questions/:questionId/answers - should fetch answers for a question', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question with answers',
        content: 'Question content',
        slug: 'question-with-answers',
        authorId: userId,
      },
    });

    const olderAnswer = await prismaService.answer.create({
      data: {
        content: 'Older answer',
        authorId: userId,
        questionId: question.id,
        createdAt: new Date('2024-01-01'),
      },
    });

    const newerAnswer = await prismaService.answer.create({
      data: {
        content: 'Newer answer',
        authorId: userId,
        questionId: question.id,
        createdAt: new Date('2024-06-01'),
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id}/answers?page=1`)
      .set('Authorization', `Bearer ${accessToken}`);
    const responseBody = response.body as FetchQuestionAnswersResponseBody;

    expect(response.status).toBe(200);
    expect(responseBody).toHaveProperty('answers');
    expect(Array.isArray(responseBody.answers)).toBe(true);

    const answers = responseBody.answers;
    const newerIndex = answers.findIndex(
      (answer) => answer.id === newerAnswer.id,
    );
    const olderIndex = answers.findIndex(
      (answer) => answer.id === olderAnswer.id,
    );

    expect(newerIndex).toBeLessThan(olderIndex);
  });

  test('[GET] /questions/:questionId/answers - should return 400 when page is invalid', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question invalid page answers',
        content: 'Question content',
        slug: 'question-invalid-page-answers',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id}/answers?page=invalid`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
  });

  test('[GET] /questions/:questionId/answers - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question no auth fetch answers',
        content: 'Question content',
        slug: 'question-no-auth-fetch-answers',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer()).get(
      `/questions/${question.id}/answers`,
    );

    expect(response.status).toBe(401);
  });
});
