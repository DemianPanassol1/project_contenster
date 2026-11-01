import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';

@ApiTags('System administration')
@Controller('system-admin')
@RequireSuperuser()
export class SystemAdminController {}
