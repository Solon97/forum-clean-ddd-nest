import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvConfigService } from './env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<EnvConfigService>(EnvConfigService);
  const port = configService.get('PORT');

  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
