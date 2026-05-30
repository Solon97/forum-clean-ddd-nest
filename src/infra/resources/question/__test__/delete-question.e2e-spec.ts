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

describe('Delete Question E2E Test', () => {
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

  test('[DELETE] /questions/:id - should delete a question', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question to delete',
        content: 'Delete content',
        slug: 'question-to-delete',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer())
      .delete(`/questions/${question.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    const deletedQuestion = await prismaService.question.findUnique({
      where: {
        id: question.id,
      },
    });

    expect(deletedQuestion).toBeNull();
  });

  test('[DELETE] /questions/:id - should null questionId on related attachments', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question with attachment to delete',
        content: 'Delete content',
        slug: 'question-with-attachment-to-delete',
        authorId: userId,
      },
    });

    const attachment = await prismaService.attachment.create({
      data: {
        title: 'Question attachment',
        url: 'https://example.com/question-attachment.png',
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer())
      .delete(`/questions/${question.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    const persistedAttachment = await prismaService.attachment.findUnique({
      where: {
        id: attachment.id,
      },
    });

    expect(persistedAttachment?.questionId).toBeNull();
  });

  test('[DELETE] /questions/:id - should return 404 for non-existing question', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .delete('/questions/4279b00d-c4f0-4fda-98ab-e4f87fbe873d')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
  });

  test('[DELETE] /questions/:id - should return 404 when user is not the author', async () => {
    const author = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question not deletable by others',
        content: 'Delete content',
        slug: 'question-not-deletable-by-others',
        authorId: author.userId,
      },
    });

    const nonAuthor = await authenticateWithCustomEmail(
      app,
      'other-user-delete@example.com',
    );

    const response = await request(app.getHttpServer())
      .delete(`/questions/${question.id}`)
      .set('Authorization', `Bearer ${nonAuthor.accessToken}`);

    expect(response.status).toBe(404);
  });

  test('[DELETE] /questions/:id - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question without auth delete',
        content: 'Delete content',
        slug: 'question-without-auth-delete',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer()).delete(
      `/questions/${question.id}`,
    );

    expect(response.status).toBe(401);
  });
});
