export interface LoginInfoDto {
  username: string;
  returnUrl: string;
  allowRememberLogin: boolean;
  enableLocalLogin: boolean;
  externalProviders: Array<ExternalProviderDto>;
}

export interface ExternalProviderDto {
  displayName: string;
  authenticationScheme: string;
}
