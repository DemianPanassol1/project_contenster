import { Controller, Get, Header, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SkipRequestLog } from '@/common/decorators/skip-request-log.decorator';

import { PublicPortalService } from './public-portal.service';

@ApiTags('Public portal')
@Controller('public/portal')
@SkipRequestLog()
export class PublicPortalController {
  constructor(private readonly service: PublicPortalService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  resolve(
    @Headers('x-forwarded-host') forwardedHost: string | undefined,
    @Headers('host') host: string | undefined,
  ) {
    return this.service.resolve(forwardedHost?.split(',')[0] ?? host);
  }
}
