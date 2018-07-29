import { FileReaderService } from './services/file-reader/file-reader.service';
import { UpdateService } from './services/update/update.service';
import { MessengerService } from './services/messenger/messenger.service';
import { SessionCrudService } from './services/crud/session-crud.service';
import { RedirectAuthGuardService } from './services/auth-guard/redirect-auth-guard.service';
import { PipesModule } from './pipes/pipes.module';
import { PatientCrudService } from './services/crud/patient-crud.service';
import { LocationCrudService } from './services/crud/location-crud.service';
import { DatesService } from './services/dates/dates.service';
import { ArraysService } from './services/arrays/arrays.service';
import { MetricGroupCrudService } from './services/crud/metric-group-crud.service';
import { NotificationService } from './services/notification/notification.service';
import { BrowserService } from './services/browser/browser.service';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { GestureConfig, MatSnackBarModule } from '@angular/material';

import { RoutingModule } from './app.routing';
import { NavigationModule } from './components/navigation/navigation.module';

import { AuthenticationService } from './services/authentication/authentication.service';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';
import { MetricCrudService } from './services/crud/metric-crud.service';
import { MongoloidsService } from './services/mongoloids/mongoloids.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { MviwoSnackbarComponent } from './components/material/mviwo-snackbar/mviwo-snackbar.component';
import { MviwoSnackbarModule } from './components/material/mviwo-snackbar/mviwo-snackbar.module';
import { StringsService } from './services/strings/strings.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';


@NgModule({
	declarations: [
		AppComponent,
		HomeComponent
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

		PipesModule,

		ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
	],
	providers: [
		ArraysService,
		AuthenticationService,
		AuthGuardService,
		RedirectAuthGuardService,
		BrowserService,
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: GestureConfig
		},
		DatesService,
		FileReaderService,
		LocationCrudService,
		MessengerService,
		MetricCrudService,
		MetricGroupCrudService,
		MongoloidsService,
		NotificationService,
		PatientCrudService,
		SessionCrudService,
		StringsService,
		UpdateService,
	],
	exports: [
	],
	entryComponents: [
		MviwoSnackbarComponent
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
