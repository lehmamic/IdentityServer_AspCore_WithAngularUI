import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap, catchError } from 'rxjs/operators';
import { LoginInfoDto, ExternalProviderDto, LoginRequestDto } from './login.model';
import { Observable, of, Subscription } from 'rxjs';
import { RedirectDto, ErrorDto } from '../auth.model';
import { Key } from 'protractor';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  public loginInfo$: Observable<LoginInfoDto>;
  public errors: ErrorDto;
  public username: string;
  public password: string;
  public rememberLogin: boolean;

  private subscriptions: Array<Subscription> = [];

  constructor(private http: HttpClient, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.loginInfo$ = this.route
      .queryParamMap
      .pipe(
        map(params => params.get('returnUrl')),
        flatMap(returnUrl => {
          const options = {
            params: new HttpParams().set('returnUrl', returnUrl),
          };

          return this.http.get<LoginInfoDto>('https://localhost:5001/api/account/login', options);
        }),
        catchError(error => this.handleError<LoginInfoDto>(error))
      );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public getErrorsMessages(): Array<string> {
    const messages: Array<string> = [];

    if (this.errors) {
      for (const msgs of Object.keys(this.errors).map(key => this.errors[key])) {
        for (const msg of msgs) {
          messages.push(msg);
        }
      }
    }

    return messages;
  }

  public visibleExternalProviders(externalProviders: Array<ExternalProviderDto>): Array<ExternalProviderDto> {
    return externalProviders != null ? externalProviders.filter(p => p.displayName != null && p.displayName !== '') : [];
  }

  public externalLoginUrl(provider: string, returnUrl: string): string {
    return `https://localhost:5001/api/account/externallogin?provider=${provider}&returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  public login(): void {
    const subscription = this.route
      .queryParamMap
      .pipe(
        map(params => params.get('returnUrl')),
        map(returnUrl =>
          (<LoginRequestDto>
          {
            username: this.username,
            password: this.password,
            rememberLogin: this.rememberLogin,
            returnUrl: returnUrl
          })),
        flatMap(dto => this.http.post<RedirectDto>(
          'https://localhost:5001/api/account/login',
          dto,
          {
            withCredentials: true
          })),
          catchError(error => this.handleError<RedirectDto>(error))
      )
      .subscribe(data => {
        window.location.href = data.redirectUrl;
      }, err => console.error(err));

      this.subscriptions.push(subscription);
  }

  private handleError<T>(error: HttpErrorResponse): Observable<T> {
    if (error.status === 400) {
      this.errors = error.error;
    } else if (error.status === 401) {
      this.errors = { '': ['Invalid username or password.'] };
    }
    return of();
  }
}
