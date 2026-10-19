export interface ProfileTranslationInput {
  locale: string;
  name: string;
  description: string | null;
}

export type ProfileTranslationResponse = ProfileTranslationInput;

export interface SaveProfileRequest {
  id: number | null;
  isActive: boolean;
  translations: ProfileTranslationInput[];
  permissionIds: number[];
}

export interface ProfileListItem {
  id: number;
  isActive: boolean;
  name: string;
  description: string | null;
}

export interface GetProfileByIdResponse extends ProfileListItem {
  translations: ProfileTranslationResponse[];
  permissionIds: number[];
}
