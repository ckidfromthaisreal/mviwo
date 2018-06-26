import { DashboardComponent } from './../dashboard/dashboard.component';
import { MetricGalleryComponent } from './../metric/metric-gallery/metric-gallery.component';
import { AuthGuardService } from './../../services/auth-guard/auth-guard.service';
import { HomeComponent } from './home.component';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { MetricGroupGalleryComponent } from '../metric-group/metric-group-gallery/metric-group-gallery.component';

const routes: Routes = [
	// {
	// 	path: '',
	// 	pathMatch: 'full',
	// 	redirectTo: 'metrics',
	// 	// canActivate: [
	// 	// 	AuthGuardService
	// 	// ],
	// },
	// {
	// 	path: '',
	// 	component: HomeComponent,
	// 	// canActivate: [
	// 	// 	AuthGuardService
	// 	// ],
	// },
	{
		path: 'news',
		component: DashboardComponent, // <<<---------
		canActivate: [
			AuthGuardService
		]
	},
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
		component: MetricGroupGalleryComponent, // <<<--------
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'sessions',
		component: MetricGroupGalleryComponent, // <<<--------
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'records',
		component: MetricGalleryComponent, // <<<--------
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'users',
		component: MetricGalleryComponent, // <<<-------
		canActivate: [
			AuthGuardService
		]
	}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
