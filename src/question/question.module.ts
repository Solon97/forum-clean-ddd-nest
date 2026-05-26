import { Module } from '@nestjs/common';
import { CreateQuestionController } from './controllers/create-question.controller';

@Module({
  controllers: [CreateQuestionController],
})
export class QuestionModule {}
