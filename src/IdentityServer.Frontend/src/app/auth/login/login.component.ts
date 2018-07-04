import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public username: string;
  public password: string;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
  }

  ngOnInit() {

  }

  public login(): void {
    this.route
    .queryParamMap
      .pipe(
        map(params => params.get('returnUrl')),
        map(returnUrl => ({ username: this.username, password: this.password, rememberLogin: false, returnUrl: returnUrl })),
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
