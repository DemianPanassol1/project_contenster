export interface SystemAdminAccessLinkRequest {
  clientId: number;
  profileId: number;
}

export interface ReplaceSystemAdminAccessLinksRequest {
  links: SystemAdminAccessLinkRequest[];
}
