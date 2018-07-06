import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap, filter } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoggedOutInfoDto, LogoutRequestDto, LogoutInfoDto } from '.';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit, OnDestroy {
  public logoutInfo: LoggedOutInfoDto | LogoutInfoDto;

  private subscriptions: Array<Subscription> = [];

  constructor(private http: HttpClient, private route: ActivatedRoute, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    const subscription = this.route.queryParamMap
      .pipe(
        map(params => params.get('logoutId')),
        flatMap(logoutId => {
          const options = {
            params: new HttpParams().set('logoutId', logoutId),
            withCredentials: true
          };

          return this.http.get<LogoutInfoDto | LoggedOutInfoDto>('https://localhost:5001/api/account/logout', options);
        }))
      .subscribe(dto => this.handleLogout(dto));

    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public logout(): void {
    const dto: LogoutRequestDto = {
      logoutId: this.logoutInfo.logoutId
    };

    const subscription = this.http.post<LoggedOutInfoDto>(
          'https://localhost:5001/api/account/logout',
          dto,
          {
            withCredentials: true
          })
       .subscribe(info => this.handleLogout(info));

       this.subscriptions.push(subscription);
  }

  public sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private handleLogout(dto: LogoutInfoDto | LoggedOutInfoDto): void {
    this.logoutInfo = dto;

    const loggedout = <LoggedOutInfoDto>this.logoutInfo;

    if (loggedout.automaticRedirectAfterSignOut !== undefined
      && loggedout.automaticRedirectAfterSignOut
      && loggedout.postLogoutRedirectUri != null) {
      window.location.href = loggedout.postLogoutRedirectUri;
    }
  }
}
