import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { CurrentClientId } from '@/common/decorators/current-client-id.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveUserRequestDto } from './dto/req/save-user-request.js';
import { UsersService } from './users.service';

const { users } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post('list')
  @RequirePermission(users, ActionType.view)
  list(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
    return this.service.list(clientId, request);
  }

  @Get(':id')
  @RequirePermission(users, ActionType.view)
  getById(@CurrentClientId() clientId: number, @Param('id', ParseIntPipe) id: number) {
    return this.service.getById(clientId, id);
  }

  @Post()
  @RequirePermission(users, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  save(@CurrentClientId() clientId: number, @Body() request: SaveUserRequestDto) {
    return this.service.save(clientId, request);
  }

  @Post('delete')
  @RequirePermission(users, ActionType.delete)
  delete(@CurrentClientId() clientId: number, @Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(clientId, request);
  }
}
