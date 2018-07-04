export interface LoginInfoDto {
  username: string;
  returnUrl: string;
  allowRememberLogin: boolean;
  enableLocalLogin: boolean;
  externalProviders: Array<ExternalProviderDto>;
  visibleExternalProviders: Array<ExternalProviderDto>;
  isExternalLoginOnly: boolean;
  externalLoginScheme: string;
}

export interface ExternalProviderDto {
  displayName: string;
  authenticationScheme: string;
}
