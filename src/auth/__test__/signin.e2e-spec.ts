import { AppModule } from '@/app.module';
import { SignupService } from '@/auth/services/signup.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { z } from 'zod';

const signinResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

describe('Signin E2E Test', () => {
  let app: INestApplication<Server>;
  let signupService: SignupService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    signupService = app.get(SignupService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /auth/signin - should sign in a user', async () => {
    await signupService.execute({
      name: 'testuser',
      email: 'testuser@example.com',
      password: 'testpassword',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'testuser@example.com',
        password: 'testpassword',
      });

    expect(response.status).toBe(201);
    const body = signinResponseSchema.parse(response.body);
    expect(body.access_token).toBeTypeOf('string');
    expect(body.refresh_token).toBeTypeOf('string');
  });
});
