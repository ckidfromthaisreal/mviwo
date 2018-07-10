import { DashboardComponent } from './../dashboard/dashboard.component';
import { MetricGalleryComponent } from './../metric/metric-gallery/metric-gallery.component';
import { AuthGuardService } from './../../services/auth-guard/auth-guard.service';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { MetricGroupGalleryComponent } from '../metric-group/metric-group-gallery/metric-group-gallery.component';
import { LocationGalleryComponent } from '../location/location-gallery/location-gallery.component';
import { PatientGalleryComponent } from '../patient/patient-gallery/patient-gallery.component';
import { SessionGalleryComponent } from '../session/session-gallery/session-gallery.component';
import { RecordGalleryComponent } from '../record/record-gallery/record-gallery.component';

const routes: Routes = [
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'metrics',
		// loadChildren: 'app/metric/metric.module#MetricModule',
		component: MetricGalleryComponent,
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'metric-groups',
		component: MetricGroupGalleryComponent,
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'locations',
		component: LocationGalleryComponent,
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'patients',
		component: PatientGalleryComponent,
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'sessions',
		component: SessionGalleryComponent,
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'records',
		component: RecordGalleryComponent,
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'users',
		component: MetricGalleryComponent,
		canActivate: [
			AuthGuardService
		]
	}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
