export interface SaveProfilePermissionRequest {
  id: number | null;
  profileId: number;
  functionalityId: number;
  actionId: number;
}

export interface ProfilePermissionListItem {
  id: number;
  profileId: number;
  functionalityId: number;
  actionId: number;
}

export type GetProfilePermissionByIdResponse = ProfilePermissionListItem;
