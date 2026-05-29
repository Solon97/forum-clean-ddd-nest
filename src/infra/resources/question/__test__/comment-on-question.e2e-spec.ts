import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

describe('Comment On Question E2E Test', () => {
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

  test('[POST] /questions/:questionId/comments - should create a comment on question', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question for comment',
        content: 'Question content',
        slug: 'question-for-comment-on-question',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/questions/${question.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'This is a question comment',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');

    const commentId = (response.body as { id: string }).id;
    const comment = await prismaService.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    expect(comment).not.toBeNull();
    expect(comment?.questionId).toBe(question.id);
    expect(comment?.authorId).toBe(userId);
    expect(comment?.content).toBe('This is a question comment');
  });

  test('[POST] /questions/:questionId/comments - should return 404 for non-existing question', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .post('/questions/4279b00d-c4f0-4fda-98ab-e4f87fbe873d/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Comment on missing question',
      });

    expect(response.status).toBe(404);
  });

  test('[POST] /questions/:questionId/comments - should return 400 when payload is invalid', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question invalid comment payload',
        content: 'Question content',
        slug: 'question-invalid-comment-payload-question',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/questions/${question.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: '',
      });

    expect(response.status).toBe(400);
  });

  test('[POST] /questions/:questionId/comments - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question no auth comment',
        content: 'Question content',
        slug: 'question-no-auth-comment',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/questions/${question.id}/comments`)
      .send({
        content: 'No auth question comment',
      });

    expect(response.status).toBe(401);
  });
});
