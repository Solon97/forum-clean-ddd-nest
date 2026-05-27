import { Module } from '@nestjs/common';
import { AuthModule } from './resources/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { EnvConfigModule } from './env/env.module';
import { QuestionModule } from './resources/question/question.module';

@Module({
  imports: [EnvConfigModule, AuthModule, DatabaseModule, QuestionModule],
})
export class AppModule {}
