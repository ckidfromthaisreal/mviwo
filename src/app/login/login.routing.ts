import { ModuleWithProviders } from '@angular/core';
import { LoginComponent } from './login.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: LoginComponent
	}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
