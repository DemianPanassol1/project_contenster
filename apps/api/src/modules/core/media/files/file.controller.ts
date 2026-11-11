import type { AuthenticatedSession } from '@contenster/shared';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Authenticate } from '@/common/decorators/authenticate.decorator';
import { CurrentSession } from '@/common/decorators/current-session.decorator';
import { settings } from '@/infrastructure/config/app.config';

import { FileResponseDto } from './dto/res/file.response.dto';
import type { UploadedMultipartFile } from './types/uploaded-multipart-file.type';
import { FileService } from './file.service';

@ApiCookieAuth('session-token')
@ApiTags('Media files')
@Controller('media/files')
export class FileController {
  constructor(private readonly service: FileService) {}

  @Post('upload')
  @Authenticate()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      properties: {
        file: {
          format: 'binary',
          type: 'string',
        },
      },
      required: ['file'],
      type: 'object',
    },
  })
  @ApiCreatedResponse({ type: FileResponseDto })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: settings.MAX_UPLOAD_FILE_SIZE_BYTES } }),
  )
  upload(
    @UploadedFile() file: UploadedMultipartFile | undefined,
    @CurrentSession() session: AuthenticatedSession,
  ): Promise<FileResponseDto> {
    return this.service.upload(file, session);
  }

  @Get(':id')
  @Authenticate()
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: FileResponseDto })
  findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentSession() session: AuthenticatedSession,
  ): Promise<FileResponseDto> {
    return this.service.findById(id, session);
  }
}
