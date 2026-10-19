import type { PaginatedBody } from '@contenster/shared';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import type { Language } from '@/modules/communication/languages/entities/language.entity';
import {
  type DeleteRecordsRequestDto,
  DeleteRecordsResponseDto,
  normalizeDeleteRecordIds,
  type PaginateRequestDto,
} from '@/shared/dtos';
import { getCurrentLocale } from '@/shared/i18n';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses/response.helper';
import { resolveTranslation, resolveTranslationLanguages } from '@/shared/translations';

import { SaveCityRequestDto } from './dto/req/save-city-request.js';
import { CityListItemResponseDto } from './dto/res/city-list-item-response.js';
import { GetCityByIdResponseDto } from './dto/res/get-city-by-id-response.js';
import type { City } from './entities/city.entity';
import { CitiesRepository } from './cities.repository';

@Injectable()
export class CitiesService {
  constructor(
    private readonly repository: CitiesRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async list(request: PaginateRequestDto): Promise<PaginatedBody<CityListItemResponseDto>> {
    const locale = getCurrentLocale();
    const [cities, total] = await this.repository.list(request, locale);

    return {
      items: toResponseDto(
        CityListItemResponseDto,
        cities.map((city) => this.toListItem(city, locale)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getById(id: number): Promise<GetCityByIdResponseDto> {
    const city = await this.getEntityByIdOrFail(id);
    const locale = getCurrentLocale();

    return toResponseDto(GetCityByIdResponseDto, {
      ...this.toListItem(city, locale),
      translations: city.translations.map((translation) => ({
        id: translation.id,
        locale: translation.language.languageCode,
        name: translation.name,
      })),
    });
  }

  async save(request: SaveCityRequestDto): Promise<GetCityByIdResponseDto> {
    const state = await this.repository.findStateById(request.stateId);
    if (!state) {
      throw new NotFoundException(this.i18n.t('errors.locations.state_not_found'));
    }

    const languages = await this.repository.findLanguagesByCodes(
      request.translations.map((translation) => translation.locale),
    );
    const languageByCode = resolveTranslationLanguages(
      request.translations.map((translation) => translation.locale),
      languages,
    );
    const city = await this.repository.save({
      ...(request.id === null ? {} : { id: request.id }),
      state,
      ibgeCode: request.ibgeCode,
      isActive: request.isActive,
      translations: request.translations.map((translation) => ({
        ...(translation.id === null ? {} : { id: translation.id }),
        language: languageByCode.get(translation.locale) as Language,
        name: translation.name,
      })),
    });

    return this.getById(city.id);
  }

  async delete(request: DeleteRecordsRequestDto): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const cities = await this.repository.findByIds(ids);
    if (cities.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.locations.city_not_found'));
    }

    if (await this.repository.hasClients(ids)) {
      throw new ConflictException(this.i18n.t('errors.locations.city_has_clients'));
    }

    return toResponseDto(DeleteRecordsResponseDto, { ids: await this.repository.delete(cities) });
  }

  private async getEntityByIdOrFail(id: number): Promise<City> {
    const city = await this.repository.findById(id);
    if (!city) {
      throw new NotFoundException(this.i18n.t('errors.locations.city_not_found'));
    }

    return city;
  }

  private toListItem(city: City, locale: string) {
    const state = city.state;
    const country = state.country;

    return {
      id: city.id,
      stateId: state.id,
      stateCode: state.code,
      stateName: resolveTranslation(state.translations, locale, 'name'),
      countryId: country.id,
      countryName: resolveTranslation(country.translations, locale, 'name'),
      ibgeCode: city.ibgeCode,
      isActive: city.isActive,
      name: resolveTranslation(city.translations, locale, 'name'),
    };
  }
}
