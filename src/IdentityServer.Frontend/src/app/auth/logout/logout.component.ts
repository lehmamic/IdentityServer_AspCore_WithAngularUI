import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap, filter } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoggedOutInfoDto } from '.';
import { Observable, Subscription } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit, OnDestroy {
  public loggedOutInfo: LoggedOutInfoDto;

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

          return this.http.get<LoggedOutInfoDto>('https://localhost:5001/api/account/logout', options);
        }))
      .subscribe(dto => this.handleLogoutInfo(dto));

    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public logout(): void {
    const subscription = this.http.post<LoggedOutInfoDto>(
          'https://localhost:5001/api/account/logout',
          this.loggedOutInfo,
          {
            withCredentials: true
          })
       .subscribe(dto => this.handleLogoutInfo(dto));

       this.subscriptions.push(subscription);
  }

  public sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private handleLogoutInfo(loggedOutInfoDto: LoggedOutInfoDto): void {
    this.loggedOutInfo = loggedOutInfoDto;

    if (this.loggedOutInfo.automaticRedirectAfterSignOut && this.loggedOutInfo.postLogoutRedirectUri != null) {
      window.location.href = this.loggedOutInfo.postLogoutRedirectUri;
    }
  }
}
