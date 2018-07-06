import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from '../../node_modules/rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'app';
  result$: Observable<any>;

  constructor(public oidcSecurityService: OidcSecurityService, private http: HttpClient) {
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

  callApi() {
    if (this.oidcSecurityService !== undefined) {
      const token = this.oidcSecurityService.getToken();
      if (token !== '') {
          const tokenValue = `Bearer ${token}`;
          const options = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': tokenValue
            }),
          };

          this.result$ = this.http.get<any>('https://localhost:5002/api/identity', options)
              .pipe(map(data => JSON.stringify(data, null, 2)));
      }
    } else {
        console.error('OidcSecurityService undefined: NO auth header!');
    }
  }

  private doCallbackLogicIfRequired() {
      if (window.location.hash) {
          this.oidcSecurityService.authorizedCallback();
      }
  }
}
