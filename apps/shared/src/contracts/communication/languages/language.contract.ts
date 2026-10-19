export interface SaveLanguageRequest {
  id: number | null;
  name: string;
  languageCode: string;
  regionCode: string;
  iconId: number | null;
}

export interface LanguageListItem {
  id: number;
  name: string;
  languageCode: string;
  regionCode: string;
  iconId: number | null;
}

export type GetLanguageByIdResponse = LanguageListItem;
