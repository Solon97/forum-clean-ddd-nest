import { Injectable } from '@nestjs/common';
import { GenerateTokensService } from './generate-tokens.service';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly generateTokensService: GenerateTokensService) {}

  async execute(userId: string) {
    return this.generateTokensService.execute(userId);
  }
}
