import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EnvConfigModule } from './env/env.module';
import { QuestionModule } from './question/question.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [EnvConfigModule, AuthModule, PrismaModule, QuestionModule],
})
export class AppModule {}
