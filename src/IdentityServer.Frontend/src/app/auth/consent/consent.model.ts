export type ButtonType = 'yes' | 'no-out';

export interface ConsentInputDto {
  button: ButtonType;
  scopesConsented: Array<string>;
  rememberConsent: boolean;
  returnUrl: string;
}

export interface ConsentInfoDto {
  clientName: string;
  clientUrl: string;
  clientLogoUrl: string;
  allowRememberConsent: boolean;
  identityScopes: Array<ScopeDto>;
  resourceScopes: Array<ScopeDto>;
  returnUrl: string;
}

export interface ScopeDto {
 name: string;
 displayName: string;
 description: string;
 emphasize: boolean;
 required: boolean;
 checked: boolean;
}
