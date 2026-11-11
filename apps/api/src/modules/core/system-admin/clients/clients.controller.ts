import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { PaginateRequestDto } from '@/shared/dtos';

import { SaveSystemAdminClientRequestDto } from './dto/req/save-system-admin-client.request.dto';
import { SetSystemAdminClientActiveRequestDto } from './dto/req/set-system-admin-client-active.request.dto';
import { ClientsService } from './clients.service';

@ApiTags('System administration')
@Controller('system-admin/clients')
@RequireSuperuser()
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('cities/options')
  listCityOptions(@Body() request: PaginateRequestDto) {
    return this.service.listCityOptions(request);
  }

  @Post('languages/options')
  listLanguageOptions(@Body() request: PaginateRequestDto) {
    return this.service.listLanguageOptions(request);
  }

  @Post()
  create(@Body() request: SaveSystemAdminClientRequestDto) {
    return this.service.create(request);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() request: SaveSystemAdminClientRequestDto) {
    return this.service.update(id, request);
  }

  @Patch(':id/active') setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SetSystemAdminClientActiveRequestDto,
  ) {
    return this.service.setActive(id, body.isActive);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
