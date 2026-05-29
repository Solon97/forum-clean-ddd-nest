import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

interface FetchAnswerCommentsResponseBody {
  comments: {
    id: string;
    content: string;
  }[];
}

describe('Fetch Answer Comments E2E Test', () => {
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

  test('[GET] /answers/:answerId/comments - should fetch answer comments', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question with answer comments',
        content: 'Question content',
        slug: 'question-with-answer-comments',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer with comments',
        authorId: userId,
        questionId: question.id,
      },
    });

    await prismaService.comment.createMany({
      data: [
        {
          content: 'First comment',
          authorId: userId,
          answerId: answer.id,
        },
        {
          content: 'Second comment',
          authorId: userId,
          answerId: answer.id,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get(`/answers/${answer.id}/comments?page=1`)
      .set('Authorization', `Bearer ${accessToken}`);
    const responseBody = response.body as FetchAnswerCommentsResponseBody;

    expect(response.status).toBe(200);
    expect(responseBody).toHaveProperty('comments');
    expect(Array.isArray(responseBody.comments)).toBe(true);
    expect(responseBody.comments.length).toBeGreaterThanOrEqual(2);
  });

  test('[GET] /answers/:answerId/comments - should return 400 when page is invalid', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question invalid page answer comments',
        content: 'Question content',
        slug: 'question-invalid-page-answer-comments',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer invalid page comments',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/answers/${answer.id}/comments?page=invalid`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
  });

  test('[GET] /answers/:answerId/comments - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question no auth fetch answer comments',
        content: 'Question content',
        slug: 'question-no-auth-fetch-answer-comments',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer no auth fetch comments',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer()).get(
      `/answers/${answer.id}/comments`,
    );

    expect(response.status).toBe(401);
  });
});
