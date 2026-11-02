import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SaveAccessModelRequestDto } from './dto/req/save-access-model.request.dto';
import { SystemAdminApplyAccessModelRequestDto } from './dto/req/system-admin-apply-access-model.request.dto';
import { SystemAdminPreviewAccessModelRequestDto } from './dto/req/system-admin-preview-access-model.request.dto';
import { AccessModelsService } from './access-models.service';

@ApiTags('System administration')
@Controller('system-admin/access-models')
@RequireSuperuser()
export class SystemAdminAccessModelsController {
  constructor(private readonly service: AccessModelsService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  save(@Body() request: SaveAccessModelRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }

  @Post('preview')
  preview(@Body() request: SystemAdminPreviewAccessModelRequestDto) {
    return this.service.preview(request.modelId, request.clientId);
  }

  @Post('apply')
  apply(@Body() request: SystemAdminApplyAccessModelRequestDto) {
    return this.service.apply(
      request.modelId,
      request.clientId,
      request.fingerprint,
      request.selectedChangeIds,
    );
  }
}
