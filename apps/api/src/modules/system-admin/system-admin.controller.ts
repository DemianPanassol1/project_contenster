import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { PaginateRequestDto } from '@/shared/dtos';

import { SaveClientRequestDto } from '../identity/clients/dto/req/save-client.request.dto';

import { CreateSystemAdminClientRequestDto } from './dto/req/create-system-admin-client.request.dto';
import { ReplaceUserAccessLinksRequestDto } from './dto/req/replace-user-access-links.request.dto';
import { SetSystemAdminClientActiveRequestDto } from './dto/req/set-system-admin-client-active.request.dto';
import { SystemAdminService } from './system-admin.service';

@ApiTags('System administration')
@Controller('system-admin')
@RequireSuperuser()
export class SystemAdminController {
  constructor(private readonly service: SystemAdminService) {}

  @Post('clients/list')
  listClients(@Body() request: PaginateRequestDto) {
    return this.service.listClients(request);
  }

  @Post('clients')
  createClient(@Body() request: CreateSystemAdminClientRequestDto) {
    return this.service.createClient(request);
  }

  @Patch('clients/:id') updateClient(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SaveClientRequestDto,
  ) {
    return this.service.updateClient(id, body);
  }

  @Patch('clients/:id/active') setClientActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SetSystemAdminClientActiveRequestDto,
  ) {
    return this.service.setClientActive(id, body.isActive);
  }

  @Delete('clients/:id') deleteClient(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteClient(id);
  }

  @Post('request-logs/list') listRequestLogsPaginated(@Body() request: PaginateRequestDto) {
    return this.service.listRequestLogsPaginated(request);
  }

  @Post('request-logs/client-options')
  listRequestLogClientOptions(@Body() request: PaginateRequestDto) {
    return this.service.listRequestLogClientOptions(request);
  }

  @Get('request-logs/:id') getRequestLog(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRequestLog(id);
  }

  @Post('job-logs/list') listJobLogsPaginated(@Body() request: PaginateRequestDto) {
    return this.service.listJobLogsPaginated(request);
  }

  @Get('job-logs/:id') getJobLog(@Param('id', ParseIntPipe) id: number) {
    return this.service.getJobLog(id);
  }

  @Get('files') listFiles(@Query('clientId') clientId?: string) {
    return this.service.listFiles(clientId === undefined ? undefined : Number(clientId));
  }

  @Post('files/list') listFilesPaginated(@Body() request: PaginateRequestDto) {
    return this.service.listFilesPaginated(request);
  }

  @Post('users/:userId/access-links')
  replaceUserAccessLinks(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() request: ReplaceUserAccessLinksRequestDto,
  ) {
    return this.service.replaceUserAccessLinks(userId, request);
  }
}
