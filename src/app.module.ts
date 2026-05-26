import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SignupController } from './auth/controllers/signup.controller';
import { PrismaService } from './prisma/prisma.service';
import { envSchema } from './env';
import { z } from 'zod';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  controllers: [SignupController],
  providers: [PrismaService],
})
export class AppModule {}
