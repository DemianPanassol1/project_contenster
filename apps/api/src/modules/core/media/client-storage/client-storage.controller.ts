import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { CurrentClientId } from '@/common/decorators/current-client-id.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveStorageConfigurationRequestDto } from './dto/req/save-storage-configuration.request.dto';
import { SaveStorageFileTypeRuleRequestDto } from './dto/req/save-storage-file-type-rule.request.dto';
import { ClientStorageService } from './client-storage.service';

const { clientStorage } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Client storage')
@Controller('client-storage')
export class ClientStorageController {
  constructor(private readonly service: ClientStorageService) {}

  @Post('configurations/list')
  @RequirePermission(clientStorage, ActionType.view)
  listConfigurations(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
    return this.service.listConfigurations(clientId, request);
  }

  @Post('rules/configurations/options')
  @RequirePermission(clientStorage, ActionType.view)
  listConfigurationOptions(
    @CurrentClientId() clientId: number,
    @Body() request: PaginateRequestDto,
  ) {
    return this.service.listConfigurationOptions(clientId, request);
  }

  @Get('configurations/:id')
  @RequirePermission(clientStorage, ActionType.view)
  getConfiguration(@CurrentClientId() clientId: number, @Param('id', ParseIntPipe) id: number) {
    return this.service.getConfiguration(clientId, id);
  }

  @Post('configurations')
  @RequirePermission(clientStorage, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  saveConfiguration(
    @CurrentClientId() clientId: number,
    @Body() request: SaveStorageConfigurationRequestDto,
  ) {
    return this.service.saveConfiguration(clientId, request);
  }

  @Post('configurations/test')
  @RequirePermission(clientStorage, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  testConfiguration(
    @CurrentClientId() clientId: number,
    @Body() request: SaveStorageConfigurationRequestDto,
  ) {
    return this.service.testConfiguration(clientId, request);
  }

  @Post('configurations/delete')
  @RequirePermission(clientStorage, ActionType.delete)
  deleteConfigurations(
    @CurrentClientId() clientId: number,
    @Body() request: DeleteRecordsRequestDto,
  ) {
    return this.service.deleteConfigurations(clientId, request);
  }

  @Post('rules/list')
  @RequirePermission(clientStorage, ActionType.view)
  listRules(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
    return this.service.listRules(clientId, request);
  }

  @Post('rules')
  @RequirePermission(clientStorage, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  saveRule(
    @CurrentClientId() clientId: number,
    @Body() request: SaveStorageFileTypeRuleRequestDto,
  ) {
    return this.service.saveRule(clientId, request);
  }

  @Post('rules/delete')
  @RequirePermission(clientStorage, ActionType.delete)
  deleteRules(@CurrentClientId() clientId: number, @Body() request: DeleteRecordsRequestDto) {
    return this.service.deleteRules(clientId, request);
  }

  @Post('files/list')
  @RequirePermission(clientStorage, ActionType.view)
  listFiles(@CurrentClientId() clientId: number, @Body() request: PaginateRequestDto) {
    return this.service.listFiles(clientId, request);
  }
}
