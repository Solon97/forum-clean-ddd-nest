import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';
import { envSchema } from './env';
import { EnvConfigService } from './env.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: (env) => {
        const result = envSchema.safeParse(env);
        if (result.success) {
          return result.data;
        } else {
          throw new Error(
            `Environment validation error: ${z.prettifyError(result.error)} variable`,
          );
        }
      },
    }),
  ],
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
export class EnvConfigModule {}
