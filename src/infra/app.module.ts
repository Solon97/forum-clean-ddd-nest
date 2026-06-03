import { Module } from '@nestjs/common';
import { AuthModule } from './resources/auth/auth.module';
import { AnswerModule } from './resources/answer/answer.module';
import { DatabaseModule } from './database/database.module';
import { EnvConfigModule } from './env/env.module';
import { QuestionModule } from './resources/question/question.module';
import { AttachmentModule } from './resources/attachment/attachment.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    EnvConfigModule,
    AuthModule,
    DatabaseModule,
    QuestionModule,
    AnswerModule,
    AttachmentModule,
    NotificationModule,
  ],
})
export class AppModule {}
