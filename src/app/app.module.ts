import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { routing } from './app.routing';

import { AuthenticationService } from './services/authentication.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';


@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		RegistrationComponent
	],
	imports: [
		BrowserModule,
		routing,
		HttpClientModule,
		FormsModule,
	],
	providers: [AuthenticationService],
	bootstrap: [AppComponent]
})
export class AppModule { }
