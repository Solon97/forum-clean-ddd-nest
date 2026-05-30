import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

describe('Create Question E2E Test', () => {
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

  test('[POST] /questions - should create a new question', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Question',
        content: 'This is a test question',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');

    const responseBody = response.body as { id: string };
    const questionId = responseBody.id;
    const question = await prismaService.question.findFirst({
      where: {
        id: questionId,
        authorId: userId,
      },
    });
    expect(question).not.toBeNull();
    expect(question?.title).toBe('Test Question');
    expect(question?.content).toBe('This is a test question');
  });

  test('[POST] /questions - should create a new question and bind attachments', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const attachment = await prismaService.attachment.create({
      data: {
        title: 'Question attachment',
        url: 'https://example.com/question-attachment.png',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Question with attachment',
        content: 'This is a test question with attachment',
        attachmentIds: [attachment.id],
      });

    expect(response.status).toBe(201);

    const responseBody = response.body as { id: string };
    const question = await prismaService.question.findFirst({
      where: {
        id: responseBody.id,
        authorId: userId,
      },
    });

    expect(question).not.toBeNull();

    const persistedAttachment = await prismaService.attachment.findUnique({
      where: {
        id: attachment.id,
      },
    });

    expect(persistedAttachment?.questionId).toBe(question?.id);
  });

  test('[POST] /questions - should return 400 if data is invalid', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: '',
        content: '',
      });

    expect(response.status).toBe(400);
  });

  test('[POST] /questions - should return 401 if user is not authenticated', async () => {
    const response = await request(app.getHttpServer())
      .post('/questions')
      .send({
        title: 'Test Question',
        content: 'This is a test question',
      });

    expect(response.status).toBe(401);
  });
});
