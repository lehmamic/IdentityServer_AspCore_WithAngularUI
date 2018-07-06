import { Component, OnInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap, catchError } from 'rxjs/operators';
import { Observable, Subscription, of } from 'rxjs';
import { ConsentInfoDto } from '.';
import { ButtonType } from './consent.model';
import { ScopeListItemComponent } from './scope-list-item/scope-list-item.component';
import { RedirectDto, ErrorDto } from '..';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss']
})
export class ConsentComponent implements OnInit, OnDestroy {
  @ViewChildren(ScopeListItemComponent) scopes: QueryList<ScopeListItemComponent>;

  public consentInfo: Observable<ConsentInfoDto>;
  public rememberMyDecision: boolean;
  public errors: ErrorDto;

  private subscriptions: Array<Subscription> = [];

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.consentInfo = this.route.queryParamMap
      .pipe(
        map(params => params.get('returnUrl')),
        flatMap(returnUrl => {
          const options = {
            params: new HttpParams().set('returnUrl', returnUrl),
            withCredentials: true
          };

          return this.http.get<ConsentInfoDto>('https://localhost:5001/api/consent', options);
        }),
        catchError(error => this.handleError<ConsentInfoDto>(error))
      );
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public sendConsent(button: ButtonType): void {
    const subscription = this.consentInfo.pipe(
      map(info =>
      ({
        button: button,
        scopesConsented: this.scopes.filter(s => s.scope.checked || s.scope.required).map(s => s.scope.name),
        rememberConsent: this.rememberMyDecision,
        returnUrl: info.returnUrl,
      })),
      flatMap(dto => {
        const options = { withCredentials: true };

        return this.http.post<RedirectDto>('https://localhost:5001/api/consent', dto, options);
      }),
      catchError(error => this.handleError<RedirectDto>(error))
    )
    .subscribe(responseData => {
      window.location.href = responseData.redirectUrl;
    }, err => console.error(err));

    this.subscriptions.push(subscription);
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

  private handleError<T>(error: HttpErrorResponse): Observable<T> {
    if (error.status === 400) {
      this.errors = error.error;
    } else {
      this.errors = { '': ['Oops and unknown error occured.'] };
    }

    return of();
  }
}
