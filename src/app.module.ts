import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EnvConfigModule } from './env/env.module';

@Module({
  imports: [EnvConfigModule, AuthModule],
})
export class AppModule {}
