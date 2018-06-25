import { DatesService } from './services/dates/dates.service';
import { ArraysService } from './services/arrays/arrays.service';
import { MetricGroupCrudService } from './services/crud/metric-group-crud.service';
import { MviwoCardModule } from './components/material/mviwo-card/mviwo-card.module';
import { NotificationService } from './services/notification/notification.service';
import { BrowserService } from './services/browser/browser.service';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { GestureConfig, MatSnackBarModule } from '@angular/material';

import { RoutingModule } from './app.routing';
import { NavigationModule } from './components/navigation/navigation.module';

import { AuthenticationService } from './services/authentication/authentication.service';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';
import { MetricCrudService } from './services/crud/metric-crud.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { MviwoSnackbarComponent } from './components/material/mviwo-snackbar/mviwo-snackbar.component';
import { MviwoSnackbarModule } from './components/material/mviwo-snackbar/mviwo-snackbar.module';

import { DndModule } from 'ng2-dnd';

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
		RoutingModule,

		MatSnackBarModule,
		MviwoSnackbarModule,
		MviwoCardModule,

		DndModule.forRoot(),
	],
	providers: [
		ArraysService,
		AuthenticationService,
		AuthGuardService,
		BrowserService,
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: GestureConfig
		},
		DatesService,
		NotificationService,
		MetricCrudService,
		MetricGroupCrudService,
	],
	entryComponents: [
		MviwoSnackbarComponent
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
