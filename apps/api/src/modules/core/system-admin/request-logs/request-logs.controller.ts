import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { PaginateRequestDto } from '@/shared/dtos';

import { RequestLogsService } from './request-logs.service';

@ApiTags('System administration')
@Controller('system-admin/request-logs')
@RequireSuperuser()
export class RequestLogsController {
  constructor(private readonly service: RequestLogsService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('client-options')
  options(@Body() request: PaginateRequestDto) {
    return this.service.listClientOptions(request);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }
}
