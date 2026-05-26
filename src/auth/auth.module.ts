import { Module } from '@nestjs/common';
import { SignupController } from './controllers/signup.controller';

@Module({
  controllers: [SignupController],
})
export class AuthModule {}
