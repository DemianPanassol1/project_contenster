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
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { RequireSuperuser } from '@/common/decorators/require-superuser.decorator';
import { settings } from '@/infrastructure/config/app.config';
import type { UploadedMultipartFile } from '@/modules/core/media/files/types/uploaded-multipart-file.type';
import { PaginateRequestDto } from '@/shared/dtos';

import { CreateAccessLinkUserRequestDto } from './dto/req/create-access-link-user.request.dto';
import { ReplaceUserAccessLinksRequestDto } from './dto/req/replace-user-access-links.request.dto';
import { AccessLinksService } from './access-links.service';

@ApiTags('System administration')
@Controller('system-admin')
@RequireSuperuser()
export class AccessLinksController {
  constructor(private readonly service: AccessLinksService) {}

  @Post('access-links/users/options')
  options(@Body() request: PaginateRequestDto) {
    return this.service.listUserOptions(request);
  }

  @Post('access-links/users')
  createUser(@Body() request: CreateAccessLinkUserRequestDto) {
    return this.service.createUser(request);
  }

  @Get('access-links/users/image/:id')
  @ApiParam({ name: 'id', type: Number })
  getUserImage(@Param('id', ParseIntPipe) id: number) {
    return this.service.getUserImage(id);
  }

  @Post('access-links/users/image/upload')
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
  uploadUserImage(
    @UploadedFile() file: UploadedMultipartFile | undefined,
    @CurrentUserId() userId: number,
  ) {
    return this.service.uploadUserImage(file, userId);
  }

  @Get('access-links/users/:userId')
  get(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getUserDetails(userId);
  }

  @Post('users/:userId/access-links') replace(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() request: ReplaceUserAccessLinksRequestDto,
  ) {
    return this.service.replace(userId, request);
  }
}
