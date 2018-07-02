import { Component, OnDestroy } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'app';

  constructor(public oidcSecurityService: OidcSecurityService) {
    if (this.oidcSecurityService.moduleSetup) {
      this.doCallbackLogicIfRequired();
    } else {
        this.oidcSecurityService.onModuleSetup.subscribe(() => {
            this.doCallbackLogicIfRequired();
        });
    }
  }

  ngOnDestroy(): void {
    this.oidcSecurityService.onModuleSetup.unsubscribe();
  }

  login() {
      this.oidcSecurityService.authorize();
  }

  logout() {
      this.oidcSecurityService.logoff();
  }

  private doCallbackLogicIfRequired() {
      if (window.location.hash) {
          this.oidcSecurityService.authorizedCallback();
      }
  }
}
