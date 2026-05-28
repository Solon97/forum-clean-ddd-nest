import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';

export default async function globalSetup() {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('forum_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();

  execSync('pnpm prisma migrate deploy', {
    stdio: ['ignore'],
    env: process.env,
  });

  return async () => {
    await container.stop();
  };
}
