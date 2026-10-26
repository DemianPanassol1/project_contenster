import type { GetLanguageByIdResponse, SaveLanguageRequest } from '@contenster/shared';

export const getLanguageDefaultValues = (): SaveLanguageRequest => ({
  iconId: null,
  id: null,
  languageCode: '',
  name: '',
  regionCode: '',
});

export const mapLanguageContent = (content: GetLanguageByIdResponse): SaveLanguageRequest => ({
  iconId: content.iconId,
  id: content.id,
  languageCode: content.languageCode,
  name: content.name,
  regionCode: content.regionCode,
});

export const mapLanguagePayload = (values: SaveLanguageRequest): SaveLanguageRequest => ({
  ...values,
  languageCode: values.languageCode.trim().toLowerCase(),
  name: values.name.trim(),
  regionCode: values.regionCode.trim().toUpperCase(),
});
