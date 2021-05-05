import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ChartModule } from 'angular-highcharts';
import { LoginComponent } from './components/login/login.component';
import { ValidationService } from './services/validation.service';
import { ControlMessagesComponent } from './components/control-messages/control-messages.component';
import { RegisterComponent } from './components/register/register.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material-module'
import { AuthGuardService } from './services/auth-guard.service';
import { TokenStorageService } from './services/token-storage.service';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { HttpConfigInterceptor} from './interceptor/httpconfig.interceptor';
import { ManageCompanyComponent } from './components/company/manage-company/manage-company.component';
import { UpdateCompanyComponent } from './components/company/update-company/update-company.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SimulationComponent } from './components/simulation/simulation.component';
import { HeaderComponent } from './components/header/header.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { StockDashboardComponent } from './components/stock-dashboard/stock-dashboard.component';
import { environment } from 'src/environments/environment';
import { ChangePasswordComponent } from './components/change-password/change-password.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ControlMessagesComponent,
    RegisterComponent,
    ManageCompanyComponent,
    UpdateCompanyComponent,
    SidebarComponent,
    SimulationComponent,
    HeaderComponent,
    ConfirmDialogComponent,
    StockDashboardComponent,
    ChangePasswordComponent
  ],
  entryComponents: [
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    SocialLoginModule,
    ChartModule,
  ],
  exports: [ControlMessagesComponent],
  providers: [ValidationService, AuthGuardService, TokenStorageService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              environment.clientId
            )
          }
        ]
      } as SocialAuthServiceConfig,
    }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
