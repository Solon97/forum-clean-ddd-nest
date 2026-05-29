import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { DatabaseModule } from '@/infra/database/database.module';
import { CreateQuestionService } from './services/create-question.service';
import { DeleteQuestionCommentService } from './services/delete-question-comment.service';
import { DeleteQuestionService } from './services/delete-question.service';
import { FetchQuestionCommentsService } from './services/fetch-question-comments.service';
import { FetchRecentQuestionsService } from './services/fetch-recent-questions.service';
import { GetQuestionBySlugService } from './services/get-question-by-slug.service';
import { CommentOnQuestionService } from './services/comment-on-question.service';
import { UpdateQuestionService } from './services/update-question.service';

@Module({
  imports: [DatabaseModule],
  controllers: [QuestionController],
  providers: [
    CreateQuestionService,
    FetchRecentQuestionsService,
    GetQuestionBySlugService,
    UpdateQuestionService,
    DeleteQuestionService,
    CommentOnQuestionService,
    FetchQuestionCommentsService,
    DeleteQuestionCommentService,
  ],
})
export class QuestionModule {}
