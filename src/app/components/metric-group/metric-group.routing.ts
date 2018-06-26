import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MetricGroupGalleryComponent } from './metric-group-gallery/metric-group-gallery.component';

const routes: Routes = [
	{
		path: '',
		component: MetricGroupGalleryComponent
	}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
