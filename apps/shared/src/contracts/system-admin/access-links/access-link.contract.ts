export interface SystemAdminAccessLinkProfile {
  id: number;
  isActive: boolean;
  name: string;
}

export interface SystemAdminAccessLinkClient {
  document: string;
  id: number;
  isActive: boolean;
  profiles: SystemAdminAccessLinkProfile[];
  tradeName: string;
}

export interface SystemAdminAccessLinkUser {
  id: number;
  isSuperuser: boolean;
  name: string;
  username: string;
}

export interface CreateSystemAdminAccessLinkUserRequest {
  name: string;
  email: string;
  username: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  password: string;
  imageId: number | null;
  isActive: boolean;
  isBlocked: boolean;
}

export interface SystemAdminAccessLinkUserDetails {
  clients: SystemAdminAccessLinkClient[];
  links: SystemAdminAccessLinkRequest[];
  user: SystemAdminAccessLinkUser;
}

export interface SystemAdminAccessLinkRequest {
  clientId: number;
  id: number | null;
  profileId: number;
}

export interface ReplaceSystemAdminAccessLinksRequest {
  links: SystemAdminAccessLinkRequest[];
}
