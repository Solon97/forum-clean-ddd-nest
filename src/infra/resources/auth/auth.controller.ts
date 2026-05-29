import { UserModel } from '@/infra/database/prisma/generated/models';
import { ZodValidationPipe } from '@/infra/pipes/zod-validation-pipe';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CurrentUser } from './current-user-decorator';
import { Public } from './public';
import { RefreshTokenGuard } from './refresh-auth.guard';
import { RefreshService } from './services/refresh.service';
import {
  SigninBody,
  signinBodySchema,
  SigninService,
} from './services/signin.service';
import { SignoutService } from './services/signout.service';
import {
  SignupBody,
  signupBodySchema,
  SignupService,
} from './services/signup.service';
import { RequestRefreshToken } from './tokens-decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupService: SignupService,
    private readonly signinService: SigninService,
    private readonly refreshService: RefreshService,
    private readonly signoutService: SignoutService,
  ) {}

  @Post('signup')
  @Public()
  @UsePipes(new ZodValidationPipe(signupBodySchema))
  async signup(@Body() body: SignupBody) {
    return this.signupService.execute(body);
  }

  @Post('signin')
  @Public()
  @UsePipes(new ZodValidationPipe(signinBodySchema))
  async signin(@Body() body: SigninBody) {
    return this.signinService.execute(body);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(@RequestRefreshToken() refreshToken: string) {
    return this.refreshService.execute(refreshToken);
  }

  @Post('signout')
  @HttpCode(200)
  async signout(@CurrentUser() user: UserModel) {
    await this.signoutService.execute(user.id);
  }
}
