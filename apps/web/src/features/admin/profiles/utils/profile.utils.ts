import type {
  GetProfileByIdResponse,
  ProfilePermissionAssignmentResponse,
  SaveProfileRequest,
  SessionLanguage,
} from '@contenster/shared';

import { generateID } from '@/utils';

export interface ProfilePermissionFormItem {
  actionIds: number[];
  functionalityId: number | null;
  permissionIdsByActionId: Record<number, number | null>;
  rowId: string;
}

export interface ProfileFormValues extends Omit<SaveProfileRequest, 'permissions'> {
  isAdmin: boolean;
  permissions: ProfilePermissionFormItem[];
}

const groupProfilePermissions = (
  permissions: ProfilePermissionAssignmentResponse[],
): ProfilePermissionFormItem[] => {
  const permissionsByFunctionality = new Map<number, ProfilePermissionFormItem>();

  for (const permission of permissions) {
    const group = permissionsByFunctionality.get(permission.functionalityId) ?? {
      actionIds: [],
      functionalityId: permission.functionalityId,
      permissionIdsByActionId: {},
      rowId: generateID(),
    };

    group.actionIds.push(permission.actionId);
    group.permissionIdsByActionId[permission.actionId] = permission.id;
    permissionsByFunctionality.set(permission.functionalityId, group);
  }

  return [...permissionsByFunctionality.values()];
};

export const getProfileDefaultValues = (languages: SessionLanguage[]): ProfileFormValues => ({
  id: null,
  isActive: true,
  isAdmin: false,
  permissions: [],
  translations: languages.map((language) => ({
    description: null,
    id: null,
    locale: language.locale,
    name: '',
  })),
});

export const mapProfileContent = (
  content: GetProfileByIdResponse,
  languages: SessionLanguage[],
): ProfileFormValues => ({
  id: content.id,
  isActive: content.isActive,
  isAdmin: content.isAdmin,
  permissions: groupProfilePermissions(content.permissions),
  translations: languages.map((language) => {
    const translation = content.translations.find((item) => item.locale === language.locale);

    return {
      description: translation?.description ?? null,
      id: translation?.id ?? null,
      locale: language.locale,
      name: translation?.name ?? '',
    };
  }),
});

export const mapProfilePayload = (values: ProfileFormValues): SaveProfileRequest => ({
  id: values.id,
  isActive: values.isActive,
  permissions: values.permissions.flatMap((permission) => {
    const functionalityId = permission.functionalityId;

    if (functionalityId === null) {
      return [];
    }

    return permission.actionIds.map((actionId) => ({
      actionId,
      functionalityId,
      id: permission.permissionIdsByActionId[actionId] ?? null,
    }));
  }),
  translations: values.translations.map((translation) => ({
    ...translation,
    description: translation.description?.trim() || null,
    name: translation.name.trim(),
  })),
});
