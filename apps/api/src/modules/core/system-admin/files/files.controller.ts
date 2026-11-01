import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { PaginateRequestDto } from '@/shared/dtos';

import { FilesService } from './files.service';

@ApiTags('System administration')
@Controller('system-admin/files')
@RequireSuperuser()
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Get()
  list(@Query('clientId') clientId?: string) {
    return this.service.list(clientId === undefined ? undefined : Number(clientId));
  }

  @Post('list')
  listPaginated(@Body() request: PaginateRequestDto) {
    return this.service.listPaginated(request);
  }

  @Post('client-options')
  options(@Body() request: PaginateRequestDto) {
    return this.service.listClientOptions(request);
  }
}
