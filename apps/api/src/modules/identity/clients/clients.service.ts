import type { AppOption } from '@contenster/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { LanguagesRepository } from '@/modules/communication/languages/languages.repository';
import { SessionSynchronizationService } from '@/modules/identity/authentication/session/session-synchronization.service';
import { CitiesRepository } from '@/modules/locations/cities/cities.repository';
import type { PaginateRequestDto } from '@/shared/dtos';
import { getCurrentLocale } from '@/shared/i18n';
import { toResponseDto } from '@/shared/responses';
import { resolveTranslation } from '@/shared/translations';

import type { SaveClientRequestDto } from './dto/req/save-client.request.dto';
import { GetClientByIdResponseDto } from './dto/res/get-client-by-id.response.dto';
import type { Client } from './entities/client.entity';
import { ClientsRepository } from './clients.repository';

@Injectable()
export class ClientsService {
  constructor(
    private readonly repository: ClientsRepository,
    private readonly citiesRepository: CitiesRepository,
    private readonly languagesRepository: LanguagesRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async getById(id: number): Promise<GetClientByIdResponseDto> {
    return toResponseDto(
      GetClientByIdResponseDto,
      this.toResponse(await this.getEntityByIdOrFail(id)),
    );
  }

  async listCityOptions(request: PaginateRequestDto): Promise<AppOption[]> {
    const locale = getCurrentLocale();
    const [cities] = await this.citiesRepository.list(request, locale);

    return cities.map((city) => ({
      disabled: !city.isActive,
      label: this.toCityOptionLabel(city, locale),
      metadata: null,
      value: city.id,
    }));
  }

  async listLanguageOptions(request: PaginateRequestDto): Promise<AppOption[]> {
    const [languages] = await this.languagesRepository.list(request);

    return languages.map((language) => ({
      disabled: false,
      label: language.name,
      metadata: { locale: language.languageCode },
      value: language.id,
    }));
  }

  async save(clientId: number, request: SaveClientRequestDto): Promise<GetClientByIdResponseDto> {
    const client = await this.getEntityByIdOrFail(clientId);

    if (request.id !== client.id) {
      throw new BadRequestException(this.i18n.t('errors.clients.client_not_found'));
    }

    if (request.isActive !== client.isActive) {
      throw new ForbiddenException(this.i18n.t('errors.clients.status_change_not_allowed'));
    }

    if (request.languageLinks.length === 0) {
      throw new BadRequestException(this.i18n.t('errors.clients.language_required'));
    }

    const city = request.cityId === null ? null : await this.repository.findCity(request.cityId);

    if (request.cityId !== null && !city) {
      throw new BadRequestException(this.i18n.t('errors.clients.city_not_found'));
    }

    const languageIds = request.languageLinks.map((link) => link.languageId);

    if (new Set(languageIds).size !== languageIds.length) {
      throw new BadRequestException(this.i18n.t('errors.clients.language_duplicate'));
    }

    const languages = await this.repository.findLanguages(languageIds);

    if (languages.length !== languageIds.length) {
      throw new BadRequestException(this.i18n.t('errors.clients.language_not_found'));
    }

    await this.repository.save({
      ...client,
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
      slug: request.slug,
      city,
      isActive: request.isActive,
      image: request.imageId === null ? null : { id: request.imageId },
      availableLanguageLinks: request.languageLinks.map((link) => ({
        ...(link.id === null ? {} : { id: link.id }),
        language: { id: link.languageId },
      })),
    });

    await this.sessionSynchronizationService.synchronizeAll();

    return this.getById(clientId);
  }

  private async getEntityByIdOrFail(id: number): Promise<Client> {
    const client = await this.repository.findById(id);

    if (!client) {
      throw new NotFoundException(this.i18n.t('errors.clients.client_not_found'));
    }

    return client;
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
    city: Awaited<ReturnType<CitiesRepository['list']>>[0][number],
    locale: string,
  ): string {
    const cityName = resolveTranslation(city.translations, locale, 'name');
    const stateName = resolveTranslation(city.state.translations, locale, 'name');
    const countryName = resolveTranslation(city.state.country.translations, locale, 'name');

    return `${cityName} - ${stateName}, ${countryName}`;
  }
}
