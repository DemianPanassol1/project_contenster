export interface SaveUserRequest {
  id: number | null;
  name: string;
  email: string;
  username: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  password: string | null;
  imageId: number | null;
  userProfileId: number | null;
  profileId: number;
  isActive: boolean;
  isBlocked: boolean;
}

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  username: string;
  isActive: boolean;
  isBlocked: boolean;
}

export interface GetUserByIdResponse extends UserListItem {
  primaryPhone: string;
  secondaryPhone: string | null;
  imageId: number | null;
  clientId: number;
  userProfileId: number;
  profileId: number;
  lastLoginAt: string | null;
}

export interface SaveCurrentUserProfileRequest {
  name: string;
  email: string;
  username: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  imageId: number | null;
}

export interface GetCurrentUserProfileResponse extends SaveCurrentUserProfileRequest {
  id: number;
}

export interface ChangeCurrentUserPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeCurrentUserPasswordResponse {
  passwordChanged: boolean;
}
