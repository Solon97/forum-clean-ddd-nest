import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

interface GetQuestionBySlugResponseBody {
  question: {
    id: string;
    slug: string;
  };
}

describe('Get Question By Slug E2E Test', () => {
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

  test('[GET] /questions/:slug - should get question by slug', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const createdQuestion = await prismaService.question.create({
      data: {
        title: 'How to test slug route',
        content: 'Question content',
        slug: 'how-to-test-slug-route',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/questions/${createdQuestion.slug}`)
      .set('Authorization', `Bearer ${accessToken}`);
    const responseBody = response.body as GetQuestionBySlugResponseBody;

    expect(response.status).toBe(200);
    expect(responseBody).toHaveProperty('question');
    expect(responseBody.question.id).toBe(createdQuestion.id);
    expect(responseBody.question.slug).toBe(createdQuestion.slug);
  });

  test('[GET] /questions/:slug - should return 404 for non-existing slug', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .get('/questions/non-existing-slug')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  test('[GET] /questions/:slug - should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get(
      '/questions/any-slug',
    );

    expect(response.status).toBe(401);
  });
});
