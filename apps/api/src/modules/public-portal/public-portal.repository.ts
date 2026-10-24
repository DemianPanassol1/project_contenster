import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortalDomain } from '@/modules/system-admin/portals/entities/portal-domain.entity';

@Injectable()
export class PublicPortalRepository {
  constructor(@InjectRepository(PortalDomain) private readonly domains: Repository<PortalDomain>) {}

  async findByHost(host: string) {
    const domain = await this.domains.findOne({
      relations: {
        portal: {
          brandAssetFile: { client: true },
          faviconFile: { client: true },
          headerIconFile: { client: true },
          loginMedia: { file: { client: true }, posterFile: { client: true } },
          translations: { language: true },
        },
      },
      where: { host },
    });

    return domain?.portal ?? null;
  }
}
