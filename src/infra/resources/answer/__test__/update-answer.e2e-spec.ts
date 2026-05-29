import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { SigninService } from '@/infra/resources/auth/services/signin.service';
import { SignupService } from '@/infra/resources/auth/services/signup.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

interface UpdateAnswerResponseBody {
  answer: {
    id: string;
    content: string;
  };
}

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

describe('Update Answer E2E Test', () => {
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

  test('[PUT] /answers/:answerId - should update content and sync attachments', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question for updating answer',
        content: 'Question content',
        slug: 'question-for-updating-answer',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Original answer content',
        authorId: userId,
        questionId: question.id,
      },
    });

    const keptAttachment = await prismaService.attachment.create({
      data: {
        title: 'kept',
        url: 'https://example.com/answer-kept.png',
        answerId: answer.id,
      },
    });

    const removedAttachment = await prismaService.attachment.create({
      data: {
        title: 'removed',
        url: 'https://example.com/answer-removed.png',
        answerId: answer.id,
      },
    });

    const newAttachment = await prismaService.attachment.create({
      data: {
        title: 'new',
        url: 'https://example.com/answer-new.png',
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/answers/${answer.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Updated answer content',
        attachmentIds: [keptAttachment.id, newAttachment.id],
      });

    expect(response.status).toBe(200);

    const responseBody = response.body as UpdateAnswerResponseBody;
    expect(responseBody.answer.id).toBe(answer.id);
    expect(responseBody.answer.content).toBe('Updated answer content');

    const updatedAnswer = await prismaService.answer.findUnique({
      where: {
        id: answer.id,
      },
    });
    expect(updatedAnswer?.content).toBe('Updated answer content');

    const refreshedKeptAttachment = await prismaService.attachment.findUnique({
      where: {
        id: keptAttachment.id,
      },
    });

    const refreshedNewAttachment = await prismaService.attachment.findUnique({
      where: {
        id: newAttachment.id,
      },
    });

    const refreshedRemovedAttachment =
      await prismaService.attachment.findUnique({
        where: {
          id: removedAttachment.id,
        },
      });

    expect(refreshedKeptAttachment?.answerId).toBe(answer.id);
    expect(refreshedNewAttachment?.answerId).toBe(answer.id);
    expect(refreshedRemovedAttachment?.answerId).toBeNull();
  });

  test('[PUT] /answers/:answerId - should return 404 for non-existing answer', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .put('/answers/4279b00d-c4f0-4fda-98ab-e4f87fbe873d')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Updated content',
      });

    expect(response.status).toBe(404);
  });

  test('[PUT] /answers/:answerId - should return 404 when user is not the author', async () => {
    const author = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question non-author update answer',
        content: 'Question content',
        slug: 'question-non-author-update-answer',
        authorId: author.userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Author answer content',
        authorId: author.userId,
        questionId: question.id,
      },
    });

    const nonAuthor = await authenticateWithCustomEmail(
      app,
      'other-user-update-answer@example.com',
    );

    const response = await request(app.getHttpServer())
      .put(`/answers/${answer.id}`)
      .set('Authorization', `Bearer ${nonAuthor.accessToken}`)
      .send({
        content: 'Updated by non-author',
      });

    expect(response.status).toBe(404);
  });

  test('[PUT] /answers/:answerId - should return 400 when payload is invalid', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question invalid answer payload',
        content: 'Question content',
        slug: 'question-invalid-answer-payload',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer content',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/answers/${answer.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: '',
      });

    expect(response.status).toBe(400);
  });

  test('[PUT] /answers/:answerId - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question no auth update answer',
        content: 'Question content',
        slug: 'question-no-auth-update-answer',
        authorId: userId,
      },
    });

    const answer = await prismaService.answer.create({
      data: {
        content: 'Answer no auth update',
        authorId: userId,
        questionId: question.id,
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/answers/${answer.id}`)
      .send({
        content: 'Updated without auth',
      });

    expect(response.status).toBe(401);
  });
});
