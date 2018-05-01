import {
	Routes,
	RouterModule
} from '@angular/router';
import {
	ModuleWithProviders
} from '@angular/core';
import {
	RegistrationComponent
} from './registration/registration.component';

const routes: Routes = [{
		path: '',
		pathMatch: 'full',
		component: RegistrationComponent
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
