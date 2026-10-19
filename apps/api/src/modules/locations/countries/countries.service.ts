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

import type { SaveCountryRequestDto } from './dto/req/save-country-request.js';
import { CountryListItemResponseDto } from './dto/res/country-list-item-response.js';
import { GetCountryByIdResponseDto } from './dto/res/get-country-by-id-response.js';
import type { Country } from './entities/country.entity';
import { CountriesRepository } from './countries.repository';

@Injectable()
export class CountriesService {
  constructor(
    private readonly repository: CountriesRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async list(request: PaginateRequestDto): Promise<PaginatedBody<CountryListItemResponseDto>> {
    const locale = getCurrentLocale();
    const [countries, total] = await this.repository.list(request, locale);

    return {
      items: toResponseDto(
        CountryListItemResponseDto,
        countries.map((country) => this.toListItem(country, locale)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getById(id: number): Promise<GetCountryByIdResponseDto> {
    const country = await this.getEntityByIdOrFail(id);
    const locale = getCurrentLocale();

    return toResponseDto(GetCountryByIdResponseDto, {
      ...this.toListItem(country, locale),
      phoneCode: country.phoneCode,
      currencyCode: country.currencyCode,
      locale: country.locale,
      translations: country.translations.map((translation) => ({
        locale: translation.language.languageCode,
        name: translation.name,
      })),
    });
  }

  async save(request: SaveCountryRequestDto): Promise<GetCountryByIdResponseDto> {
    const languages = await this.repository.findLanguagesByCodes(
      request.translations.map((translation) => translation.locale),
    );
    const languageByCode = resolveTranslationLanguages(
      request.translations.map((translation) => translation.locale),
      languages,
    );
    const country = await this.repository.save({
      ...(request.id === null ? {} : { id: request.id }),
      iso2: request.iso2,
      iso3: request.iso3,
      phoneCode: request.phoneCode,
      currencyCode: request.currencyCode,
      locale: request.locale,
      isActive: request.isActive,
      translations: request.translations.map((translation) => ({
        language: languageByCode.get(translation.locale) as Language,
        name: translation.name,
      })),
    });
    return this.getById(country.id);
  }

  async delete(request: DeleteRecordsRequestDto): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const countries = await this.repository.findByIds(ids);
    if (countries.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.locations.country_not_found'));
    }

    if (await this.repository.hasStates(ids)) {
      throw new ConflictException(this.i18n.t('errors.locations.country_has_states'));
    }
    return toResponseDto(DeleteRecordsResponseDto, {
      ids: await this.repository.delete(countries),
    });
  }

  private async getEntityByIdOrFail(id: number): Promise<Country> {
    const country = await this.repository.findById(id);
    if (!country) {
      throw new NotFoundException(this.i18n.t('errors.locations.country_not_found'));
    }

    return country;
  }

  private toListItem(country: Country, locale: string) {
    return {
      id: country.id,
      iso2: country.iso2,
      iso3: country.iso3,
      isActive: country.isActive,
      name: resolveTranslation(country.translations, locale, 'name'),
    };
  }
}
