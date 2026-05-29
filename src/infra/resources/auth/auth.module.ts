import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher';
import { DatabaseModule } from '@/infra/database/database.module';
import { EnvConfigService } from '@/infra/env/env.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { SigninService } from './services/signin.service';
import { SignupService } from './services/signup.service';
import { TokenService } from './services/tokens.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [EnvConfigService],
      global: true,
      useFactory(configService: EnvConfigService) {
        const privateKey = configService.get('JWT_PRIVATE_KEY');
        const publicKey = configService.get('JWT_PUBLIC_KEY');

        return {
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
          signOptions: { algorithm: 'RS256', expiresIn: '15m' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    SigninService,
    SignupService,
    TokenService,
    BcryptHasher,
  ],
})
export class AuthModule {}
