import { Module } from '@nestjs/common';
import { SignupController } from './controllers/signup.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfigService } from '@/env/env.service';
import { SigninController } from './controllers/signin.controller';

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
    PrismaModule,
  ],
  controllers: [SignupController, SigninController],
})
export class AuthModule {}
