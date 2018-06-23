import { routing } from './metric.routing';
import { MetricGalleryComponent } from './metric-gallery/metric-gallery.component';
import { NgModule } from '@angular/core';
import { MatIconModule, MatButtonModule, MatMenuModule,
	MatTableModule, MatCheckboxModule, MatSortModule,
	MatFormFieldModule, MatInputModule, MatPaginatorModule,
	MatTooltipModule, MatDialogModule, MatTabsModule,
	MatButtonToggleModule, MatSliderModule, MatSlideToggleModule,
	MatSelectModule, MatListModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MetricFormComponent } from './metric-form/metric-form.component';
import { DndModule } from 'ng2-dnd';

@NgModule({
	imports: [
		// routing
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatTableModule,
		MatCheckboxModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule,
		MatPaginatorModule,
		MatTooltipModule,
		MatDialogModule,
		MatTabsModule,
		MatButtonToggleModule,
		MatSliderModule,
		MatSlideToggleModule,
		MatSelectModule,
		MatListModule,

		DndModule,
	],
	declarations: [
		MetricGalleryComponent,
		MetricFormComponent,
	],
	exports: [
		MetricGalleryComponent,
	],
	providers: [],
	entryComponents: [
		MetricFormComponent,
	]
})
export class MetricModule {}
