import { UserModel } from '@/infra/database/prisma/generated/models';
import { ZodValidationPipe } from '@/infra/pipes/zod-validation-pipe';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user-decorator';
import {
  CreateQuestionBody,
  createQuestionBodySchema,
  CreateQuestionService,
} from './services/create-question.service';
import {
  FetchRecentQuestionsService,
  PageQueryParam,
  pageQueryParamSchema,
} from './services/fetch-recent-questions.service';

@Controller('questions')
export class QuestionController {
  constructor(
    private readonly createQuestionService: CreateQuestionService,
    private readonly fetchRecentQuestionsService: FetchRecentQuestionsService,
  ) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createQuestionBodySchema))
    body: CreateQuestionBody,
    @CurrentUser() user: UserModel,
  ) {
    return this.createQuestionService.execute(body, user.id);
  }

  @Get()
  fetchRecent(
    @Query('page', new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParam,
  ) {
    return this.fetchRecentQuestionsService.execute(page);
  }
}
