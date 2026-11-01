import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { SaveClientRequestDto } from '@/modules/core/identity/clients/dto/req/save-client.request.dto';
import { PaginateRequestDto } from '@/shared/dtos';

import { CreateSystemAdminClientRequestDto } from './dto/req/create-system-admin-client.request.dto';
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

  @Post()
  create(@Body() request: CreateSystemAdminClientRequestDto) {
    return this.service.create(request);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: SaveClientRequestDto) {
    return this.service.update(id, body);
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
