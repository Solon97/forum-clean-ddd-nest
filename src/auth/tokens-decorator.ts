import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestRefreshToken = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      user: string;
    }>();
    return request.user;
  },
);
