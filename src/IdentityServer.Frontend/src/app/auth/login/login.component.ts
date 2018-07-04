import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap } from 'rxjs/operators';
import { LoginInfoDto, ExternalProviderDto } from './login.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginInfo: Observable<LoginInfoDto>;
  public username: string;
  public password: string;
  public rememberLogin: boolean;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.loginInfo = this.route
      .queryParamMap
      .pipe(
        map(params => params.get('returnUrl')),
        flatMap(returnUrl => {
          const options = {
            params: new HttpParams().set('returnUrl', returnUrl),
          };

          return this.http.get<LoginInfoDto>('https://localhost:5001/api/account/login', options);
        })
      );
  }

  public visibleExternalProviders(externalProviders: Array<ExternalProviderDto>): Array<ExternalProviderDto> {
    return externalProviders != null ? externalProviders.filter(p => p.displayName != null && p.displayName !== '') : [];
  }

  public externalLoginUrl(provider: string, returnUrl: string): string {
    return `https://localhost:5001/api/account/externallogin?provider=${provider}&returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  public login(): void {
    this.route
    .queryParamMap
      .pipe(
        map(params => params.get('returnUrl')),
        map(returnUrl => ({ username: this.username, password: this.password, rememberLogin: this.rememberLogin, returnUrl: returnUrl })),
        flatMap(dto => this.http.post(
          'https://localhost:5001/api/account/login',
          dto,
          {
            observe: 'response',
            withCredentials: true
          }))
      )
      .subscribe(resp => {
        window.location.href = (<any>resp.body).redirectUrl;
      }, err => console.error(err));
  }
}
