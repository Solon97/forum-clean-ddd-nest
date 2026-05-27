import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';
import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { RefreshTokenGuard } from './refresh-auth.guard';
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
import { TokenService } from './services/tokens.service';
import { RequestRefreshToken } from './tokens-decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user-decorator';
import { UserModel } from '@/prisma/generated/models';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupService: SignupService,
    private readonly signinService: SigninService,
    private readonly tokenService: TokenService,
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
  @UseGuards(RefreshTokenGuard)
  async refresh(@RequestRefreshToken() refreshToken: string) {
    return this.tokenService.refreshTokens(refreshToken);
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  async signout(@CurrentUser() user: UserModel) {
    return this.tokenService.revokeUserTokens(user.id);
  }
}
