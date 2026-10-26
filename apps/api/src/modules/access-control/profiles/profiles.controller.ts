import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { CurrentClientId } from '@/common/decorators/current-client-id.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveProfileRequestDto } from './dto/req/save-profile-request.js';
import { ProfilesService } from './profiles.service';

const { profiles } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly service: ProfilesService) {}

  @Post('list')
  @RequirePermission(profiles, ActionType.view)
  list(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
    return this.service.list(clientId, request);
  }

  @Post('functionalities/options')
  @RequirePermission(profiles, ActionType.view)
  listFunctionalityOptions(
    @CurrentClientId() clientId: number,
    @Body() request: PaginateRequestDto,
  ) {
    return this.service.listFunctionalityOptions(clientId, request);
  }

  @Post('actions/options')
  @RequirePermission(profiles, ActionType.view)
  listActionOptions(@Body() request: PaginateRequestDto) {
    return this.service.listActionOptions(request);
  }

  @Get(':id')
  @RequirePermission(profiles, ActionType.view)
  getById(@CurrentClientId() clientId: number, @Param('id', ParseIntPipe) id: number) {
    return this.service.getById(clientId, id);
  }

  @Post()
  @RequirePermission(profiles, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  save(@CurrentClientId() clientId: number, @Body() request: SaveProfileRequestDto) {
    return this.service.save(clientId, request);
  }

  @Post('delete')
  @RequirePermission(profiles, ActionType.delete)
  delete(@CurrentClientId() clientId: number, @Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(clientId, request);
  }
}
