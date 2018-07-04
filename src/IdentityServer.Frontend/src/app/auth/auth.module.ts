import { NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login';
import { LogoutComponent } from './logout';
import { ConsentComponent } from './consent/consent.component';
import { ScopeListItemComponent } from './consent/scope-list-item/scope-list-item.component';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    AuthRoutingModule
  ],
  declarations: [LoginComponent, LogoutComponent, ConsentComponent, ScopeListItemComponent]
})
export class AuthModule { }
