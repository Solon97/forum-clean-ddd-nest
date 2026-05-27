import { EnvConfigService } from '@/infra/env/env.service';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import z from 'zod';

export const tokenSchema = z.object({
  sub: z.string(),
});

export type TokenPayload = z.infer<typeof tokenSchema>;
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: EnvConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const publicKey = configService.get('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: TokenPayload) {
    const result = tokenSchema.safeParse(payload);
    if (!result.success) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
