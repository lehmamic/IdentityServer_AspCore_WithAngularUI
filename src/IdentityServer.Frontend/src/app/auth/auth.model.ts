export interface RedirectDto {
  redirectUrl: string;
}

export interface ErrorDto {
  [index: string]: Array<string>;
}
