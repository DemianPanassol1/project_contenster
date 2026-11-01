import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { File } from '@/modules/core/media/files/entities/file.entity';
import { applyPaginatedQueryBuilder } from '@/shared/pagination';

const CLIENT_FIELDS = {
  corporateName: 'client.razao_social',
  document: 'client.documento',
  isActive: 'client.eh_ativo',
  tradeName: 'client.nome_fantasia',
};

@Injectable()
export class FilesRepository {
  constructor(
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(File) private readonly files: Repository<File>,
  ) {}

  list(clientId?: number): Promise<File[]> {
    const query = this.files
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.client', 'client')
      .orderBy('file.criado_em', 'DESC')
      .take(100);
    if (clientId !== undefined) {
      query.where('file.cliente_id = :clientId', { clientId });
    }

    return query.getMany();
  }

  listPaginated(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(
      this.files
        .createQueryBuilder('file')
        .leftJoinAndSelect('file.client', 'client')
        .leftJoinAndSelect('file.uploadedBy', 'uploadedBy'),
      request,
      {
        defaultSort: [{ field: 'createdAt', direction: 'desc' }],
        fields: {
          clientId: 'client.id',
          createdAt: 'file.criado_em',
          fileType: 'file.tipo_arquivo',
          mimeType: 'file.tipo_mime',
          originalName: 'file.nome_original',
          provider: 'file.provedor_storage',
          sizeInBytes: 'file.tamanho_bytes',
          uploadedByName: 'uploadedBy.nome',
        },
        tieBreaker: 'file.id',
      },
    );
  }

  listClientOptions(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(this.clients.createQueryBuilder('client'), request, {
      defaultSort: [{ field: 'tradeName', direction: 'asc' }],
      fields: CLIENT_FIELDS,
      tieBreaker: 'client.id',
    });
  }
}
