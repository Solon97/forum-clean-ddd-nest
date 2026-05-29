import { UserModel } from '@/infra/database/prisma/generated/models';
import { ZodValidationPipe } from '@/infra/pipes/zod-validation-pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user-decorator';
import {
  AnswerQuestionBody,
  AnswerQuestionQuestionIdParam,
  answerQuestionBodySchema,
  answerQuestionQuestionIdParamSchema,
  AnswerQuestionService,
} from './services/answer-question.service';
import {
  CommentOnAnswerBody,
  commentOnAnswerBodySchema,
  CommentOnAnswerService,
} from './services/comment-on-answer.service';
import { DeleteAnswerCommentService } from './services/delete-answer-comment.service';
import { DeleteAnswerService } from './services/delete-answer.service';
import {
  FetchAnswerCommentsPageQueryParam,
  fetchAnswerCommentsPageQueryParamSchema,
  FetchAnswerCommentsService,
} from './services/fetch-answer-comments.service';
import {
  FetchQuestionAnswersPageQueryParam,
  fetchQuestionAnswersPageQueryParamSchema,
  FetchQuestionAnswersService,
} from './services/fetch-question-answers.service';
import { SetBestAnswerService } from './services/set-best-answer.service';
import {
  AnswerCommentIdParam,
  answerCommentIdParamSchema,
} from './services/delete-answer-comment.service';
import {
  AnswerIdParam,
  answerIdParamSchema,
  UpdateAnswerBody,
  updateAnswerBodySchema,
  UpdateAnswerService,
} from './services/update-answer.service';

@Controller()
export class AnswerController {
  constructor(
    private readonly answerQuestionService: AnswerQuestionService,
    private readonly fetchQuestionAnswersService: FetchQuestionAnswersService,
    private readonly updateAnswerService: UpdateAnswerService,
    private readonly deleteAnswerService: DeleteAnswerService,
    private readonly commentOnAnswerService: CommentOnAnswerService,
    private readonly fetchAnswerCommentsService: FetchAnswerCommentsService,
    private readonly deleteAnswerCommentService: DeleteAnswerCommentService,
    private readonly setBestAnswerService: SetBestAnswerService,
  ) {}

  @Post('questions/:questionId/answers')
  create(
    @Body(new ZodValidationPipe(answerQuestionBodySchema))
    body: AnswerQuestionBody,
    @Param(
      'questionId',
      new ZodValidationPipe(answerQuestionQuestionIdParamSchema),
    )
    questionId: AnswerQuestionQuestionIdParam,
    @CurrentUser() user: UserModel,
  ) {
    return this.answerQuestionService.execute(body, user.id, questionId);
  }

  @Get('questions/:questionId/answers')
  fetchByQuestion(
    @Param(
      'questionId',
      new ZodValidationPipe(answerQuestionQuestionIdParamSchema),
    )
    questionId: AnswerQuestionQuestionIdParam,
    @Query(
      'page',
      new ZodValidationPipe(fetchQuestionAnswersPageQueryParamSchema),
    )
    page: FetchQuestionAnswersPageQueryParam,
  ) {
    return this.fetchQuestionAnswersService.execute(questionId, page);
  }

  @Put('answers/:answerId')
  update(
    @Body(new ZodValidationPipe(updateAnswerBodySchema))
    body: UpdateAnswerBody,
    @Param('answerId', new ZodValidationPipe(answerIdParamSchema))
    answerId: AnswerIdParam,
    @CurrentUser() user: UserModel,
  ) {
    return this.updateAnswerService.execute(body, user.id, answerId);
  }

  @Delete('answers/:answerId')
  remove(
    @Param('answerId', new ZodValidationPipe(answerIdParamSchema))
    answerId: AnswerIdParam,
    @CurrentUser() user: UserModel,
  ) {
    return this.deleteAnswerService.execute(answerId, user.id);
  }

  @Post('answers/:answerId/comments')
  comment(
    @Body(new ZodValidationPipe(commentOnAnswerBodySchema))
    body: CommentOnAnswerBody,
    @Param('answerId', new ZodValidationPipe(answerIdParamSchema))
    answerId: AnswerIdParam,
    @CurrentUser() user: UserModel,
  ) {
    return this.commentOnAnswerService.execute(body, user.id, answerId);
  }

  @Get('answers/:answerId/comments')
  fetchComments(
    @Param('answerId', new ZodValidationPipe(answerIdParamSchema))
    answerId: AnswerIdParam,
    @Query(
      'page',
      new ZodValidationPipe(fetchAnswerCommentsPageQueryParamSchema),
    )
    page: FetchAnswerCommentsPageQueryParam,
  ) {
    return this.fetchAnswerCommentsService.execute(answerId, page);
  }

  @Delete('answers/comments/:commentId')
  removeComment(
    @Param('commentId', new ZodValidationPipe(answerCommentIdParamSchema))
    commentId: AnswerCommentIdParam,
    @CurrentUser() user: UserModel,
  ) {
    return this.deleteAnswerCommentService.execute(commentId, user.id);
  }

  @Patch('answers/:answerId/best')
  setBest(
    @Param('answerId', new ZodValidationPipe(answerIdParamSchema))
    answerId: AnswerIdParam,
    @CurrentUser() user: UserModel,
  ) {
    return this.setBestAnswerService.execute(answerId, user.id);
  }
}
