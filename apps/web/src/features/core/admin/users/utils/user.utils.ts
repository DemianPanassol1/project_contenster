import type { GetUserByIdResponse, SaveUserRequest } from '@contenster/shared';

export const getUserDefaultValues = (): SaveUserRequest => ({
  email: '',
  id: null,
  imageId: null,
  isActive: true,
  isBlocked: false,
  name: '',
  password: null,
  primaryPhone: '',
  profileId: 0,
  secondaryPhone: null,
  userProfileId: null,
  username: '',
});

export const mapUserContent = (content: GetUserByIdResponse): SaveUserRequest => ({
  email: content.email,
  id: content.id,
  imageId: content.imageId,
  isActive: content.isActive,
  isBlocked: content.isBlocked,
  name: content.name,
  password: null,
  primaryPhone: content.primaryPhone,
  profileId: content.profileId,
  secondaryPhone: content.secondaryPhone,
  userProfileId: content.userProfileId,
  username: content.username,
});
