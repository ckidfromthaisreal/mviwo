import { BrowserService } from './services/browser/browser.service';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { GestureConfig } from '@angular/material';

import { RoutingModule } from './app.routing';
import { NavigationModule } from './navigation/navigation.module';

import { AuthenticationService } from './services/authentication/authentication.service';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
	],
	imports: [
		BrowserAnimationsModule,
		FormsModule,
		HttpClientModule,
		NavigationModule,
		RouterModule,
		RoutingModule
	],
	providers: [
		AuthenticationService,
		AuthGuardService,
		BrowserService,
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: GestureConfig
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
