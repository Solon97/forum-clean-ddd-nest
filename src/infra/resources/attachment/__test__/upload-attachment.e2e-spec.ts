import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authenticateUserE2ETest } from '@test/e2e/authenticate-user-e2e';
import type { Server } from 'node:http';
import request from 'supertest';

interface UploadAttachmentResponseBody {
  id: string;
  url: string;
}

describe('Upload Attachment E2E Test', () => {
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

  test('[POST] /attachments - should upload a file and persist attachment', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .post('/attachments')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('%PDF-1.4 test content'), {
        filename: 'manual.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('url');

    const responseBody = response.body as UploadAttachmentResponseBody;

    const persistedAttachment = await prismaService.attachment.findUnique({
      where: {
        id: responseBody.id,
      },
    });

    expect(persistedAttachment).not.toBeNull();
    expect(persistedAttachment?.title).toBe('manual.pdf');
    expect(persistedAttachment?.url).toContain('/forum-attachments-test/');
  });

  test('[POST] /attachments - should return 400 for invalid mime type', async () => {
    const { accessToken } = await authenticateUserE2ETest(app);

    const response = await request(app.getHttpServer())
      .post('/attachments')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('plain text'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
  });

  test('[POST] /attachments - should return 401 for unauthenticated user', async () => {
    const response = await request(app.getHttpServer())
      .post('/attachments')
      .attach('file', Buffer.from('%PDF-1.4 test content'), {
        filename: 'manual.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(401);
  });
});
