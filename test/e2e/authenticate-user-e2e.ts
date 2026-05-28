import { SigninService } from '@/infra/resources/auth/services/signin.service';
import { SignupService } from '@/infra/resources/auth/services/signup.service';
import { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';

export async function authenticateUserE2ETest(
  app: INestApplication<Server>,
): Promise<{
  accessToken: string;
  refreshToken: string;
  userId: string;
}> {
  const signupService = app.get(SignupService);
  const signinService = app.get(SigninService);

  const user = await signupService.execute({
    name: 'testuser',
    email: 'testuser@example.com',
    password: 'testpassword',
  });

  const { access_token: accessToken, refresh_token: refreshToken } =
    await signinService.execute({
      email: 'testuser@example.com',
      password: 'testpassword',
    });

  return {
    accessToken,
    refreshToken,
    userId: user.id,
  };
}
