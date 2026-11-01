import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveLanguageRequestDto } from './dto/req/save-language-request.js';
import { LanguagesService } from './languages.service';

const { languages } = CORE_FUNCTIONALITY_IDENTITIES;

@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly service: LanguagesService) {}

  @Post('list')
  @RequirePermission(languages, ActionType.view)
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Get(':id')
  @RequirePermission(languages, ActionType.view)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermission(languages, ActionType.create, {
    bodyIdField: 'id',
    updateActionType: ActionType.edit,
  })
  save(@Body() request: SaveLanguageRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  @RequirePermission(languages, ActionType.delete)
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }
}
