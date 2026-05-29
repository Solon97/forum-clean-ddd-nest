import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { AnswerController } from './answer.controller';
import { AnswerQuestionService } from './services/answer-question.service';
import { CommentOnAnswerService } from './services/comment-on-answer.service';
import { DeleteAnswerCommentService } from './services/delete-answer-comment.service';
import { DeleteAnswerService } from './services/delete-answer.service';
import { FetchAnswerCommentsService } from './services/fetch-answer-comments.service';
import { FetchQuestionAnswersService } from './services/fetch-question-answers.service';
import { SetBestAnswerService } from './services/set-best-answer.service';
import { UpdateAnswerService } from './services/update-answer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AnswerController],
  providers: [
    AnswerQuestionService,
    FetchQuestionAnswersService,
    UpdateAnswerService,
    DeleteAnswerService,
    CommentOnAnswerService,
    FetchAnswerCommentsService,
    DeleteAnswerCommentService,
    SetBestAnswerService,
  ],
})
export class AnswerModule {}
