import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './services/auth-guard/auth-guard.service';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
	{
		path: '',
		// loadChildren: './home/home.module#HomeModule',
		component: HomeComponent,
		canActivate: [
			AuthGuardService
		]
	},
	{
		path: 'login',
		component: LoginComponent,
		// loadChildren: './login/login.module#LoginModule',
	},
	// {
	// 	path: 'metrics',
	// 	loadChildren: './components/metric/metric.module#MetricModule'
	// },
	// {
	// 	path: 'groups',
	// 	loadChildren: './components/metric-group/metric-group.module#MetricGroupModule'
	// },
	// {
	// 	path: 'examinations',
	// 	loadChildren: './components/examination/examination.module#ExaminationModule'
	// }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
