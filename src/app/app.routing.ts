import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AuthGuardService } from './services/auth-guard/auth-guard.service';

import { HomeComponent } from './home/home.component';

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'dashboard',
		canActivate: [
			AuthGuardService
		],
	}
	,
	{
		path: '',
		component: HomeComponent,
		canActivate: [
			AuthGuardService
		],
		children: [
			{
				path: '',
				loadChildren: './home/home.module#HomeModule',
			},
		]
	}
	,
	{
		path: 'login',
		loadChildren: './login/login.module#LoginModule',
	}

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
	, {
		path: '**',
		loadChildren: './not-found/not-found.module#NotFoundModule'
	}
];

@NgModule({
	imports: [
		CommonModule,
		BrowserModule,
		RouterModule.forRoot(routes)
	],
	exports: [

	],
})
export class RoutingModule {}
