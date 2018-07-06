export interface LogoutRequestDto {
  logoutId: string;
}

export interface LogoutInfoDto {
  logoutId: string;
  showLogoutPrompt: boolean;
}

export interface LoggedOutInfoDto {
  logoutId: string;
  postLogoutRedirectUri: string;
  clientName: string;
  signOutIframeUrl: string;
  automaticRedirectAfterSignOut: boolean;
  triggerExternalSignout: boolean;
  externalAuthenticationScheme: string;
}
