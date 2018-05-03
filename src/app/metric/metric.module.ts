import { routing } from './metric.routing';
import { MetricGalleryComponent } from './metric-gallery/metric-gallery.component';
import { NgModule } from '@angular/core';

@NgModule({
	imports: [
		// routing
	],
	declarations: [
		MetricGalleryComponent
	],
	exports: [
		MetricGalleryComponent
	],
	providers: [],
	entryComponents: []
})
export class MetricModule {}
