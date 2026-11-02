import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { CitiesService } from '@/modules/core/locations/cities/cities.service';
import { SaveCityRequestDto } from '@/modules/core/locations/cities/dto/req/save-city-request';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

@ApiTags('System administration')
@Controller('system-admin/cities')
@RequireSuperuser()
export class SystemAdminCitiesController {
  constructor(private readonly service: CitiesService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('states/options')
  listStateOptions(@Body() request: PaginateRequestDto) {
    return this.service.listStateOptions(request);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  save(@Body() request: SaveCityRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
