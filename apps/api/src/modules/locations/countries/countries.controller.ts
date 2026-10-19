import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveCountryRequestDto } from './dto/req/save-country-request.js';
import { CountriesService } from './countries.service';

const { countries } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly service: CountriesService) {}

  @Post('list')
  @RequirePermission(countries, ActionType.view)
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Get(':id')
  @RequirePermission(countries, ActionType.view)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermission(countries, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  save(@Body() request: SaveCountryRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  @RequirePermission(countries, ActionType.delete)
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
