import { AuthGuardService } from './services/auth-guard/auth-guard.service';
import { HomeModule } from './home/home.module';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { routing } from './app.routing';
import { LoginModule } from './login/login.module';

import { AuthenticationService } from './services/authentication/authentication.service';

import { AppComponent } from './app.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		routing,
		FlexLayoutModule,

		MaterialModule,
		BrowserAnimationsModule,
		// HomeModule,
		// LoginModule
	],
	providers: [
		AuthenticationService,
		AuthGuardService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
