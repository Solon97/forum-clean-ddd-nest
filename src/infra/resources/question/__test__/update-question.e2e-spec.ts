import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { SigninService } from '@/infra/resources/auth/services/signin.service';
import { SignupService } from '@/infra/resources/auth/services/signup.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

interface UpdateQuestionResponseBody {
  question: {
    id: string;
    title: string;
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

describe('Update Question E2E Test', () => {
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

  test('[PUT] /questions/:id - should update title/content and sync attachments', async () => {
    const { accessToken, userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Original Question',
        content: 'Original content',
        slug: 'original-question',
        authorId: userId,
      },
    });

    const keptAttachment = await prismaService.attachment.create({
      data: {
        title: 'kept',
        url: 'https://example.com/kept.png',
        questionId: question.id,
      },
    });

    const removedAttachment = await prismaService.attachment.create({
      data: {
        title: 'removed',
        url: 'https://example.com/removed.png',
        questionId: question.id,
      },
    });

    const newAttachment = await prismaService.attachment.create({
      data: {
        title: 'new',
        url: 'https://example.com/new.png',
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/questions/${question.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Question',
        content: 'Updated content',
        attachmentIds: [keptAttachment.id, newAttachment.id],
      });
    const responseBody = response.body as UpdateQuestionResponseBody;

    expect(response.status).toBe(200);
    expect(responseBody).toHaveProperty('question');
    expect(responseBody.question.id).toBe(question.id);
    expect(responseBody.question.title).toBe('Updated Question');
    expect(responseBody.question.content).toBe('Updated content');

    const updatedQuestion = await prismaService.question.findUnique({
      where: {
        id: question.id,
      },
    });

    expect(updatedQuestion).not.toBeNull();
    expect(updatedQuestion?.title).toBe('Updated Question');
    expect(updatedQuestion?.content).toBe('Updated content');

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

    expect(refreshedKeptAttachment?.questionId).toBe(question.id);
    expect(refreshedNewAttachment?.questionId).toBe(question.id);
    expect(refreshedRemovedAttachment?.questionId).toBeNull();
  });

  test('[PUT] /questions/:id - should return 404 for non-existing question', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .put('/questions/4279b00d-c4f0-4fda-98ab-e4f87fbe873d')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Question',
        content: 'Updated content',
      });

    expect(response.status).toBe(404);
  });

  test('[PUT] /questions/:id - should return 404 when user is not the author', async () => {
    const author = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Author Question',
        content: 'Author content',
        slug: 'author-question',
        authorId: author.userId,
      },
    });

    const nonAuthor = await authenticateWithCustomEmail(
      app,
      'other-user@example.com',
    );

    const response = await request(app.getHttpServer())
      .put(`/questions/${question.id}`)
      .set('Authorization', `Bearer ${nonAuthor.accessToken}`)
      .send({
        title: 'Updated by non-author',
        content: 'This should fail',
      });

    expect(response.status).toBe(404);
  });

  test('[PUT] /questions/:id - should return 401 without token', async () => {
    const { userId } = await authenticateUserE2ETest(app);

    const question = await prismaService.question.create({
      data: {
        title: 'Question without auth',
        content: 'Question content',
        slug: 'question-without-auth',
        authorId: userId,
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/questions/${question.id}`)
      .send({
        title: 'Updated Question',
        content: 'Updated content',
      });

    expect(response.status).toBe(401);
  });
});
