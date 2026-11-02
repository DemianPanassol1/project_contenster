import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { CountriesService } from '@/modules/core/locations/countries/countries.service';
import { SaveCountryRequestDto } from '@/modules/core/locations/countries/dto/req/save-country-request';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

@ApiTags('System administration')
@Controller('system-admin/countries')
@RequireSuperuser()
export class SystemAdminCountriesController {
  constructor(private readonly service: CountriesService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  save(@Body() request: SaveCountryRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
