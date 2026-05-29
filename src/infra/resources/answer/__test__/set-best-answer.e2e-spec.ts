import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { SigninService } from '@/infra/resources/auth/services/signin.service';
import { SignupService } from '@/infra/resources/auth/services/signup.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

async function authenticateWithCustomEmail(
  app: INestApplication<Server>,
  email: string,
): Promise<{ accessToken: string; userId: string }> {
  const signupService = app.get(SignupService);
  const signinService = app.get(SigninService);

  const user = await signupService.execute({
    name: 'other-user',
    email,
    password: 'testpassword',
  });

  const signinResult = await signinService.execute({
    email,
    password: 'testpassword',
  });

  return {
    accessToken: signinResult.access_token,
    userId: user.id,
  };
}

describe('Set Best Answer E2E Test', () => {
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

  test('[PATCH] /answers/:answerId/best - should set best answer for question', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question set best answer',
        content: 'Question content',
        slug: 'question-set-best-answer',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer to become best',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/answers/${answer.id}/best`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    const updatedQuestion = await prismaService.question.findUnique({
      where: {
        id: question.id,
      },
    });

    expect(updatedQuestion?.bestAnswerId).toBe(answer.id);
  });

  test('[PATCH] /answers/:answerId/best - should return 403 when user is not question author', async () => {
    const questionAuthor = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question non-author best answer',
        content: 'Question content',
        slug: 'question-non-author-best-answer',
        authorId: questionAuthor.userId,
      },
    });

    const answerAuthor = await authenticateWithCustomEmail(
      app,
      'answer-author-best@example.com',
    );

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer by another user',
        authorId: answerAuthor.userId,
        questionId: question.id,
      },
    });

    const nonAuthor = await authenticateWithCustomEmail(
      app,
      'non-question-author-best@example.com',
    );

    const response = await request(app.getHttpServer())
      .patch(`/answers/${answer.id}/best`)
      .set('Authorization', `Bearer ${nonAuthor.accessToken}`);

    expect(response.status).toBe(403);
  });

  test('[PATCH] /answers/:answerId/best - should return 404 for non-existing answer', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .patch('/answers/4279b00d-c4f0-4fda-98ab-e4f87fbe873d/best')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  test('[PATCH] /answers/:answerId/best - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question no auth best answer',
        content: 'Question content',
        slug: 'question-no-auth-best-answer',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer no auth best answer',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer()).patch(
      `/answers/${answer.id}/best`,
    );

    expect(response.status).toBe(401);
  });
});
