import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  AuthModule,
  OidcSecurityService,
  OpenIDImplicitFlowConfiguration,
  AuthWellKnownEndpoints
} from 'angular-auth-oidc-client';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AuthModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(public oidcSecurityService: OidcSecurityService) {
    const openIDImplicitFlowConfiguration = new OpenIDImplicitFlowConfiguration();

    openIDImplicitFlowConfiguration.stsServer = 'https://localhost:5001';
    openIDImplicitFlowConfiguration.redirect_url = 'http://localhost:4201';
    // tslint:disable-next-line:max-line-length
    // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified by the iss (issuer) Claim as an audience.
    // tslint:disable-next-line:max-line-length
    // The ID Token MUST be rejected if the ID Token d…oes not list the Client as a valid audience, or if it contains additional audiences not trusted by the Client.
    openIDImplicitFlowConfiguration.client_id = 'singleapp';
    openIDImplicitFlowConfiguration.response_type = 'id_token token';
    openIDImplicitFlowConfiguration.scope = 'openid profile api1';
    openIDImplicitFlowConfiguration.post_logout_redirect_uri = 'http://localhost:4201/Unauthorized';
    openIDImplicitFlowConfiguration.start_checksession = false;
    openIDImplicitFlowConfiguration.silent_renew = false;
    openIDImplicitFlowConfiguration.silent_renew_url = 'http://localhost:5001/silent-renew.html';
    openIDImplicitFlowConfiguration.post_login_route = '/';
    // HTTP 403
    openIDImplicitFlowConfiguration.forbidden_route = '/Forbidden';
    // HTTP 401
    openIDImplicitFlowConfiguration.unauthorized_route = '/Unauthorized';
    openIDImplicitFlowConfiguration.log_console_warning_active = true;
    openIDImplicitFlowConfiguration.log_console_debug_active = true;
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    openIDImplicitFlowConfiguration.max_id_token_iat_offset_allowed_in_seconds = 10;

    const authWellKnownEndpoints = new AuthWellKnownEndpoints();
    authWellKnownEndpoints.issuer = 'https://localhost:5001';

    authWellKnownEndpoints.jwks_uri = 'https://localhost:5001/.well-known/openid-configuration/jwks';
    authWellKnownEndpoints.authorization_endpoint = 'https://localhost:5001/connect/authorize';
    authWellKnownEndpoints.token_endpoint = 'https://localhost:5001/connect/token';
    authWellKnownEndpoints.userinfo_endpoint = 'https://localhost:5001/connect/userinfo';
    authWellKnownEndpoints.end_session_endpoint = 'https://localhost:5001/connect/endsession';
    authWellKnownEndpoints.check_session_iframe = 'https://localhost:5001/connect/checksession';
    authWellKnownEndpoints.revocation_endpoint = 'https://localhost:5001/connect/revocation';
    authWellKnownEndpoints.introspection_endpoint = 'https://localhost:5001/connect/introspect';

    this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration, authWellKnownEndpoints);
  }
}
