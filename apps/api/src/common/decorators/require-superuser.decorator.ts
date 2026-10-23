import { applyDecorators, UseGuards } from '@nestjs/common';

import { AuthenticateGuard } from '@/common/guards/authenticate.guard';
import { RequireSuperuserGuard } from '@/common/guards/require-superuser.guard';

export const RequireSuperuser = () =>
  applyDecorators(UseGuards(AuthenticateGuard, RequireSuperuserGuard));
