import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { CurrentClientId } from '@/common/decorators/current-client-id.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { PaginateRequestDto } from '@/shared/dtos';

import { ClientLogsService } from './client-logs.service';

const { clientLogs } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Client logs')
@Controller('client-logs')
export class ClientLogsController {
  constructor(private readonly service: ClientLogsService) {}

  @Post('requests/list')
  @RequirePermission(clientLogs, ActionType.view)
  listRequestLogs(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
    return this.service.listRequestLogs(clientId, request);
  }

  @Get('requests/:id')
  @RequirePermission(clientLogs, ActionType.view)
  getRequestLog(@CurrentClientId() clientId: number, @Param('id', ParseIntPipe) id: number) {
    return this.service.getRequestLog(clientId, id);
  }

  @Post('routines/list')
  @RequirePermission(clientLogs, ActionType.view)
  listRoutineLogs(@Body() request: PaginateRequestDto) {
    return this.service.listRoutineLogs(request);
  }

  @Get('routines/:id')
  @RequirePermission(clientLogs, ActionType.view)
  getRoutineLog(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRoutineLog(id);
  }
}
