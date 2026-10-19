export interface ProfileTranslationInput {
  id: number | null;
  locale: string;
  name: string;
  description: string | null;
}

export interface ProfileTranslationResponse {
  id: number;
  locale: string;
  name: string;
  description: string | null;
}

export interface ProfilePermissionAssignmentInput {
  id: number | null;
  functionalityId: number;
  actionId: number;
}

export interface ProfilePermissionAssignmentResponse {
  id: number;
  functionalityId: number;
  actionId: number;
}

export interface SaveProfileRequest {
  id: number | null;
  isActive: boolean;
  translations: ProfileTranslationInput[];
  permissions: ProfilePermissionAssignmentInput[];
}

export interface ProfileListItem {
  id: number;
  isActive: boolean;
  name: string;
  description: string | null;
}

export interface GetProfileByIdResponse extends ProfileListItem {
  translations: ProfileTranslationResponse[];
  permissions: ProfilePermissionAssignmentResponse[];
}
