import { EnvConfigService } from '@/env/env.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SigninController } from './controllers/signin.controller';
import { SignupController } from './controllers/signup.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
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
          signOptions: { algorithm: 'RS256' },
        };
      },
    }),
  ],
  controllers: [SignupController, SigninController],
  providers: [JwtStrategy],
})
export class AuthModule {}
