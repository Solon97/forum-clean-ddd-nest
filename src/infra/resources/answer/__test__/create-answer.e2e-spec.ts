import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

describe('Create Answer E2E Test', () => {
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

  test('[POST] /questions/:questionId/answers - should create a new answer and bind attachments', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question for answer',
        content: 'Question content',
        slug: 'question-for-answer',
        authorId: userId,
      },
    });

    const attachment = await prismaService.attachment.create({
      data: {
        title: 'Answer attachment',
        url: 'https://example.com/answer-attachment.png',
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/questions/${question.id}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'This is an answer',
        attachmentIds: [attachment.id],
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');

    const answerId = (response.body as { id: string }).id;
    const answer = await prismaService.answer.findUnique({
      where: {
        id: answerId,
      },
    });

    expect(answer).not.toBeNull();
    expect(answer?.authorId).toBe(userId);
    expect(answer?.questionId).toBe(question.id);
    expect(answer?.content).toBe('This is an answer');

    const persistedAttachment = await prismaService.attachment.findUnique({
      where: {
        id: attachment.id,
      },
    });

    expect(persistedAttachment?.answerId).toBe(answerId);
  });

  test('[POST] /questions/:questionId/answers - should return 400 when payload is invalid', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question invalid payload',
        content: 'Question content',
        slug: 'question-invalid-payload',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/questions/${question.id}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: '',
      });

    expect(response.status).toBe(400);
  });

  test('[POST] /questions/:questionId/answers - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question no auth answer',
        content: 'Question content',
        slug: 'question-no-auth-answer',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/questions/${question.id}/answers`)
      .send({
        content: 'No auth answer',
      });

    expect(response.status).toBe(401);
  });
});
