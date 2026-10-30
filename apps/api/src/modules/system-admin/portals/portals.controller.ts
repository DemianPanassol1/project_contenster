import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { settings } from '@/infrastructure/config/app.config';
import type { UploadedMultipartFile } from '@/modules/media/files/types/uploaded-multipart-file.type';
import { DeleteRecordsRequestDto, PaginateRequestDto } from '@/shared/dtos';

import { SavePortalRequestDto } from './dto/req/save-portal.request.dto';
import { PortalsService } from './portals.service';

@ApiCookieAuth('session-token')
@ApiTags('System administration portals')
@Controller('system-admin/portals')
@RequireSuperuser()
export class PortalsController {
  constructor(private readonly service: PortalsService) {}

  @Post('list')
  list(@Body() request: PaginateRequestDto) {
    return this.service.list(request);
  }

  @Post('languages/options')
  listLanguageOptions(@Body() request: PaginateRequestDto) {
    return this.service.listLanguageOptions(request);
  }

  @Get('media/:id')
  @ApiParam({ name: 'id', type: Number })
  getMediaById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getMediaById(id);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  save(@Body() request: SavePortalRequestDto) {
    return this.service.save(request);
  }

  @Post('delete')
  delete(@Body() request: DeleteRecordsRequestDto) {
    return this.service.delete(request);
  }

  @Post('media/upload')
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
  uploadMedia(
    @UploadedFile() file: UploadedMultipartFile | undefined,
    @CurrentUserId() userId: number,
  ) {
    return this.service.uploadMedia(file, userId);
  }
}
