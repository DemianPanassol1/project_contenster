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

import { SystemAdminService } from './system-admin.service';

@ApiTags('System administration')
@Controller('system-admin')
@RequireSuperuser()
export class SystemAdminController {
  constructor(private readonly service: SystemAdminService) {}

  @Get('clients') listClients() {
    return this.service.listClients();
  }

  @Post('clients')
  createClient(@Body() request: Parameters<SystemAdminService['createClient']>[0]) {
    return this.service.createClient(request);
  }

  @Patch('clients/:id') updateClient(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Parameters<SystemAdminService['updateClient']>[1],
  ) {
    return this.service.updateClient(id, body);
  }

  @Patch('clients/:id/active') setClientActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    return this.service.setClientActive(id, body.isActive);
  }

  @Delete('clients/:id') deleteClient(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteClient(id);
  }

  @Get('request-logs') listRequestLogs(@Query('clientId') clientId?: string) {
    return this.service.listRequestLogs(clientId === undefined ? undefined : Number(clientId));
  }

  @Post('request-logs/list') listRequestLogsPaginated(@Body() request: PaginateRequestDto) {
    return this.service.listRequestLogsPaginated(request);
  }

  @Get('job-logs') listJobLogs() {
    return this.service.listJobLogs();
  }

  @Post('job-logs/list') listJobLogsPaginated(@Body() request: PaginateRequestDto) {
    return this.service.listJobLogsPaginated(request);
  }

  @Get('files') listFiles(@Query('clientId') clientId?: string) {
    return this.service.listFiles(clientId === undefined ? undefined : Number(clientId));
  }

  @Post('files/list') listFilesPaginated(@Body() request: PaginateRequestDto) {
    return this.service.listFilesPaginated(request);
  }

  @Post('users/:userId/clients/:clientId/profiles/:profileId') assignUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.service.assignUserProfile(userId, clientId, profileId);
  }
}
