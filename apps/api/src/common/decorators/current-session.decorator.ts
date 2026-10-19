import type { AuthenticatedSession } from '@contenster/shared';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { ApiHttpRequest } from '@/common/types/http-context.type';

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedSession => {
    const request = context.switchToHttp().getRequest<ApiHttpRequest>();

    return request.session!;
  },
);
