import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

describe('Comment On Answer E2E Test', () => {
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

  test('[POST] /answers/:answerId/comments - should create a comment on answer', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question for answer comment',
        content: 'Question content',
        slug: 'question-for-answer-comment',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer to comment on',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/answers/${answer.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'This is an answer comment',
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
    expect(comment?.answerId).toBe(answer.id);
    expect(comment?.authorId).toBe(userId);
    expect(comment?.content).toBe('This is an answer comment');
  });

  test('[POST] /answers/:answerId/comments - should return 404 for non-existing answer', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .post('/answers/4279b00d-c4f0-4fda-98ab-e4f87fbe873d/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Comment on missing answer',
      });

    expect(response.status).toBe(404);
  });

  test('[POST] /answers/:answerId/comments - should return 400 when payload is invalid', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question invalid comment payload',
        content: 'Question content',
        slug: 'question-invalid-comment-payload',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer invalid comment payload',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/answers/${answer.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: '',
      });

    expect(response.status).toBe(400);
  });

  test('[POST] /answers/:answerId/comments - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question no auth comment answer',
        content: 'Question content',
        slug: 'question-no-auth-comment-answer',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer no auth comment',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/answers/${answer.id}/comments`)
      .send({
        content: 'No auth comment',
      });

    expect(response.status).toBe(401);
  });
});
