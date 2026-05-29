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

describe('Delete Answer Comment E2E Test', () => {
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

  test('[DELETE] /answers/comments/:commentId - should delete an answer comment', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question for deleting answer comment',
        content: 'Question content',
        slug: 'question-for-deleting-answer-comment',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer for deleting comment',
        authorId: userId,
        questionId: question.id,
      },
    });

    const comment = await prismaService.comment.create({
      data: {
        content: 'Comment to delete',
        authorId: userId,
        answerId: answer.id,
      },
    });

    const response = await request(app.getHttpServer())
      .delete(`/answers/comments/${comment.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    const deletedComment = await prismaService.comment.findUnique({
      where: {
        id: comment.id,
      },
    });

    expect(deletedComment).toBeNull();
  });

  test('[DELETE] /answers/comments/:commentId - should return 404 for non-existing comment', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .delete('/answers/comments/4279b00d-c4f0-4fda-98ab-e4f87fbe873d')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  test('[DELETE] /answers/comments/:commentId - should return 404 when user is not the author', async () => {
    const author = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question non-author delete answer comment',
        content: 'Question content',
        slug: 'question-non-author-delete-answer-comment',
        authorId: author.userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer non-author delete comment',
        authorId: author.userId,
        questionId: question.id,
      },
    });

    const comment = await prismaService.comment.create({
      data: {
        content: 'Comment not deletable by others',
        authorId: author.userId,
        answerId: answer.id,
      },
    });

    const nonAuthor = await authenticateWithCustomEmail(
      app,
      'other-user-delete-answer-comment@example.com',
    );

    const response = await request(app.getHttpServer())
      .delete(`/answers/comments/${comment.id}`)
      .set('Authorization', `Bearer ${nonAuthor.accessToken}`);

    expect(response.status).toBe(404);
  });

  test('[DELETE] /answers/comments/:commentId - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question no auth delete answer comment',
        content: 'Question content',
        slug: 'question-no-auth-delete-answer-comment',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer no auth delete comment',
        authorId: userId,
        questionId: question.id,
      },
    });

    const comment = await prismaService.comment.create({
      data: {
        content: 'Comment no auth delete',
        authorId: userId,
        answerId: answer.id,
      },
    });

    const response = await request(app.getHttpServer()).delete(
      `/answers/comments/${comment.id}`,
    );

    expect(response.status).toBe(401);
  });
});
