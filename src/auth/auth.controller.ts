import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';
import { UserModel } from '@/prisma/generated/models';
import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { CurrentUser } from './current-user-decorator';
import { RefreshJwtAuthGuard } from './refresh-auth.guard';
import { RefreshTokenService } from './services/refresh.service';
import {
  SigninBody,
  signinBodySchema,
  SigninService,
} from './services/signin.service';
import {
  SignupBody,
  signupBodySchema,
  SignupService,
} from './services/signup.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupService: SignupService,
    private readonly signinService: SigninService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signupBodySchema))
  async signup(@Body() body: SignupBody) {
    return this.signupService.execute(body);
  }

  @Post('signin')
  @UsePipes(new ZodValidationPipe(signinBodySchema))
  async signin(@Body() body: SigninBody) {
    return this.signinService.execute(body);
  }

  @Post('refresh')
  @UseGuards(RefreshJwtAuthGuard)
  async refresh(@CurrentUser() user: UserModel) {
    return this.refreshTokenService.execute(user.id);
  }
}
