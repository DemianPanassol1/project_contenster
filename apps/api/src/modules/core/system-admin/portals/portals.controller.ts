import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiParam, ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SavePortalRequestDto } from './dto/req/save-portal.request.dto';
import { PortalsService } from './portals.service';

@ApiCookieAuth('session-token')
@ApiTags('System administration portals')
@Controller('system-admin/portals')
@RequireSuperuser()
export class PortalsController {
  constructor(private readonly service: PortalsService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('languages/options')
  listLanguageOptions(@Body() request: PaginateRequestDto) {
    return this.service.listLanguageOptions(request);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  save(@Body() request: SavePortalRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
