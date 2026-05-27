import { AppModule } from '@/infra/app.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';

describe('Signup E2E Test', () => {
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /auth/signup - should create a new user', async () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'testuser',
        email: 'testuser@example.com',
        password: 'testpassword',
      })
      .expect(201);
  });
});
