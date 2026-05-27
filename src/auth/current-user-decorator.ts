import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserModel } from '@/prisma/generated/models';

export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user: UserModel }>();
    return request.user;
  },
);
