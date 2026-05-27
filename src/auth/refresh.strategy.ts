import { EnvConfigService } from '@/env/env.service';
import { PrismaService } from '@/prisma/prisma.service';
import { compareHashValue } from '@/shared/hash';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload, tokenSchema } from './token-schema';

@Injectable()
export class RefreshJwtTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: EnvConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const publicKey = configService.get('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayload) {
    const result = tokenSchema.safeParse(payload);
    if (!result.success || payload.type !== 'refresh_token') {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    console.log('User found for refresh token:', user.id);
    console.log('User refresh token hash:', user.refreshToken);
    const rawToken = (req.body as { token: string }).token;
    console.log('Raw token from request:', rawToken);
    const tokenMatches = await compareHashValue(rawToken, user.refreshToken);
    console.log('Does the provided token match the stored hash?', tokenMatches);
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
