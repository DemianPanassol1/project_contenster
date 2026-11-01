import type { AppOption, PaginateRequest, SystemAdminFileListItem } from '@contenster/shared';
import { Injectable } from '@nestjs/common';

import { serializeApplicationDateTime } from '@/infrastructure/date-time';
import type { File } from '@/modules/core/media/files/entities/file.entity';
import { resolveFilePublicUrl } from '@/modules/core/media/files/helpers/file-public-url.helper';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';

import { SystemAdminFileListItemResponseDto } from './dto/res/system-admin-file-list-item.response.dto';
import { FilesRepository } from './files.repository';

@Injectable()
export class FilesService {
  constructor(private readonly repository: FilesRepository) {}

  async list(clientId?: number): Promise<SystemAdminFileListItemResponseDto[]> {
    const files = await this.repository.list(clientId);

    return toResponseDto(
      SystemAdminFileListItemResponseDto,
      files.map((file) => this.toItem(file)),
    );
  }

  async listPaginated(request: PaginateRequest) {
    const [files, total] = await this.repository.listPaginated(request);

    return {
      items: toResponseDto(
        SystemAdminFileListItemResponseDto,
        files.map((file) => this.toItem(file)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async listClientOptions(request: PaginateRequest): Promise<AppOption[]> {
    const [clients] = await this.repository.listClientOptions(request);

    return clients.map((client) => ({
      disabled: false,
      label: `${client.tradeName} (${client.document})`,
      metadata: null,
      value: client.id,
    }));
  }

  private toItem(file: File): SystemAdminFileListItem {
    return {
      clientId: file.client?.id ?? null,
      clientName: file.client?.tradeName ?? null,
      createdAt: serializeApplicationDateTime(file.createdAt),
      fileType: file.fileType,
      id: file.id,
      mimeType: file.mimeType,
      originalName: file.originalName,
      provider: file.storageProvider,
      sizeInBytes: file.sizeInBytes,
      uploadedByName: file.uploadedBy?.name ?? null,
      url: resolveFilePublicUrl(file),
    };
  }
}
