import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { DatabaseModule } from '@/infra/database/database.module';
import { CreateQuestionService } from './services/create-question.service';

@Module({
  imports: [DatabaseModule],
  controllers: [QuestionController],
  providers: [CreateQuestionService],
})
export class QuestionModule {}
