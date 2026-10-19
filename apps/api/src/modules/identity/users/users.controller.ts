import { Body, Controller, Get, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  ActionType,
  type AuthenticatedSession,
  CORE_FUNCTIONALITY_IDENTITIES,
} from '@contenster/shared';
import { Authenticate } from '@/common/decorators/authenticate.decorator';
import { CurrentClientId } from '@/common/decorators/current-client-id.decorator';
import { CurrentSession } from '@/common/decorators/current-session.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { SessionAuthenticationService } from '@/modules/identity/authentication/session/session-authentication.service';
import { type CookieResponse } from '@/modules/identity/authentication/types/cookie-response.type';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { ChangeCurrentUserPasswordRequestDto } from './dto/req/change-current-user-password-request.dto';
import { SaveUserRequestDto } from './dto/req/save-user-request.js';
import { ChangeCurrentUserPasswordResponseDto } from './dto/res/change-current-user-password-response.dto';
import { UsersService } from './users.service';

const { users } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly service: UsersService,
    private readonly sessionAuthenticationService: SessionAuthenticationService,
  ) {}

  @Post('list')
  @RequirePermission(users, ActionType.view)
  list(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
    return this.service.list(clientId, request);
  }

  @Post('me/password')
  @Authenticate()
  async changeCurrentUserPassword(
    @CurrentSession() session: AuthenticatedSession,
    @Body() request: ChangeCurrentUserPasswordRequestDto,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<ChangeCurrentUserPasswordResponseDto> {
    const result = await this.service.changeCurrentUserPassword(session.user.id, request);

    response.clearCookie(
      this.sessionAuthenticationService.cookieName,
      this.sessionAuthenticationService.clearCookieOptions(),
    );

    return result;
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
