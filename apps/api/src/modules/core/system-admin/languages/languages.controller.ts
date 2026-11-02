import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveLanguageRequestDto } from './dto/req/save-language-request';
import { LanguagesService } from './languages.service';
@ApiTags('System administration')
@Controller('system-admin/languages')
@RequireSuperuser()
export class SystemAdminLanguagesController {
  constructor(private readonly service: LanguagesService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('options')
  listOptions(@Body() request: PaginateRequestDto) {
    return this.service.listOptions(request);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  save(@Body() request: SaveLanguageRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
