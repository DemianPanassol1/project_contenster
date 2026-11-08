import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { settings } from '@/infrastructure/config/app.config';
import type { UploadedMultipartFile } from '@/modules/core/media/files/types/uploaded-multipart-file.type';
import { PaginateRequestDto } from '@/shared/dtos';

import { SaveSystemAdminClientRequestDto } from './dto/req/save-system-admin-client.request.dto';
import { SetSystemAdminClientActiveRequestDto } from './dto/req/set-system-admin-client-active.request.dto';
import { ClientsService } from './clients.service';

@ApiTags('System administration')
@Controller('system-admin/clients')
@RequireSuperuser()
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('cities/options')
  listCityOptions(@Body() request: PaginateRequestDto) {
    return this.service.listCityOptions(request);
  }

  @Post('languages/options')
  listLanguageOptions(@Body() request: PaginateRequestDto) {
    return this.service.listLanguageOptions(request);
  }

  @Get('image/:id')
  @ApiParam({ name: 'id', type: Number })
  getImageById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getImageById(id);
  }

  @Post('image/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      properties: { file: { format: 'binary', type: 'string' } },
      required: ['file'],
      type: 'object',
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: settings.MAX_UPLOAD_FILE_SIZE_BYTES } }),
  )
  uploadImage(
    @UploadedFile() file: UploadedMultipartFile | undefined,
    @CurrentUserId() userId: number,
  ) {
    return this.service.uploadImage(file, userId);
  }

  @Post()
  create(@Body() request: SaveSystemAdminClientRequestDto) {
    return this.service.create(request);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() request: SaveSystemAdminClientRequestDto) {
    return this.service.update(id, request);
  }

  @Patch(':id/active') setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SetSystemAdminClientActiveRequestDto,
  ) {
    return this.service.setActive(id, body.isActive);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
