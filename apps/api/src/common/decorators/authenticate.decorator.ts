import { applyDecorators, UseGuards } from '@nestjs/common';

import { AuthenticateGuard } from '@/common/guards/authenticate.guard';

export const Authenticate = () => applyDecorators(UseGuards(AuthenticateGuard));
