import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { Controller, Post, UseGuards } from '@nestjs/common';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  @Post()
  handle() {
    return 'Hello world';
  }
}
