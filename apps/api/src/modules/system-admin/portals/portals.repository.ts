import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { File } from '@/modules/media/files/entities/file.entity';
import { applyPaginatedQueryBuilder } from '@/shared/pagination';

import { Portal, PortalDomain, PortalLoginMedia, PortalTranslation } from './entities';

@Injectable()
export class PortalsRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(File) private readonly files: Repository<File>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    @InjectRepository(Portal) private readonly portals: Repository<Portal>,
    @InjectRepository(PortalDomain) private readonly domains: Repository<PortalDomain>,
  ) {}

  list(request: PaginateRequest): Promise<[Portal[], number]> {
    return applyPaginatedQueryBuilder(
      this.portals.createQueryBuilder('portal').leftJoinAndSelect('portal.domains', 'domain'),
      request,
      {
        defaultSort: [{ direction: 'asc', field: 'internalName' }],
        fields: {
          internalName: 'portal.nome_interno',
          updatedAt: 'portal.atualizado_em',
        },
        tieBreaker: 'portal.id',
      },
    );
  }

  findById(id: number): Promise<Portal | null> {
    return this.portals.findOne({
      relations: {
        brandAssetFile: true,
        domains: true,
        faviconFile: true,
        headerIconFile: true,
        loginMedia: { file: true, posterFile: true },
        translations: { language: true },
      },
      where: { id },
    });
  }

  findGlobalFilesByIds(ids: number[]): Promise<File[]> {
    if (ids.length === 0) return Promise.resolve([]);

    return this.files.find({ where: { client: IsNull(), id: In(ids) } });
  }

  findLanguagesByCodes(languageCodes: string[]): Promise<Language[]> {
    return this.languages.find({ where: { languageCode: In(languageCodes) } });
  }

  listLanguages(request: PaginateRequest): Promise<[Language[], number]> {
    return applyPaginatedQueryBuilder(this.languages.createQueryBuilder('language'), request, {
      defaultSort: [{ direction: 'asc', field: 'name' }],
      fields: {
        id: 'language.id',
        languageCode: 'language.codigo_idioma',
        name: 'language.nome',
      },
      tieBreaker: 'language.id',
    });
  }

  findConflictingDomains(hosts: string[], portalId: number | null): Promise<PortalDomain[]> {
    return this.domains.find({
      where: {
        host: In(hosts),
        ...(portalId === null ? {} : { portal: { id: Not(portalId) } }),
      },
    });
  }

  async saveAggregate(
    portal: Portal,
    domains: PortalDomain[],
    translations: PortalTranslation[],
    loginMedia: PortalLoginMedia[],
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(Portal, portal);

      await manager.delete(PortalDomain, { portal: { id: saved.id } });
      await manager.delete(PortalTranslation, { portal: { id: saved.id } });
      await manager.delete(PortalLoginMedia, { portal: { id: saved.id } });

      await manager.save(
        PortalDomain,
        domains.map((domain) => ({ ...domain, portal: saved })),
      );
      await manager.save(
        PortalTranslation,
        translations.map((translation) => ({ ...translation, portal: saved })),
      );
      await manager.save(
        PortalLoginMedia,
        loginMedia.map((media) => ({ ...media, portal: saved })),
      );

      return saved.id;
    });
  }

  async delete(portals: Portal[]): Promise<number[]> {
    const ids = portals.map((portal) => portal.id);

    await this.portals.remove(portals);

    return ids;
  }

  findByIds(ids: number[]): Promise<Portal[]> {
    return this.portals.find({ where: { id: In(ids) } });
  }
}
