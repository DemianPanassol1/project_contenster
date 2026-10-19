import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { CurrentClientId } from '@/common/decorators/current-client-id.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveFunctionalityRequestDto } from './dto/req/save-functionality-request.js';
import { FunctionalityService } from './functionality.service';

const { functionalities } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Functionalities')
@Controller('functionalities')
export class FunctionalityController {
  constructor(private readonly service: FunctionalityService) {}

  @Post('list')
  @RequirePermission(functionalities, ActionType.view)
  list(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
    return this.service.list(clientId, request);
  }

  @Get(':id')
  @RequirePermission(functionalities, ActionType.view)
  getById(@CurrentClientId() clientId: number, @Param('id', ParseIntPipe) id: number) {
    return this.service.getById(clientId, id);
  }

  @Post()
  @RequirePermission(functionalities, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  save(@CurrentClientId() clientId: number, @Body() request: SaveFunctionalityRequestDto) {
    return this.service.save(clientId, request);
  }

  @Post('delete')
  @RequirePermission(functionalities, ActionType.delete)
  delete(@CurrentClientId() clientId: number, @Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(clientId, request);
  }
}
