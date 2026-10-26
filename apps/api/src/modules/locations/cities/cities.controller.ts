import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveCityRequestDto } from './dto/req/save-city-request.js';
import { CitiesService } from './cities.service';

const { cities } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly service: CitiesService) {}

  @Post('list')
  @RequirePermission(cities, ActionType.view)
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('states/options')
  @RequirePermission(cities, ActionType.view)
  listStateOptions(@Body() request: PaginateRequestDto) {
    return this.service.listStateOptions(request);
  }

  @Get(':id')
  @RequirePermission(cities, ActionType.view)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermission(cities, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  save(@Body() request: SaveCityRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  @RequirePermission(cities, ActionType.delete)
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
