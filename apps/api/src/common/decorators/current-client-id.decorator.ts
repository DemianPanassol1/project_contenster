import type { ClientSessionContext } from '@contenster/shared';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { ApiHttpRequest } from '@/common/types/http-context.type';

export const CurrentClientId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<ApiHttpRequest>();

    return (request.session!.context as ClientSessionContext).client.id;
  },
);
