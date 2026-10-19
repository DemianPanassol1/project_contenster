import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { CurrentClientId } from '@/common/decorators/current-client-id.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveSystemModuleRequestDto } from './dto/req/save-system-module-request.js';
import { SystemModulesService } from './system-module.service';

const { modules } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Modules')
@Controller('modules')
export class SystemModulesController {
  constructor(private readonly service: SystemModulesService) {}

  @Post('list')
  @RequirePermission(modules, ActionType.view)
  list(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
    return this.service.list(clientId, request);
  }

  @Get(':id')
  @RequirePermission(modules, ActionType.view)
  getById(@CurrentClientId() clientId: number, @Param('id', ParseIntPipe) id: number) {
    return this.service.getById(clientId, id);
  }

  @Post()
  @RequirePermission(modules, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  save(@CurrentClientId() clientId: number, @Body() request: SaveSystemModuleRequestDto) {
    return this.service.save(clientId, request);
  }

  @Post('delete')
  @RequirePermission(modules, ActionType.delete)
  delete(@CurrentClientId() clientId: number, @Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(clientId, request);
  }
}
