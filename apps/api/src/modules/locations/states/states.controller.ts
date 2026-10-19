import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveStateRequestDto } from './dto/req/save-state-request.js';
import { StatesService } from './states.service';

const { states } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('States')
@Controller('states')
export class StatesController {
  constructor(private readonly service: StatesService) {}

  @Post('list')
  @RequirePermission(states, ActionType.view)
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Get(':id')
  @RequirePermission(states, ActionType.view)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermission(states, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  save(@Body() request: SaveStateRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  @RequirePermission(states, ActionType.delete)
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
