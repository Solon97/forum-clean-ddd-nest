import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer } from 'testcontainers';
import { execSync } from 'node:child_process';

export default async function globalSetup() {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('forum_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const localStackContainer = await new GenericContainer(
    'localstack/localstack:4.6.0',
  )
    .withEnvironment({
      SERVICES: 's3',
      AWS_DEFAULT_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'test',
      AWS_SECRET_ACCESS_KEY: 'test',
    })
    .withExposedPorts(4566)
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();
  process.env.S3_REGION = 'us-east-1';
  process.env.S3_BUCKET = 'forum-attachments-test';
  process.env.S3_ACCESS_KEY = 'test';
  process.env.S3_SECRET_KEY = 'test';
  process.env.S3_ENDPOINT = `http://${localStackContainer.getHost()}:${localStackContainer.getMappedPort(4566)}`;

  execSync('pnpm prisma migrate deploy', {
    stdio: ['ignore'],
    env: process.env,
  });

  return async () => {
    await localStackContainer.stop();
    await container.stop();
  };
}
