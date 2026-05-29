import { UserModel } from '@/infra/database/prisma/generated/models';
import { ZodValidationPipe } from '@/infra/pipes/zod-validation-pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user-decorator';
import {
  CreateQuestionBody,
  createQuestionBodySchema,
  CreateQuestionService,
} from './services/create-question.service';
import { DeleteQuestionService } from './services/delete-question.service';
import {
  FetchRecentQuestionsService,
  PageQueryParam,
  pageQueryParamSchema,
} from './services/fetch-recent-questions.service';
import {
  GetQuestionBySlugService,
  QuestionSlugParam,
  questionSlugParamSchema,
} from './services/get-question-by-slug.service';
import {
  QuestionIdParam,
  UpdateQuestionBody,
  UpdateQuestionService,
  questionIdParamSchema,
  updateQuestionBodySchema,
} from './services/update-question.service';

@Controller('questions')
export class QuestionController {
  constructor(
    private readonly createQuestionService: CreateQuestionService,
    private readonly fetchRecentQuestionsService: FetchRecentQuestionsService,
    private readonly getQuestionBySlugService: GetQuestionBySlugService,
    private readonly updateQuestionService: UpdateQuestionService,
    private readonly deleteQuestionService: DeleteQuestionService,
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

  @Get(':slug')
  getBySlug(
    @Param('slug', new ZodValidationPipe(questionSlugParamSchema))
    slug: QuestionSlugParam,
  ) {
    return this.getQuestionBySlugService.execute(slug);
  }

  @Put(':id')
  update(
    @Body(new ZodValidationPipe(updateQuestionBodySchema))
    body: UpdateQuestionBody,
    @Param('id', new ZodValidationPipe(questionIdParamSchema))
    questionId: QuestionIdParam,
    @CurrentUser() user: UserModel,
  ) {
    return this.updateQuestionService.execute(body, user.id, questionId);
  }

  @Delete(':id')
  remove(
    @Param('id', new ZodValidationPipe(questionIdParamSchema))
    questionId: QuestionIdParam,
    @CurrentUser() user: UserModel,
  ) {
    return this.deleteQuestionService.execute(questionId, user.id);
  }
}
