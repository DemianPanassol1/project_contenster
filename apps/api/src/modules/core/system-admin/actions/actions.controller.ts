import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveActionRequestDto } from './dto/req/save-action-request';
import { ActionsService } from './actions.service';
@ApiTags('System administration')
@Controller('system-admin/actions')
@RequireSuperuser()
export class SystemAdminActionsController {
  constructor(private readonly service: ActionsService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  save(@Body() request: SaveActionRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
