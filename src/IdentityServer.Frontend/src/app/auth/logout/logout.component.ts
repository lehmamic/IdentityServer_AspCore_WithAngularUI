import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { LoggedOutInfoDto, LogoutRequestDto, LogoutInfoDto } from '.';
import { Subscription, Observable, of } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ErrorDto } from '../auth.model';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit, OnDestroy {
  public logoutInfo: LoggedOutInfoDto | LogoutInfoDto;
  public errors: ErrorDto;

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
        }),
        catchError(error => this.handleError<LogoutInfoDto | LoggedOutInfoDto>(error)))
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
       .pipe(catchError(error => this.handleError<LoggedOutInfoDto>(error)))
       .subscribe(info => this.handleLogout(info));

       this.subscriptions.push(subscription);
  }

  public sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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

  private handleLogout(dto: LogoutInfoDto | LoggedOutInfoDto): void {
    this.logoutInfo = dto;

    const loggedout = <LoggedOutInfoDto>this.logoutInfo;

    if (loggedout.automaticRedirectAfterSignOut !== undefined
      && loggedout.automaticRedirectAfterSignOut
      && loggedout.postLogoutRedirectUri != null) {
      window.location.href = loggedout.postLogoutRedirectUri;
    }
  }

  private handleError<T>(error: HttpErrorResponse): Observable<T> {
    if (error.status === 400) {
      this.errors = error.error;
    } else {
      this.errors = { '': ['Oops and unknown error occured.'] };
    }

    return of();
  }
}
