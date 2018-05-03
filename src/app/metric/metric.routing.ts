import { MetricGalleryComponent } from './metric-gallery/metric-gallery.component';
import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: MetricGalleryComponent
	}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
