import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveActionRequestDto } from './dto/req/save-action-request.js';
import { ActionsService } from './actions.service';

const { actions } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Actions')
@Controller('actions')
export class ActionsController {
  constructor(private readonly service: ActionsService) {}

  @Post('list')
  @RequirePermission(actions, ActionType.view)
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Get(':id')
  @RequirePermission(actions, ActionType.view)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermission(actions, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  save(@Body() request: SaveActionRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  @RequirePermission(actions, ActionType.delete)
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
