import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { CurrentClientId } from '@/common/decorators/current-client-id.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { PaginateRequestDto } from '@/shared/dtos';

import { SaveClientRequestDto } from './dto/req/save-client.request.dto';
import { ClientsService } from './clients.service';

const { clients } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get('current')
  @RequirePermission(clients, ActionType.view)
  getCurrent(@CurrentClientId() clientId: number) {
    return this.service.getById(clientId);
  }

  @Post('cities/options')
  @RequirePermission(clients, ActionType.view)
  listCityOptions(@Body() request: PaginateRequestDto) {
    return this.service.listCityOptions(request);
  }

  @Post('languages/options')
  @RequirePermission(clients, ActionType.view)
  listLanguageOptions(@Body() request: PaginateRequestDto) {
    return this.service.listLanguageOptions(request);
  }

  @Post()
  @RequirePermission(clients, ActionType.edit)
  save(@CurrentClientId() clientId: number, @Body() request: SaveClientRequestDto) {
    return this.service.save(clientId, request);
  }
}
