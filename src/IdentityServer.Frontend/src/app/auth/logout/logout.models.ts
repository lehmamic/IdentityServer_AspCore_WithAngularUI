export interface LoggedOutInfoDto {
  showLogoutPrompt: boolean;
  postLogoutRedirectUri: string;
  clientName: string;
  signOutIframeUrl: string;
  automaticRedirectAfterSignOut: boolean;
  logoutId: string;
  triggerExternalSignout: boolean;
  externalAuthenticationScheme: string;
}
