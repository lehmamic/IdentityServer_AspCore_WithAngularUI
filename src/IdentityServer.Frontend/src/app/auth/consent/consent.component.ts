import { Component, OnInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ConsentInfoDto } from '.';
import { ScopeDto, ButtonType, ConsentInputDto } from './consent.model';
import { ScopeListItemComponent } from './scope-list-item/scope-list-item.component';
import { RedirectDto } from '..';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss']
})
export class ConsentComponent implements OnInit, OnDestroy {
  @ViewChildren(ScopeListItemComponent) scopes: QueryList<ScopeListItemComponent>;

  public consentInfo: Observable<ConsentInfoDto>;
  public rememberMyDecision: boolean;

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
        })
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
      })
    )
    .subscribe(responseData => {
      window.location.href = responseData.redirectUrl;
    }, err => console.error(err));

    this.subscriptions.push(subscription);
  }
}
