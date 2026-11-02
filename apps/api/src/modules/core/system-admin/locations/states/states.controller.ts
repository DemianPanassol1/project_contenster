import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { SaveStateRequestDto } from '@/modules/core/locations/states/dto/req/save-state-request';
import { StatesService } from '@/modules/core/locations/states/states.service';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

@ApiTags('System administration')
@Controller('system-admin/states')
@RequireSuperuser()
export class SystemAdminStatesController {
  constructor(private readonly service: StatesService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('countries/options')
  listCountryOptions(@Body() request: PaginateRequestDto) {
    return this.service.listCountryOptions(request);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  save(@Body() request: SaveStateRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
