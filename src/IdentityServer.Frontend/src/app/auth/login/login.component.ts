import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap } from 'rxjs/operators';
import { Http } from '@angular/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public username: string;
  public password: string;
  private returnUrl: string;

  constructor(private httpClient: HttpClient, private http: Http, private route: ActivatedRoute, private location: Location) {
  }

  ngOnInit() {

  }

  public login(): void {
    this.route
    .queryParamMap
      .pipe(
        map(params => params.get('returnUrl')),
        // map(returnUrl => returnUrl.replace('https://localhost:5001', '')),
        map(returnUrl => {
          const customReturnUrl = this.getReturnUrlFromUrlQuery();
          return ({ username: this.username, password: this.password, rememberLogin: false, returnUrl: returnUrl });
        }),
        flatMap(dto => this.httpClient.post(
          'https://localhost:5001/api/account/login',
          dto,
          { observe: 'response', withCredentials: true }))
      )
      .subscribe(resp => {
        // const redirectUrl = `https://localhost:5001${decodeURI(decodeURI((<any>resp.body).returnUrl))}`;
        // (<any>window.location) = redirectUrl;
        window.location.href = (<any>resp.body).returnUrl;
      }, err => console.error(err));
  }

  private getReturnUrlFromUrlQuery(): string {
    let returnUrl = '';
    const pattern = 'returnUrl=';
    const input = window.location.href;

    if (input.indexOf(pattern) >= 0) {
      returnUrl = input.substr(input.indexOf(pattern) + pattern.length, input.length);
    }

    return returnUrl;
  }
}
