import { UserModel } from '@/infra/database/prisma/generated/models';
import { ZodValidationPipe } from '@/infra/pipes/zod-validation-pipe';
import { JwtAuthGuard } from '@/infra/resources/auth/jwt-auth.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user-decorator';
import {
  CreateQuestionBody,
  createQuestionBodySchema,
  CreateQuestionService,
} from './services/create-question.service';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionController {
  constructor(private readonly createQuestionService: CreateQuestionService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createQuestionBodySchema))
    body: CreateQuestionBody,
    @CurrentUser() user: UserModel,
  ) {
    return this.createQuestionService.execute(body, user.id);
  }
}
