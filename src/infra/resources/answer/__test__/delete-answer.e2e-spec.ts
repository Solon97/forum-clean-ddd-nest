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

describe('Delete Answer E2E Test', () => {
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

  test('[DELETE] /answers/:answerId - should delete an answer', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question for deleting answer',
        content: 'Question content',
        slug: 'question-for-deleting-answer',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer to delete',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer())
      .delete(`/answers/${answer.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    const deletedAnswer = await prismaService.answer.findUnique({
      where: {
        id: answer.id,
      },
    });

    expect(deletedAnswer).toBeNull();
  });

  test('[DELETE] /answers/:answerId - should null answerId on related attachments', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question for deleting answer with attachment',
        content: 'Question content',
        slug: 'question-for-deleting-answer-with-attachment',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer to delete with attachment',
        authorId: userId,
        questionId: question.id,
      },
    });

    const attachment = await prismaService.attachment.create({
      data: {
        title: 'Answer attachment',
        url: 'https://example.com/answer-attachment.png',
        answerId: answer.id,
      },
    });

    const response = await request(app.getHttpServer())
      .delete(`/answers/${answer.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    const persistedAttachment = await prismaService.attachment.findUnique({
      where: {
        id: attachment.id,
      },
    });

    expect(persistedAttachment?.answerId).toBeNull();
  });

  test('[DELETE] /answers/:answerId - should return 404 for non-existing answer', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .delete('/answers/4279b00d-c4f0-4fda-98ab-e4f87fbe873d')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  test('[DELETE] /answers/:answerId - should return 404 when user is not the author', async () => {
    const author = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question non-author delete answer',
        content: 'Question content',
        slug: 'question-non-author-delete-answer',
        authorId: author.userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer not deletable by others',
        authorId: author.userId,
        questionId: question.id,
      },
    });

    const nonAuthor = await authenticateWithCustomEmail(
      app,
      'other-user-delete-answer@example.com',
    );

    const response = await request(app.getHttpServer())
      .delete(`/answers/${answer.id}`)
      .set('Authorization', `Bearer ${nonAuthor.accessToken}`);

    expect(response.status).toBe(404);
  });

  test('[DELETE] /answers/:answerId - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question no auth delete answer',
        content: 'Question content',
        slug: 'question-no-auth-delete-answer',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer no auth delete',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer()).delete(
      `/answers/${answer.id}`,
    );

    expect(response.status).toBe(401);
  });
});
