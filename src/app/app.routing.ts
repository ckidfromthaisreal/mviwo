import { RedirectAuthGuardService } from './services/auth-guard/redirect-auth-guard.service';
import { NgModule, Inject } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AuthGuardService } from './services/auth-guard/auth-guard.service';

import { HomeComponent } from './components/home/home.component';

const authguard = AuthGuardService;

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		canActivate: [
			RedirectAuthGuardService
		],
		children: []
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
				loadChildren: './components/home/home.module#HomeModule',
			},
		]
	}
	,
	{
		path: 'login',
		loadChildren: './components/login/login.module#LoginModule',
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
		loadChildren: './components/not-found/not-found.module#NotFoundModule'
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
export class RoutingModule {
	@Inject(AuthGuardService) static authGuard;

	constructor() {}

	static defaultPage() {
		return RoutingModule.authGuard.defaultPage();
	}
}
