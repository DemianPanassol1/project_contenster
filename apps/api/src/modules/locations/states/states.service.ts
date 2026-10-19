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

import { SaveStateRequestDto } from './dto/req/save-state-request.js';
import { GetStateByIdResponseDto } from './dto/res/get-state-by-id-response.js';
import { StateListItemResponseDto } from './dto/res/state-list-item-response.js';
import type { State } from './entities/state.entity';
import { StatesRepository } from './states.repository';

@Injectable()
export class StatesService {
  constructor(
    private readonly repository: StatesRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async list(request: PaginateRequestDto): Promise<PaginatedBody<StateListItemResponseDto>> {
    const locale = getCurrentLocale();
    const [states, total] = await this.repository.list(request, locale);
    return {
      items: toResponseDto(
        StateListItemResponseDto,
        states.map((state) => this.toListItem(state, locale)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getById(id: number): Promise<GetStateByIdResponseDto> {
    const state = await this.getEntityByIdOrFail(id);
    const locale = getCurrentLocale();
    return toResponseDto(GetStateByIdResponseDto, {
      ...this.toListItem(state, locale),
      translations: state.translations.map((translation) => ({
        locale: translation.language.languageCode,
        name: translation.name,
      })),
    });
  }

  async save(request: SaveStateRequestDto): Promise<GetStateByIdResponseDto> {
    const country = await this.repository.findCountryById(request.countryId);
    if (!country) {
      throw new NotFoundException(this.i18n.t('errors.locations.country_not_found'));
    }
    const languages = await this.repository.findLanguagesByCodes(
      request.translations.map((translation) => translation.locale),
    );
    const languageByCode = resolveTranslationLanguages(
      request.translations.map((translation) => translation.locale),
      languages,
    );
    const state = await this.repository.save({
      ...(request.id === null ? {} : { id: request.id }),
      country,
      code: request.code,
      isActive: request.isActive,
      translations: request.translations.map((translation) => ({
        language: languageByCode.get(translation.locale) as Language,
        name: translation.name,
      })),
    });
    return this.getById(state.id);
  }

  async delete(request: DeleteRecordsRequestDto): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const states = await this.repository.findByIds(ids);
    if (states.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.locations.state_not_found'));
    }

    if (await this.repository.hasCities(ids)) {
      throw new ConflictException(this.i18n.t('errors.locations.state_has_cities'));
    }
    return toResponseDto(DeleteRecordsResponseDto, { ids: await this.repository.delete(states) });
  }

  private async getEntityByIdOrFail(id: number): Promise<State> {
    const state = await this.repository.findById(id);
    if (!state) {
      throw new NotFoundException(this.i18n.t('errors.locations.state_not_found'));
    }

    return state;
  }

  private toListItem(state: State, locale: string) {
    return {
      id: state.id,
      countryId: state.country.id,
      countryName: resolveTranslation(state.country.translations, locale, 'name'),
      code: state.code,
      isActive: state.isActive,
      name: resolveTranslation(state.translations, locale, 'name'),
    };
  }
}
