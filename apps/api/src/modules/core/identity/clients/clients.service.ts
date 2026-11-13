import type { AppOption } from '@contenster/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DataSource, type EntityManager } from 'typeorm';

import type { I18nTranslations } from '@/i18n/translations';
import { SessionSynchronizationService } from '@/modules/core/identity/authentication/session/session-synchronization.service';
import { CitiesService } from '@/modules/core/locations/cities/cities.service';
import { LanguagesService } from '@/modules/core/system-admin/languages/languages.service';
import type { PaginateRequestDto } from '@/shared/dtos';
import { getCurrentLocale } from '@/shared/i18n';
import { toResponseDto } from '@/shared/responses';
import { resolveTranslation } from '@/shared/translations';

import type { SaveClientRequestDto } from './dto/req/save-client.request.dto';
import { GetClientByIdResponseDto } from './dto/res/get-client-by-id.response.dto';
import type { Client } from './entities/client.entity';
import type { SaveClientInTransactionInput } from './types/save-client-in-transaction.input';
import { ClientsRepository } from './clients.repository';

const CLIENT_SLUG_MAX_LENGTH = 75;

@Injectable()
export class ClientsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly repository: ClientsRepository,
    private readonly citiesService: CitiesService,
    private readonly languagesService: LanguagesService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async getById(id: number): Promise<GetClientByIdResponseDto> {
    return toResponseDto(
      GetClientByIdResponseDto,
      this.toResponse(await this.getEntityByIdOrFail(id)),
    );
  }

  async generateUniqueSlug(
    manager: EntityManager,
    tradeName: string,
    document: string,
  ): Promise<string> {
    const base = this.createSlugBase(tradeName, document);

    // The lock covers overlapping bases and the sequence allocated for each one.
    await this.repository.acquireSlugAllocationLock(manager);

    let sequence = 1;

    while (true) {
      const candidate = this.withSlugSequence(base, sequence);
      const existing = await this.repository.findBySlug(candidate, manager);

      if (!existing) {
        return candidate;
      }

      sequence += 1;
    }
  }

  async listCityOptions(request: PaginateRequestDto): Promise<AppOption[]> {
    const locale = getCurrentLocale();
    const [cities] = await this.citiesService.listEntities(request, locale);

    return cities.map((city) => ({
      disabled: !city.isActive,
      label: this.toCityOptionLabel(city, locale),
      metadata: null,
      value: city.id,
    }));
  }

  async listLanguageOptions(request: PaginateRequestDto): Promise<AppOption[]> {
    const [languages] = await this.languagesService.listEntities(request);

    return languages.map((language) => ({
      disabled: false,
      label: language.name,
      metadata: { locale: language.languageCode },
      value: language.id,
    }));
  }

  findAvailableLanguagesByIds(clientId: number, ids: number[]) {
    return this.repository.findAvailableLanguagesByIds(clientId, ids);
  }

  findLanguagesByIds(ids: number[]) {
    return this.repository.findLanguages(ids);
  }

  listAvailableLanguageEntities(clientId: number, request: PaginateRequestDto) {
    return this.repository.listAvailableLanguages(clientId, request);
  }

  async save(clientId: number, request: SaveClientRequestDto): Promise<GetClientByIdResponseDto> {
    const client = await this.getEntityByIdOrFail(clientId);

    if (request.id !== client.id) {
      throw new BadRequestException(this.i18n.t('errors.clients.client_not_found'));
    }

    if (request.isActive !== client.isActive) {
      throw new ForbiddenException(this.i18n.t('errors.clients.status_change_not_allowed'));
    }

    await this.dataSource.transaction((manager) =>
      this.saveInTransaction({ ...request, id: clientId }, manager),
    );

    await this.synchronizeMutation();

    return this.getById(clientId);
  }

  async saveInTransaction(
    request: SaveClientInTransactionInput,
    manager: EntityManager,
  ): Promise<Client> {
    const existing =
      request.id === null ? null : await this.repository.findById(request.id, manager);

    if (request.id !== null && !existing) {
      throw new NotFoundException(this.i18n.t('errors.clients.client_not_found'));
    }

    if (request.languageLinks.length === 0) {
      throw new BadRequestException(this.i18n.t('errors.clients.language_required'));
    }

    const city =
      request.cityId === null ? null : await this.repository.findCity(request.cityId, manager);

    if (request.cityId !== null && !city) {
      throw new BadRequestException(this.i18n.t('errors.clients.city_not_found'));
    }

    const languageIds = request.languageLinks.map((link) => link.languageId);

    if (new Set(languageIds).size !== languageIds.length) {
      throw new BadRequestException(this.i18n.t('errors.clients.language_duplicate'));
    }

    const languages = await this.repository.findLanguages(languageIds, manager);

    if (languages.length !== languageIds.length) {
      throw new BadRequestException(this.i18n.t('errors.clients.language_not_found'));
    }

    const slug =
      request.slug ??
      existing?.slug ??
      (await this.generateUniqueSlug(manager, request.tradeName, request.document));

    return this.repository.save(
      {
        ...(existing ?? {}),
        corporateName: request.corporateName,
        tradeName: request.tradeName,
        document: request.document,
        documentType: request.documentType,
        email: request.email,
        primaryPhone: request.primaryPhone,
        secondaryPhone: request.secondaryPhone,
        address: request.address,
        addressNumber: request.addressNumber,
        zipCode: request.zipCode,
        neighborhood: request.neighborhood,
        slug,
        city,
        isActive: request.isActive,
        image: request.imageId === null ? null : { id: request.imageId },
        availableLanguageLinks: request.languageLinks.map((link) => ({
          ...(link.id === null ? {} : { id: link.id }),
          language: { id: link.languageId },
        })),
      },
      manager,
    );
  }

  async synchronizeMutation(): Promise<void> {
    await this.sessionSynchronizationService.synchronizeAll();
  }

  private async getEntityByIdOrFail(id: number): Promise<Client> {
    const client = await this.repository.findById(id);

    if (!client) {
      throw new NotFoundException(this.i18n.t('errors.clients.client_not_found'));
    }

    return client;
  }

  private createSlugBase(tradeName: string, document: string): string {
    const normalizedName = this.normalizeSlugValue(tradeName)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const normalizedDocument = this.normalizeSlugValue(document).replace(/[^a-z0-9]/g, '');
    const readableName = normalizedName || 'client';

    if (!normalizedDocument) {
      return readableName.slice(0, CLIENT_SLUG_MAX_LENGTH).replace(/-+$/g, '');
    }

    const maxNameLength = CLIENT_SLUG_MAX_LENGTH - normalizedDocument.length - 1;
    const name = readableName.slice(0, maxNameLength).replace(/-+$/g, '') || 'client';

    return `${name}-${normalizedDocument}`;
  }

  private normalizeSlugValue(value: string): string {
    return value
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }

  private withSlugSequence(base: string, sequence: number): string {
    if (sequence === 1) {
      return base;
    }

    const suffix = `-${sequence}`;
    const truncatedBase = base.slice(0, CLIENT_SLUG_MAX_LENGTH - suffix.length).replace(/-+$/g, '');

    return `${truncatedBase}${suffix}`;
  }

  private toResponse(client: Client) {
    return {
      id: client.id,
      corporateName: client.corporateName,
      tradeName: client.tradeName,
      document: client.document,
      isActive: client.isActive,
      documentType: client.documentType,
      email: client.email,
      primaryPhone: client.primaryPhone,
      secondaryPhone: client.secondaryPhone,
      address: client.address,
      addressNumber: client.addressNumber,
      zipCode: client.zipCode,
      neighborhood: client.neighborhood,
      slug: client.slug,
      cityId: client.city?.id ?? null,
      imageId: client.image?.id ?? null,
      languageLinks: client.availableLanguageLinks.map((link) => ({
        id: link.id,
        languageId: link.language.id,
      })),
    };
  }

  private toCityOptionLabel(
    city: Awaited<ReturnType<CitiesService['listEntities']>>[0][number],
    locale: string,
  ): string {
    const cityName = resolveTranslation(city.translations, locale, 'name');
    const stateName = resolveTranslation(city.state.translations, locale, 'name');
    const countryName = resolveTranslation(city.state.country.translations, locale, 'name');

    return `${cityName} - ${stateName}, ${countryName}`;
  }
}
